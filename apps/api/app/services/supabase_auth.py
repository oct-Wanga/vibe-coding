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
        or os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
        or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    )


def has_supabase_auth_config() -> bool:
    return bool(_supabase_url() and _supabase_key())


def _error_message(response: httpx.Response, default: str) -> str:
    try:
        data = response.json()
    except ValueError:
        return default
    if isinstance(data, dict):
        msg = data.get("msg") or data.get("message") or data.get("error_description")
        if isinstance(msg, str) and msg:
            return msg
    return default


def signup_user(email: str, password: str) -> tuple[str | None, str | None]:
    url = _supabase_url()
    key = _supabase_key()
    if not url or not key:
        return None, "Missing Supabase auth config"

    endpoint = f"{url.rstrip('/')}/auth/v1/signup"
    headers = {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {"email": email, "password": password}

    try:
        response = httpx.post(endpoint, json=payload, headers=headers, timeout=5.0)
    except httpx.HTTPError:
        return None, "Supabase auth request failed"

    if response.status_code >= 400:
        return None, _error_message(response, "Signup failed")

    data = response.json()
    user = data.get("user") if isinstance(data, dict) else None
    user_id = user.get("id") if isinstance(user, dict) else None
    if not user_id:
        return None, "Signup failed"
    return user_id, None


def login_user(email: str, password: str) -> tuple[str | None, str | None]:
    url = _supabase_url()
    key = _supabase_key()
    if not url or not key:
        return None, "Missing Supabase auth config"

    endpoint = f"{url.rstrip('/')}/auth/v1/token?grant_type=password"
    headers = {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {"email": email, "password": password}

    try:
        response = httpx.post(endpoint, json=payload, headers=headers, timeout=5.0)
    except httpx.HTTPError:
        return None, "Supabase auth request failed"

    if response.status_code >= 400:
        return None, _error_message(response, "Login failed")

    data = response.json()
    user = data.get("user") if isinstance(data, dict) else None
    user_id = user.get("id") if isinstance(user, dict) else None
    if not user_id:
        return None, "Login failed"
    return user_id, None
