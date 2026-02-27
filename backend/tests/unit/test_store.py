import pytest

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
