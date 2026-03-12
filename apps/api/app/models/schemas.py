from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


ProjectStatus = Literal["active", "archived"]


class HealthResponse(BaseModel):
    ok: bool = True
    timestamp: datetime
    env: str
    request_id: str


class Project(BaseModel):
    id: str
    name: str
    status: ProjectStatus
    created_at: datetime
    updated_at: datetime


class ProjectCreateBody(BaseModel):
    id: str = Field(min_length=1)
    name: str = Field(min_length=1)


class ProjectUpdateBody(BaseModel):
    name: str | None = None
    status: ProjectStatus | None = None


class LoginBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class SignupBody(LoginBody):
    pass
