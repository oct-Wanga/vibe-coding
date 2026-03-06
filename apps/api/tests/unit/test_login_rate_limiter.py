from app.services.login_rate_limiter import InMemoryLoginRateLimiter
from app.services.login_rate_limiter import FailoverLoginRateLimiter
from redis.exceptions import RedisError


def test_inmemory_rate_limiter_limits_after_max_attempts() -> None:
    limiter = InMemoryLoginRateLimiter(max_attempts=3, window_seconds=60)
    key = "127.0.0.1:test@example.com"

    assert limiter.is_limited(key) is False
    limiter.add_failure(key)
    limiter.add_failure(key)
    assert limiter.is_limited(key) is False
    limiter.add_failure(key)
    assert limiter.is_limited(key) is True


def test_inmemory_rate_limiter_reset() -> None:
    limiter = InMemoryLoginRateLimiter(max_attempts=2, window_seconds=60)
    key = "127.0.0.1:test@example.com"

    limiter.add_failure(key)
    limiter.add_failure(key)
    assert limiter.is_limited(key) is True

    limiter.reset(key)
    assert limiter.is_limited(key) is False


class _BrokenLimiter:
    def is_limited(self, key: str) -> bool:
        raise RedisError("redis down")

    def add_failure(self, key: str) -> int:
        raise RedisError("redis down")

    def reset(self, key: str) -> None:
        raise RedisError("redis down")


def test_failover_rate_limiter_falls_back_to_inmemory_on_redis_error() -> None:
    fallback = InMemoryLoginRateLimiter(max_attempts=2, window_seconds=60)
    limiter = FailoverLoginRateLimiter(primary=_BrokenLimiter(), fallback=fallback)
    key = "127.0.0.1:test@example.com"

    assert limiter.is_limited(key) is False
    assert limiter.add_failure(key) == 1
    assert limiter.add_failure(key) == 2
    assert limiter.is_limited(key) is True

    limiter.reset(key)
    assert limiter.is_limited(key) is False
