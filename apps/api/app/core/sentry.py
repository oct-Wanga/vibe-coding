from __future__ import annotations

import logging
from typing import Any

try:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.logging import LoggingIntegration
except ModuleNotFoundError:  # pragma: no cover
    sentry_sdk = None
    FastApiIntegration = None
    LoggingIntegration = None

from app.core.config import settings


def _before_send_transaction(event: dict[str, Any], _: dict[str, Any]) -> dict[str, Any] | None:
    request = event.get("request", {})
    url = request.get("url", "")
    if isinstance(url, str) and "/api/health" in url:
        return None
    return event


def init_sentry() -> None:
    if sentry_sdk is None or FastApiIntegration is None or LoggingIntegration is None:
        return

    if not settings.sentry_dsn:
        return

    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.sentry_environment or settings.app_env,
        release=settings.sentry_release,
        traces_sample_rate=settings.sentry_traces_sample_rate,
        profiles_sample_rate=settings.sentry_profiles_sample_rate,
        send_default_pii=settings.sentry_send_default_pii,
        before_send_transaction=_before_send_transaction,
        integrations=[
            FastApiIntegration(),
            LoggingIntegration(level=logging.INFO, event_level=logging.ERROR),
        ],
    )


def set_request_id_tag(request_id: str) -> None:
    if sentry_sdk is None:
        return
    sentry_sdk.set_tag("request_id", request_id)
