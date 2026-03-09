from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers.auth import router as auth_router
from app.api.routers.health import router as health_router
from app.api.routers.projects import router as projects_router
from app.core.config import settings
from app.core.observability import (
    REQUEST_ID_HEADER,
    REQUEST_ID_STATE_KEY,
    emit_access_log,
    now_ms,
    resolve_request_id,
)
from app.core.sentry import init_sentry, set_request_id_tag
from app.services.outbox_relay import outbox_relay

init_sentry()


@asynccontextmanager
async def lifespan(_: FastAPI):
    await outbox_relay.start()
    yield
    await outbox_relay.stop()


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def observability_middleware(request: Request, call_next):
    request_id = resolve_request_id(request)
    setattr(request.state, REQUEST_ID_STATE_KEY, request_id)
    set_request_id_tag(request_id)
    started_ms = now_ms()

    try:
        response = await call_next(request)
    except Exception:
        if settings.api_access_log_enabled:
            emit_access_log(
                request=request,
                request_id=request_id,
                status_code=500,
                started_ms=started_ms,
                level=logging.ERROR,
            )
        raise

    response.headers[REQUEST_ID_HEADER] = request_id
    if settings.api_access_log_enabled:
        level = logging.WARNING if response.status_code >= 500 else logging.INFO
        if response.status_code < 500:
            elapsed_ms = now_ms() - started_ms
            if elapsed_ms >= settings.api_access_log_slow_ms:
                level = logging.WARNING
        emit_access_log(
            request=request,
            request_id=request_id,
            status_code=response.status_code,
            started_ms=started_ms,
            level=level,
        )
    return response


app.include_router(health_router, prefix=settings.api_prefix)
app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(projects_router, prefix=settings.api_prefix)
