from __future__ import annotations

import os

import httpx

from app.core.config import settings


def _supabase_url() -> str | None:
    return settings.supabase_url or os.getenv("NEXT_PUBLIC_SUPABASE_URL")


def _supabase_key() -> str | None:
    return (
        settings.supabase_service_role_key
        or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")
    )


def upsert_signup_profile(user_id: str, email: str) -> bool:
    url = _supabase_url()
    key = _supabase_key()
    if not url or not key:
        return False

    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }

    # Some projects use `users(id,email)`, others `profiles(id,email)` or `profiles(user_id,email)`.
    candidates = [
        ("users", {"id": user_id, "email": email}),
        ("users", {"user_id": user_id, "email": email}),
        ("profiles", {"id": user_id, "email": email}),
        ("profiles", {"user_id": user_id, "email": email}),
    ]

    for table, payload in candidates:
        endpoint = f"{url.rstrip('/')}/rest/v1/{table}"
        try:
            response = httpx.post(endpoint, json=payload, headers=headers, timeout=3.0)
        except httpx.HTTPError:
            continue
        if response.status_code < 400:
            return True

    return False
