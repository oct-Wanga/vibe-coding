from __future__ import annotations

import asyncio
import logging
from typing import Any

from app.core.config import settings
from app.services.store import OutboxEvent, store

logger = logging.getLogger(__name__)


class OutboxRelay:
    def __init__(self) -> None:
        self._task: asyncio.Task[None] | None = None
        self._stop_event = asyncio.Event()

    async def start(self) -> None:
        if not settings.outbox_enabled or not settings.outbox_relay_enabled:
            logger.info(
                "outbox relay disabled (outbox_enabled=%s, relay_enabled=%s)",
                settings.outbox_enabled,
                settings.outbox_relay_enabled,
            )
            return
        if self._task and not self._task.done():
            return
        self._stop_event = asyncio.Event()
        self._task = asyncio.create_task(self._run_loop())
        logger.info("outbox relay started")

    async def stop(self) -> None:
        if not self._task:
            return
        self._stop_event.set()
        await self._task
        self._task = None
        logger.info("outbox relay stopped")

    def status(self) -> dict[str, str | bool | None]:
        if self._task is None:
            return {
                "enabled": settings.outbox_enabled and settings.outbox_relay_enabled,
                "running": False,
                "done": None,
                "last_error": None,
            }
        last_error: str | None = None
        if self._task.done():
            try:
                exc = self._task.exception()
            except Exception as err:  # pragma: no cover - defensive
                exc = err
            if exc is not None:
                last_error = str(exc)
        return {
            "enabled": settings.outbox_enabled and settings.outbox_relay_enabled,
            "running": not self._task.done(),
            "done": self._task.done(),
            "last_error": last_error,
        }

    async def _run_loop(self) -> None:
        producer = None
        while not self._stop_event.is_set():
            try:
                if producer is None:
                    producer = self._build_producer()
                    logger.info("outbox relay producer connected")

                batch = store.list_relay_candidate_outbox_events(
                    limit=settings.outbox_relay_batch_size,
                    max_attempts=settings.outbox_relay_max_attempts,
                )
                if not batch:
                    await asyncio.sleep(settings.outbox_relay_poll_interval_seconds)
                    continue

                for event in batch:
                    if self._stop_event.is_set():
                        break
                    await self._publish_event(producer, event)
            except Exception:
                logger.exception("outbox relay loop error; retrying")
                if producer is not None:
                    await _close_producer(producer)
                    producer = None
                await asyncio.sleep(settings.outbox_relay_poll_interval_seconds)
            else:
                await asyncio.sleep(settings.outbox_relay_poll_interval_seconds)

        if producer is not None:
            await _close_producer(producer)

    def _build_producer(self):
        from kafka import KafkaProducer

        return KafkaProducer(
            bootstrap_servers=[server.strip() for server in settings.kafka_bootstrap_servers.split(",") if server.strip()],
            acks="all",
            retries=10,
            client_id=settings.kafka_client_id,
            value_serializer=lambda payload: _serialize_payload(payload),
            key_serializer=lambda key: str(key).encode("utf-8"),
        )

    async def _publish_event(self, producer, event: OutboxEvent) -> None:
        try:
            future = await asyncio.to_thread(
                producer.send,
                event["topic"],
                key=event["event_key"],
                value=event["payload"],
            )
            await asyncio.to_thread(future.get, timeout=10)
            store.mark_outbox_published(event["id"])
        except Exception as exc:  # pragma: no cover - network branch
            store.mark_outbox_failed(event["id"], str(exc))
            logger.exception("failed to publish outbox event id=%s topic=%s", event["id"], event["topic"])


def _serialize_payload(payload: Any) -> bytes:
    import json

    return json.dumps(payload, ensure_ascii=False).encode("utf-8")


async def _close_producer(producer) -> None:
    await asyncio.to_thread(producer.flush)
    await asyncio.to_thread(producer.close)


outbox_relay = OutboxRelay()
