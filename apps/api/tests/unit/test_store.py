import pytest

from app.core.config import settings
from app.services.session_store import DuplicateSessionError, InMemorySessionStore
from app.services.store import InMemoryStore


def test_store_project_crud() -> None:
    store = InMemoryStore()
    created = store.create_project("p-1", "프로젝트")

    assert created.id == "p-1"
    assert store.get_project("p-1") is not None

    updated = store.update_project("p-1", name="이름변경", status="archived")
    assert updated is True

    project = store.get_project("p-1")
    assert project is not None
    assert project.name == "이름변경"
    assert project.status == "archived"

    assert store.delete_project("p-1") is True


def test_create_project_enqueues_outbox_event() -> None:
    settings.outbox_enabled = True
    store = InMemoryStore()

    before = store.get_outbox_summary()
    created = store.create_project("p-outbox-1", "Outbox 프로젝트")
    after = store.get_outbox_summary()

    assert created.id == "p-outbox-1"
    assert after["total"] == before["total"] + 1
    assert after["pending"] == before["pending"] + 1

    candidates = store.list_relay_candidate_outbox_events(limit=10, max_attempts=10)
    matched = [event for event in candidates if event["aggregate_id"] == "p-outbox-1"]
    assert len(matched) == 1
    assert matched[0]["event_type"] == "project.created"


def test_outbox_mark_published_and_failed() -> None:
    settings.outbox_enabled = True
    store = InMemoryStore()
    store.create_project("p-outbox-2", "Outbox 프로젝트 2")
    candidates = store.list_relay_candidate_outbox_events(limit=10, max_attempts=10)
    target = next(event for event in candidates if event["aggregate_id"] == "p-outbox-2")

    assert store.mark_outbox_failed(target["id"], "kafka timeout") is True
    failed_summary = store.get_outbox_summary()
    assert failed_summary["failed"] >= 1

    assert store.mark_outbox_published(target["id"]) is True
    final_summary = store.get_outbox_summary()
    assert final_summary["published"] >= 1


def test_signup_hashes_password_and_verify_login() -> None:
    store = InMemoryStore()

    user_id, created = store.signup("demo@example.com", "secret123")

    assert created is True
    saved_user = store.users["demo@example.com"]
    assert saved_user["password_hash"] != "secret123"
    assert store.verify_login("demo@example.com", "secret123") == user_id
    assert store.verify_login("demo@example.com", "wrong") is None


def test_inmemory_session_store_create_resolve_delete() -> None:
    session_store = InMemorySessionStore()

    token = session_store.create("user-1")
    assert session_store.resolve(token) == {"sub": "user-1"}

    session_store.delete(token)
    assert session_store.resolve(token) is None


def test_inmemory_session_store_blocks_duplicate_login_when_enabled() -> None:
    session_store = InMemorySessionStore(single_login=True)

    session_store.create("user-1")
    with pytest.raises(DuplicateSessionError):
        session_store.create("user-1")
