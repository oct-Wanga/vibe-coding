from __future__ import annotations

import time
from typing import Protocol

from redis import Redis
from redis.exceptions import RedisError

from app.core.config import settings


class LoginRateLimiter(Protocol):
    def is_limited(self, key: str) -> bool: ...

    def add_failure(self, key: str) -> int: ...

    def reset(self, key: str) -> None: ...


class RedisLoginRateLimiter:
    def __init__(self, redis_url: str, max_attempts: int, window_seconds: int) -> None:
        self._client = Redis.from_url(redis_url, decode_responses=True)
        self._max_attempts = max_attempts
        self._window_seconds = window_seconds

    def is_limited(self, key: str) -> bool:
        count = self._client.get(self._build_key(key))
        return int(count) >= self._max_attempts if count is not None else False

    def add_failure(self, key: str) -> int:
        redis_key = self._build_key(key)
        count = self._client.incr(redis_key)
        if count == 1:
            self._client.expire(redis_key, self._window_seconds)
        return count

    def reset(self, key: str) -> None:
        self._client.delete(self._build_key(key))

    @staticmethod
    def _build_key(key: str) -> str:
        return f"login_attempt:{key}"


class InMemoryLoginRateLimiter:
    def __init__(self, max_attempts: int, window_seconds: int) -> None:
        self._max_attempts = max_attempts
        self._window_seconds = window_seconds
        self._store: dict[str, tuple[int, float]] = {}

    def is_limited(self, key: str) -> bool:
        now = time.time()
        record = self._store.get(key)
        if not record:
            return False
        count, reset_at = record
        if now >= reset_at:
            self._store.pop(key, None)
            return False
        return count >= self._max_attempts

    def add_failure(self, key: str) -> int:
        now = time.time()
        record = self._store.get(key)
        if not record or now >= record[1]:
            count = 1
            reset_at = now + self._window_seconds
        else:
            count = record[0] + 1
            reset_at = record[1]
        self._store[key] = (count, reset_at)
        return count

    def reset(self, key: str) -> None:
        self._store.pop(key, None)


class FailoverLoginRateLimiter:
    def __init__(self, primary: LoginRateLimiter | None, fallback: LoginRateLimiter) -> None:
        self._primary = primary
        self._fallback = fallback

    def is_limited(self, key: str) -> bool:
        if self._primary is None:
            return self._fallback.is_limited(key)
        try:
            return self._primary.is_limited(key)
        except RedisError:
            self._primary = None
            return self._fallback.is_limited(key)

    def add_failure(self, key: str) -> int:
        if self._primary is None:
            return self._fallback.add_failure(key)
        try:
            return self._primary.add_failure(key)
        except RedisError:
            self._primary = None
            return self._fallback.add_failure(key)

    def reset(self, key: str) -> None:
        if self._primary is None:
            self._fallback.reset(key)
            return
        try:
            self._primary.reset(key)
        except RedisError:
            self._primary = None
            self._fallback.reset(key)


def create_login_rate_limiter() -> LoginRateLimiter:
    fallback = InMemoryLoginRateLimiter(
        max_attempts=settings.login_rate_limit_max_attempts,
        window_seconds=settings.login_rate_limit_window_seconds,
    )
    if settings.session_store_backend == "memory":
        return fallback

    primary = RedisLoginRateLimiter(
        redis_url=settings.redis_url,
        max_attempts=settings.login_rate_limit_max_attempts,
        window_seconds=settings.login_rate_limit_window_seconds,
    )
    if settings.login_rate_limit_fallback_to_memory:
        return FailoverLoginRateLimiter(primary=primary, fallback=fallback)
    return primary


login_rate_limiter = create_login_rate_limiter()
