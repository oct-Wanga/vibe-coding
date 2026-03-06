from __future__ import annotations

import os
from datetime import UTC, datetime
from typing import Any

import httpx

from app.core.config import settings
from app.models.schemas import Project, ProjectStatus


def _supabase_url() -> str | None:
    return settings.supabase_url or os.getenv("NEXT_PUBLIC_SUPABASE_URL")


def _supabase_key() -> str | None:
    return (
        settings.supabase_service_role_key
        or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
        or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    )


def has_supabase_projects_config() -> bool:
    return bool(_supabase_url() and _supabase_key())


def _headers(prefer: str | None = None) -> dict[str, str]:
    key = _supabase_key()
    if not key:
        return {}
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    return headers


def _projects_endpoint() -> str:
    url = _supabase_url()
    if not url:
        raise RuntimeError("Missing Supabase projects config")
    return f"{url.rstrip('/')}/rest/v1/projects"


def _to_project(payload: dict[str, Any]) -> Project:
    now = datetime.now(UTC)
    created_at_raw = payload.get("created_at")
    updated_at_raw = payload.get("updated_at")
    created_at = (
        datetime.fromisoformat(created_at_raw.replace("Z", "+00:00"))
        if isinstance(created_at_raw, str)
        else now
    )
    updated_at = (
        datetime.fromisoformat(updated_at_raw.replace("Z", "+00:00"))
        if isinstance(updated_at_raw, str)
        else created_at
    )
    status_raw = payload.get("status")
    status: ProjectStatus = "archived" if status_raw == "archived" else "active"
    return Project(
        id=str(payload["id"]),
        name=str(payload.get("name") or ""),
        status=status,
        created_at=created_at,
        updated_at=updated_at,
    )


def list_projects(
    q: str | None,
    status: ProjectStatus | None,
) -> tuple[list[Project] | None, str | None]:
    params: dict[str, str] = {
        "select": "id,name,status,created_at,updated_at",
        "order": "created_at.desc",
    }
    if q:
        params["name"] = f"ilike.*{q}*"
    if status:
        params["status"] = f"eq.{status}"

    try:
        response = httpx.get(_projects_endpoint(), params=params, headers=_headers(), timeout=5.0)
    except httpx.HTTPError:
        return None, "Supabase projects request failed"

    if response.status_code >= 400:
        return None, response.text
    data = response.json()
    if not isinstance(data, list):
        return [], None
    return [_to_project(item) for item in data if isinstance(item, dict)], None


def get_project(project_id: str) -> tuple[Project | None, str | None]:
    params = {
        "select": "id,name,status,created_at,updated_at",
        "id": f"eq.{project_id}",
        "limit": "1",
    }
    try:
        response = httpx.get(_projects_endpoint(), params=params, headers=_headers(), timeout=5.0)
    except httpx.HTTPError:
        return None, "Supabase projects request failed"

    if response.status_code >= 400:
        return None, response.text
    data = response.json()
    if not isinstance(data, list) or len(data) == 0:
        return None, None
    first = data[0]
    if not isinstance(first, dict):
        return None, None
    return _to_project(first), None


def create_project(project_id: str, name: str, user_id: str | None) -> tuple[Project | None, str | None]:
    payload: dict[str, Any] = {
        "id": project_id,
        "name": name,
        "status": "active",
    }
    if user_id:
        payload["user_id"] = user_id

    try:
        response = httpx.post(
            _projects_endpoint(),
            json=payload,
            headers=_headers(prefer="return=representation"),
            timeout=5.0,
        )
    except httpx.HTTPError:
        return None, "Supabase projects request failed"

    if response.status_code >= 400:
        return None, response.text
    data = response.json()
    if not isinstance(data, list) or len(data) == 0 or not isinstance(data[0], dict):
        return None, "Project create failed"
    return _to_project(data[0]), None


def update_project(
    project_id: str,
    name: str | None,
    status: ProjectStatus | None,
) -> tuple[bool | None, str | None]:
    payload: dict[str, Any] = {}
    if name is not None:
        payload["name"] = name
    if status is not None:
        payload["status"] = status
    if not payload:
        return True, None

    try:
        response = httpx.patch(
            _projects_endpoint(),
            params={"id": f"eq.{project_id}"},
            json=payload,
            headers=_headers(prefer="return=representation"),
            timeout=5.0,
        )
    except httpx.HTTPError:
        return None, "Supabase projects request failed"

    if response.status_code >= 400:
        return None, response.text
    data = response.json()
    if not isinstance(data, list):
        return False, None
    return len(data) > 0, None


def delete_project(project_id: str) -> tuple[bool | None, str | None]:
    try:
        response = httpx.delete(
            _projects_endpoint(),
            params={"id": f"eq.{project_id}"},
            headers=_headers(prefer="return=representation"),
            timeout=5.0,
        )
    except httpx.HTTPError:
        return None, "Supabase projects request failed"

    if response.status_code >= 400:
        return None, response.text
    data = response.json()
    if not isinstance(data, list):
        return False, None
    return len(data) > 0, None
