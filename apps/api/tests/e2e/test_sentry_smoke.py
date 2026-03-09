from __future__ import annotations

import os
from uuid import uuid4

import pytest
import sentry_sdk


def _is_enabled(value: str | None) -> bool:
    if value is None:
        return False
    return value.strip().lower() in {"1", "true", "yes", "on"}


@pytest.mark.skipif(
    not (os.getenv("SENTRY_DSN") and _is_enabled(os.getenv("SENTRY_SMOKE_TEST"))),
    reason="Set SENTRY_DSN and SENTRY_SMOKE_TEST=true to run Sentry smoke test.",
)
def test_sentry_smoke_sends_exception_event() -> None:
    marker = f"api-pytest-sentry-smoke-{uuid4().hex[:10]}"
    try:
        raise RuntimeError(marker)
    except RuntimeError as error:
        event_id = sentry_sdk.capture_exception(error)

    sentry_sdk.flush(3.0)
    print(f"sentry_smoke_marker={marker} event_id={event_id}")

    assert event_id is not None
