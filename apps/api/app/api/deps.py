from uuid import uuid4

from fastapi import Header


def get_request_id(x_request_id: str | None = Header(default=None)) -> str:
    return x_request_id or str(uuid4())
