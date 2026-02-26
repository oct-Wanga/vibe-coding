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
