from app.services.login_rate_limiter import InMemoryLoginRateLimiter


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
