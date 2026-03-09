from __future__ import annotations

import json
import logging
from time import perf_counter
from uuid import uuid4

from fastapi import Request

REQUEST_ID_HEADER = "x-request-id"
REQUEST_ID_STATE_KEY = "request_id"

logger = logging.getLogger("app.observability")
logger.setLevel(logging.INFO)


def resolve_request_id(request: Request) -> str:
    incoming = request.headers.get(REQUEST_ID_HEADER)
    if incoming:
        return incoming
    return str(uuid4())


def get_request_id_from_state(request: Request) -> str | None:
    return getattr(request.state, REQUEST_ID_STATE_KEY, None)


def now_ms() -> float:
    return perf_counter() * 1000


def emit_access_log(
    *,
    request: Request,
    request_id: str,
    status_code: int,
    started_ms: float,
    level: int = logging.INFO,
) -> None:
    elapsed_ms = round(now_ms() - started_ms, 2)
    payload = {
        "event": "api_request",
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "query": request.url.query,
        "status_code": status_code,
        "duration_ms": elapsed_ms,
        "client_ip": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent"),
    }
    logger.log(level, json.dumps(payload, ensure_ascii=False))
