from datetime import datetime, timezone, timedelta

import jwt
from jwt import InvalidTokenError

from app.core.config import settings


def create_access_token(subject: str) -> str:
    expire_at = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_access_token_expires_minutes)
    payload = {"sub": subject, "exp": expire_at}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, str] | None:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except InvalidTokenError:
        return None

    subject = payload.get("sub")
    if not isinstance(subject, str):
        return None
    return {"sub": subject}
