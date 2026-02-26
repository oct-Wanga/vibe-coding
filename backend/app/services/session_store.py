from __future__ import annotations

from typing import Protocol
from uuid import uuid4

from redis import Redis
from redis.exceptions import RedisError

from app.core.config import settings


class SessionStore(Protocol):
    def create(self, user_id: str) -> str: ...

    def resolve(self, session_token: str | None) -> dict[str, str] | None: ...

    def delete(self, session_token: str | None) -> None: ...


class RedisSessionStore:
    def __init__(self, redis_url: str, ttl_seconds: int) -> None:
        self._client = Redis.from_url(redis_url, decode_responses=True)
        self._ttl_seconds = ttl_seconds

    def create(self, user_id: str) -> str:
        token = str(uuid4())
        key = self._build_key(token)
        self._client.setex(key, self._ttl_seconds, user_id)
        return token

    def resolve(self, session_token: str | None) -> dict[str, str] | None:
        if not session_token:
            return None
        key = self._build_key(session_token)
        user_id = self._client.get(key)
        if not user_id:
            return None
        return {"sub": user_id}

    def delete(self, session_token: str | None) -> None:
        if not session_token:
            return
        self._client.delete(self._build_key(session_token))

    @staticmethod
    def _build_key(session_token: str) -> str:
        return f"session:{session_token}"


class InMemorySessionStore:
    def __init__(self) -> None:
        self.sessions: dict[str, str] = {}

    def create(self, user_id: str) -> str:
        token = str(uuid4())
        self.sessions[token] = user_id
        return token

    def resolve(self, session_token: str | None) -> dict[str, str] | None:
        if not session_token:
            return None
        user_id = self.sessions.get(session_token)
        if not user_id:
            return None
        return {"sub": user_id}

    def delete(self, session_token: str | None) -> None:
        if not session_token:
            return
        self.sessions.pop(session_token, None)


def create_session_store() -> SessionStore:
    if settings.session_store_backend == "memory":
        return InMemorySessionStore()

    try:
        return RedisSessionStore(redis_url=settings.redis_url, ttl_seconds=settings.session_ttl_seconds)
    except RedisError:
        return InMemorySessionStore()


session_store = create_session_store()
