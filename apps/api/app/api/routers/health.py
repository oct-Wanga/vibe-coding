from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Response

from app.api.deps import get_request_id
from app.core.config import settings
from app.models.schemas import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
def get_health(response: Response, request_id: str = Depends(get_request_id)) -> HealthResponse:
    response.headers["x-request-id"] = request_id
    return HealthResponse(
        timestamp=datetime.now(UTC),
        env=settings.app_env,
        request_id=request_id,
    )
