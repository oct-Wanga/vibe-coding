import app.core.sentry as sentry_module


class _FakeSentrySdk:
    def __init__(self) -> None:
        self.init_calls: list[dict] = []
        self.tags: dict[str, str] = {}

    def init(self, **kwargs) -> None:
        self.init_calls.append(kwargs)

    def set_tag(self, key: str, value: str) -> None:
        self.tags[key] = value


def test_before_send_transaction_drops_healthcheck() -> None:
    event = {"request": {"url": "http://localhost:8000/api/health"}}
    assert sentry_module._before_send_transaction(event, {}) is None


def test_before_send_transaction_keeps_non_healthcheck() -> None:
    event = {"request": {"url": "http://localhost:8000/api/projects"}}
    assert sentry_module._before_send_transaction(event, {}) == event


def test_init_sentry_skips_when_sdk_missing(monkeypatch) -> None:
    monkeypatch.setattr(sentry_module, "sentry_sdk", None)
    monkeypatch.setattr(sentry_module, "FastApiIntegration", None)
    monkeypatch.setattr(sentry_module, "LoggingIntegration", None)

    sentry_module.init_sentry()


def test_init_sentry_skips_when_dsn_missing(monkeypatch) -> None:
    fake_sdk = _FakeSentrySdk()

    monkeypatch.setattr(sentry_module, "sentry_sdk", fake_sdk)
    monkeypatch.setattr(sentry_module, "FastApiIntegration", lambda: "fastapi-integration")
    monkeypatch.setattr(sentry_module, "LoggingIntegration", lambda **_: "logging-integration")
    monkeypatch.setattr(sentry_module.settings, "sentry_dsn", None)

    sentry_module.init_sentry()

    assert fake_sdk.init_calls == []


def test_init_sentry_initializes_with_expected_options(monkeypatch) -> None:
    fake_sdk = _FakeSentrySdk()

    monkeypatch.setattr(sentry_module, "sentry_sdk", fake_sdk)
    monkeypatch.setattr(sentry_module, "FastApiIntegration", lambda: "fastapi-integration")
    monkeypatch.setattr(sentry_module, "LoggingIntegration", lambda **_: "logging-integration")
    monkeypatch.setattr(sentry_module.settings, "sentry_dsn", "https://example@sentry.io/1")
    monkeypatch.setattr(sentry_module.settings, "sentry_environment", "staging")
    monkeypatch.setattr(sentry_module.settings, "sentry_release", "api@1.2.3")
    monkeypatch.setattr(sentry_module.settings, "sentry_traces_sample_rate", 0.2)
    monkeypatch.setattr(sentry_module.settings, "sentry_profiles_sample_rate", 0.1)
    monkeypatch.setattr(sentry_module.settings, "sentry_send_default_pii", False)

    sentry_module.init_sentry()

    assert len(fake_sdk.init_calls) == 1
    call = fake_sdk.init_calls[0]
    assert call["dsn"] == "https://example@sentry.io/1"
    assert call["environment"] == "staging"
    assert call["release"] == "api@1.2.3"
    assert call["traces_sample_rate"] == 0.2
    assert call["profiles_sample_rate"] == 0.1
    assert call["send_default_pii"] is False
    assert call["before_send_transaction"] is sentry_module._before_send_transaction
    assert call["integrations"] == ["fastapi-integration", "logging-integration"]


def test_set_request_id_tag_sets_tag_when_sdk_available(monkeypatch) -> None:
    fake_sdk = _FakeSentrySdk()
    monkeypatch.setattr(sentry_module, "sentry_sdk", fake_sdk)

    sentry_module.set_request_id_tag("req-123")

    assert fake_sdk.tags["request_id"] == "req-123"


def test_set_request_id_tag_is_noop_when_sdk_missing(monkeypatch) -> None:
    monkeypatch.setattr(sentry_module, "sentry_sdk", None)

    sentry_module.set_request_id_tag("req-123")
