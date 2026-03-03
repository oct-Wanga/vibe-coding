from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from threading import Lock
from typing import Literal, TypedDict
from uuid import uuid4

from passlib.context import CryptContext

from app.core.config import settings
from app.models.schemas import Project, ProjectStatus

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(TypedDict):
    id: str
    email: str
    password_hash: str


OutboxStatus = Literal["pending", "published", "failed"]


class OutboxEvent(TypedDict):
    id: str
    aggregate_type: str
    aggregate_id: str
    event_type: str
    topic: str
    event_key: str
    payload: dict[str, object]
    occurred_at: datetime
    status: OutboxStatus
    attempts: int
    published_at: datetime | None
    last_error: str | None


class InMemoryStore:
    def __init__(self) -> None:
        now = datetime.now(timezone.utc)
        self._lock = Lock()
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
        self.outbox_events: dict[str, OutboxEvent] = {}

    def list_projects(self, q: str | None, status: ProjectStatus | None) -> list[Project]:
        with self._lock:
            items = list(self.projects.values())
        if q:
            lowered = q.lower()
            items = [project for project in items if lowered in project.name.lower()]
        if status:
            items = [project for project in items if project.status == status]
        return sorted(items, key=lambda project: project.created_at, reverse=True)

    def get_project(self, project_id: str) -> Project | None:
        with self._lock:
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
        outbox_event: OutboxEvent = {
            "id": str(uuid4()),
            "aggregate_type": "project",
            "aggregate_id": project.id,
            "event_type": "project.created",
            "topic": settings.kafka_projects_created_topic,
            "event_key": project.id,
            "payload": {
                # consumer가 재처리하기 좋도록 이벤트 메타 + 도메인 스냅샷을 함께 저장
                "event_id": str(uuid4()),
                "event_type": "project.created",
                "schema_version": 1,
                "occurred_at": now.isoformat(),
                "project": project.model_dump(mode="json"),
            },
            "occurred_at": now,
            "status": "pending",
            "attempts": 0,
            "published_at": None,
            "last_error": None,
        }
        # 실제 운영에서는 DB 트랜잭션 1개로 처리해야 한다.
        with self._lock:
            # 데모에서는 lock으로 원자성을 흉내 내고, 실제 운영은 DB 트랜잭션으로 처리한다.
            self.projects[project.id] = project
            if settings.outbox_enabled:
                self.outbox_events[outbox_event["id"]] = outbox_event
        return deepcopy(project)

    def update_project(
        self,
        project_id: str,
        name: str | None,
        status: ProjectStatus | None,
    ) -> bool:
        with self._lock:
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
        with self._lock:
            return self.projects.pop(project_id, None) is not None

    def signup(self, email: str, password: str) -> tuple[str, bool]:
        with self._lock:
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
        with self._lock:
            user = self.users.get(email)
        if not user or not pwd_context.verify(password, user["password_hash"]):
            return None
        return user["id"]

    def list_relay_candidate_outbox_events(self, limit: int, max_attempts: int) -> list[OutboxEvent]:
        with self._lock:
            candidates = [
                event
                for event in self.outbox_events.values()
                if event["status"] in {"pending", "failed"} and event["attempts"] < max_attempts
            ]
            candidates.sort(key=lambda event: event["occurred_at"])
            return [deepcopy(event) for event in candidates[:limit]]

    def mark_outbox_published(self, outbox_id: str) -> bool:
        with self._lock:
            event = self.outbox_events.get(outbox_id)
            if not event:
                return False
            event["status"] = "published"
            event["published_at"] = datetime.now(timezone.utc)
            event["last_error"] = None
            return True

    def mark_outbox_failed(self, outbox_id: str, reason: str) -> bool:
        with self._lock:
            event = self.outbox_events.get(outbox_id)
            if not event:
                return False
            event["status"] = "failed"
            event["attempts"] += 1
            event["last_error"] = reason
            return True

    def get_outbox_summary(self) -> dict[str, int]:
        with self._lock:
            pending = sum(1 for event in self.outbox_events.values() if event["status"] == "pending")
            failed = sum(1 for event in self.outbox_events.values() if event["status"] == "failed")
            published = sum(1 for event in self.outbox_events.values() if event["status"] == "published")
            return {
                "pending": pending,
                "failed": failed,
                "published": published,
                "total": len(self.outbox_events),
            }


store = InMemoryStore()
