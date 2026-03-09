from uuid import uuid4

from fastapi import Header, Request

from app.core.observability import get_request_id_from_state


def get_request_id(request: Request, x_request_id: str | None = Header(default=None)) -> str:
    state_request_id = get_request_id_from_state(request)
    return state_request_id or x_request_id or str(uuid4())
