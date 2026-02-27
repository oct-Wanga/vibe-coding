from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from redis.exceptions import RedisError

from app.api.deps import get_request_id
from app.core.config import settings
from app.models.schemas import LoginBody, SignupBody
from app.services.activity_logs import insert_activity_log
from app.services.session_store import session_store
from app.services.store import store

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
def signup(body: SignupBody, response: Response, request_id: str = Depends(get_request_id)) -> dict[str, object]:
    response.headers["x-request-id"] = request_id
    user_id, created = store.signup(body.email, body.password)
    if not created:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="이미 가입된 이메일입니다")
    insert_activity_log("auth.signup", "User signed up", actor=user_id)
    return {"ok": True, "userId": user_id, "needsEmailConfirm": False}


@router.post("/login")
def login(body: LoginBody, response: Response, request_id: str = Depends(get_request_id)) -> dict[str, bool]:
    response.headers["x-request-id"] = request_id
    user_id = store.verify_login(body.email, body.password)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="로그인 실패")

    try:
        token = session_store.create(user_id)
    except RedisError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="세션 저장소 오류") from exc

    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        secure=settings.session_cookie_secure,
        httponly=settings.session_cookie_httponly,
        samesite=settings.session_cookie_samesite,
    )
    insert_activity_log("auth.login", "User logged in", actor=user_id)
    return {"ok": True}


@router.post("/logout")
def logout(
    response: Response,
    request_id: str = Depends(get_request_id),
    session_token: str | None = Cookie(default=None, alias=settings.session_cookie_name),
) -> dict[str, bool]:
    response.headers["x-request-id"] = request_id
    actor: str | None = None
    try:
        user = session_store.resolve(session_token)
        actor = user["sub"] if user else None
    except RedisError:
        actor = None
    try:
        session_store.delete(session_token)
    except RedisError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="세션 저장소 오류") from exc
    response.delete_cookie(settings.session_cookie_name)
    insert_activity_log("auth.logout", "User logged out", actor=actor)
    return {"ok": True}


@router.get("/me")
def me(
    response: Response,
    request_id: str = Depends(get_request_id),
    session_token: str | None = Cookie(default=None, alias=settings.session_cookie_name),
) -> dict[str, object | None]:
    response.headers["x-request-id"] = request_id
    try:
        user = session_store.resolve(session_token)
    except RedisError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="세션 저장소 오류") from exc
    return {"user": user}
