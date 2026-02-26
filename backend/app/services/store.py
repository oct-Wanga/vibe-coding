from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import TypedDict
from uuid import uuid4

from passlib.context import CryptContext

from app.models.schemas import Project, ProjectStatus

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(TypedDict):
    id: str
    email: str
    password_hash: str


class InMemoryStore:
    def __init__(self) -> None:
        now = datetime.now(timezone.utc)
        self.projects: dict[str, Project] = {
            "sample-1": Project(
                id="sample-1",
                name="샘플 프로젝트",
                status="active",
                created_at=now,
                updated_at=now,
            )
        }
        self.users: dict[str, User] = {}

    def list_projects(self, q: str | None, status: ProjectStatus | None) -> list[Project]:
        items = list(self.projects.values())
        if q:
            lowered = q.lower()
            items = [project for project in items if lowered in project.name.lower()]
        if status:
            items = [project for project in items if project.status == status]
        return sorted(items, key=lambda project: project.created_at, reverse=True)

    def get_project(self, project_id: str) -> Project | None:
        project = self.projects.get(project_id)
        return deepcopy(project) if project else None

    def create_project(self, project_id: str, name: str) -> Project:
        now = datetime.now(timezone.utc)
        project = Project(
            id=project_id,
            name=name,
            status="active",
            created_at=now,
            updated_at=now,
        )
        self.projects[project.id] = project
        return deepcopy(project)

    def update_project(
        self,
        project_id: str,
        name: str | None,
        status: ProjectStatus | None,
    ) -> bool:
        existing = self.projects.get(project_id)
        if not existing:
            return False
        updated = existing.model_copy(
            update={
                "name": name if name is not None else existing.name,
                "status": status if status is not None else existing.status,
                "updated_at": datetime.now(timezone.utc),
            }
        )
        self.projects[project_id] = updated
        return True

    def delete_project(self, project_id: str) -> bool:
        return self.projects.pop(project_id, None) is not None

    def signup(self, email: str, password: str) -> tuple[str, bool]:
        if email in self.users:
            return self.users[email]["id"], False
        user_id = str(uuid4())
        self.users[email] = {
            "id": user_id,
            "email": email,
            "password_hash": pwd_context.hash(password),
        }
        return user_id, True

    def verify_login(self, email: str, password: str) -> str | None:
        user = self.users.get(email)
        if not user or not pwd_context.verify(password, user["password_hash"]):
            return None
        return user["id"]


store = InMemoryStore()
