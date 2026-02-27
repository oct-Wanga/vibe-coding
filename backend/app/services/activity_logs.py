from __future__ import annotations

from datetime import datetime, timezone
import os
from uuid import uuid4

import httpx

from app.core.config import settings


def _normalize_activity_type(log_type: str) -> str:
    if log_type.startswith("project."):
        return "project"
    return "system"


def insert_activity_log(log_type: str, message: str, actor: str | None = None) -> bool:
    supabase_url = settings.supabase_url or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_service_role_key = settings.supabase_service_role_key or os.getenv(
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    if not supabase_service_role_key:
        supabase_service_role_key = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_service_role_key:
        return False

    payload = {
        "id": str(uuid4()),
        "type": _normalize_activity_type(log_type),
        "message": message,
        "actor": actor or "anonymous",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    key = supabase_service_role_key
    url = f"{supabase_url.rstrip('/')}/rest/v1/activity_logs"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }

    try:
        response = httpx.post(url, json=payload, headers=headers, timeout=3.0)
        return response.status_code < 400
    except httpx.HTTPError:
        return False
