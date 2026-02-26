from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status

from app.api.deps import get_request_id
from app.models.schemas import LoginBody, SignupBody
from app.services.store import store

router = APIRouter(prefix="/auth", tags=["auth"])
SESSION_COOKIE = "session_token"


@router.post("/signup")
def signup(body: SignupBody, response: Response, request_id: str = Depends(get_request_id)) -> dict[str, object]:
    response.headers["x-request-id"] = request_id
    user_id, created = store.signup(body.email, body.password)
    if not created:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="이미 가입된 이메일입니다")
    return {"ok": True, "userId": user_id, "needsEmailConfirm": False}


@router.post("/login")
def login(body: LoginBody, response: Response, request_id: str = Depends(get_request_id)) -> dict[str, bool]:
    response.headers["x-request-id"] = request_id
    token = store.login(body.email, body.password)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="로그인 실패")
    response.set_cookie(key=SESSION_COOKIE, value=token, httponly=True, samesite="lax")
    return {"ok": True}


@router.post("/logout")
def logout(
    response: Response,
    request_id: str = Depends(get_request_id),
    session_token: str | None = Cookie(default=None),
) -> dict[str, bool]:
    response.headers["x-request-id"] = request_id
    if session_token:
        store.logout(session_token)
    response.delete_cookie(SESSION_COOKIE)
    return {"ok": True}


@router.get("/me")
def me(
    response: Response,
    request_id: str = Depends(get_request_id),
    session_token: str | None = Cookie(default=None),
) -> dict[str, object | None]:
    response.headers["x-request-id"] = request_id
    user = store.resolve_user(session_token)
    return {"user": user}
