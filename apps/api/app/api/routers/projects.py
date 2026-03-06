from typing import Literal

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status

from app.api.deps import get_request_id
from app.core.config import settings
from app.models.schemas import Project, ProjectCreateBody, ProjectUpdateBody
from app.services.activity_logs import insert_activity_log
from app.services.outbox_relay import outbox_relay
from app.services.session_store import session_store
from app.services.store import store
from app.services.supabase_projects import (
    create_project as create_supabase_project,
    delete_project as delete_supabase_project,
    get_project as get_supabase_project,
    has_supabase_projects_config,
    list_projects as list_supabase_projects,
    update_project as update_supabase_project,
)

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[Project])
def list_projects(
    response: Response,
    request_id: str = Depends(get_request_id),
    q: str | None = None,
    status_q: Literal["active", "archived"] | None = None,
) -> list[Project]:
    response.headers["x-request-id"] = request_id
    if has_supabase_projects_config():
        projects, error = list_supabase_projects(q=q, status=status_q)
        if error:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=error)
        return projects or []
    return store.list_projects(q=q, status=status_q)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=Project)
def create_project(
    body: ProjectCreateBody,
    response: Response,
    request_id: str = Depends(get_request_id),
    session_token: str | None = Cookie(default=None, alias=settings.session_cookie_name),
) -> Project:
    response.headers["x-request-id"] = request_id
    if has_supabase_projects_config():
        user = session_store.resolve(session_token)
        user_id = user["sub"] if user else None
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
        project, error = create_supabase_project(project_id=body.id, name=body.name, user_id=user_id)
        if error or not project:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error or "create failed")
        store.enqueue_project_created_event(project)
        insert_activity_log("project.create", f"Project created: {body.id}", actor=user_id)
        return project

    project = store.create_project(project_id=body.id, name=body.name)
    insert_activity_log("project.create", f"Project created: {body.id}")
    return project


@router.get("/outbox/summary")
def get_outbox_summary(response: Response, request_id: str = Depends(get_request_id)) -> dict[str, int]:
    response.headers["x-request-id"] = request_id
    return store.get_outbox_summary()


@router.get("/outbox/status")
def get_outbox_status(
    response: Response,
    request_id: str = Depends(get_request_id),
) -> dict[str, str | bool | None]:
    response.headers["x-request-id"] = request_id
    return outbox_relay.status()


@router.get("/{project_id}", response_model=Project)
def get_project(project_id: str, response: Response, request_id: str = Depends(get_request_id)) -> Project:
    response.headers["x-request-id"] = request_id
    if has_supabase_projects_config():
        project, error = get_supabase_project(project_id)
        if error:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=error)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
        return project

    project = store.get_project(project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return project


@router.patch("/{project_id}")
def patch_project(
    project_id: str,
    body: ProjectUpdateBody,
    response: Response,
    request_id: str = Depends(get_request_id),
) -> dict[str, bool]:
    if body.name is None and body.status is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="nothing to update")
    response.headers["x-request-id"] = request_id
    if has_supabase_projects_config():
        ok, error = update_supabase_project(project_id=project_id, name=body.name, status=body.status)
        if error:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=error)
        if not ok:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
        insert_activity_log("project.update", f"Project updated: {project_id}")
        return {"ok": True}

    ok = store.update_project(project_id=project_id, name=body.name, status=body.status)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    insert_activity_log("project.update", f"Project updated: {project_id}")
    return {"ok": True}


@router.delete("/{project_id}")
def delete_project(project_id: str, response: Response, request_id: str = Depends(get_request_id)) -> dict[str, bool]:
    response.headers["x-request-id"] = request_id
    if has_supabase_projects_config():
        ok, error = delete_supabase_project(project_id)
        if error:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=error)
        if not ok:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
        insert_activity_log("project.delete", f"Project deleted: {project_id}")
        return {"ok": True}

    ok = store.delete_project(project_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    insert_activity_log("project.delete", f"Project deleted: {project_id}")
    return {"ok": True}
