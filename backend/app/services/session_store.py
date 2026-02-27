from __future__ import annotations

from typing import Protocol
from uuid import uuid4

from redis import Redis
from redis.exceptions import RedisError

from app.core.config import settings


class DuplicateSessionError(Exception):
    pass


class SessionStore(Protocol):
    def create(self, user_id: str) -> str: ...

    def resolve(self, session_token: str | None) -> dict[str, str] | None: ...

    def delete(self, session_token: str | None) -> None: ...


class RedisSessionStore:
    def __init__(self, redis_url: str, ttl_seconds: int, single_login: bool) -> None:
        self._client = Redis.from_url(redis_url, decode_responses=True)
        self._ttl_seconds = ttl_seconds
        self._single_login = single_login

    def create(self, user_id: str) -> str:
        user_key = self._build_user_key(user_id)
        if self._single_login and self._client.exists(user_key):
            raise DuplicateSessionError("already logged in")

        token = str(uuid4())
        key = self._build_key(token)
        self._client.setex(key, self._ttl_seconds, user_id)
        self._client.setex(user_key, self._ttl_seconds, token)
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
        key = self._build_key(session_token)
        user_id = self._client.get(key)
        self._client.delete(key)
        if user_id:
            self._client.delete(self._build_user_key(user_id))

    @staticmethod
    def _build_key(session_token: str) -> str:
        return f"session:{session_token}"

    @staticmethod
    def _build_user_key(user_id: str) -> str:
        return f"session_user:{user_id}"


class InMemorySessionStore:
    def __init__(self, single_login: bool = False) -> None:
        self.sessions: dict[str, str] = {}
        self.user_tokens: dict[str, str] = {}
        self._single_login = single_login

    def create(self, user_id: str) -> str:
        if self._single_login and user_id in self.user_tokens:
            token = self.user_tokens[user_id]
            if token in self.sessions:
                raise DuplicateSessionError("already logged in")
        token = str(uuid4())
        self.sessions[token] = user_id
        self.user_tokens[user_id] = token
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
        user_id = self.sessions.pop(session_token, None)
        if user_id:
            self.user_tokens.pop(user_id, None)


def create_session_store() -> SessionStore:
    if settings.session_store_backend == "memory":
        return InMemorySessionStore(single_login=settings.session_single_login)

    try:
        return RedisSessionStore(
            redis_url=settings.redis_url,
            ttl_seconds=settings.session_ttl_seconds,
            single_login=settings.session_single_login,
        )
    except RedisError:
        return InMemorySessionStore(single_login=settings.session_single_login)


session_store = create_session_store()
