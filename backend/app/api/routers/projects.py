from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.deps import get_request_id
from app.models.schemas import Project, ProjectCreateBody, ProjectUpdateBody
from app.services.store import store

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[Project])
def list_projects(
    response: Response,
    request_id: str = Depends(get_request_id),
    q: str | None = None,
    status_q: Literal["active", "archived"] | None = None,
) -> list[Project]:
    response.headers["x-request-id"] = request_id
    return store.list_projects(q=q, status=status_q)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=Project)
def create_project(body: ProjectCreateBody, response: Response, request_id: str = Depends(get_request_id)) -> Project:
    response.headers["x-request-id"] = request_id
    return store.create_project(project_id=body.id, name=body.name)


@router.get("/{project_id}", response_model=Project)
def get_project(project_id: str, response: Response, request_id: str = Depends(get_request_id)) -> Project:
    response.headers["x-request-id"] = request_id
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
    ok = store.update_project(project_id=project_id, name=body.name, status=body.status)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return {"ok": True}


@router.delete("/{project_id}")
def delete_project(project_id: str, response: Response, request_id: str = Depends(get_request_id)) -> dict[str, bool]:
    response.headers["x-request-id"] = request_id
    ok = store.delete_project(project_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return {"ok": True}
