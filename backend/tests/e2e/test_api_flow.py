import os

os.environ["SESSION_STORE_BACKEND"] = "memory"
os.environ["OUTBOX_ENABLED"] = "true"

from fastapi.testclient import TestClient

from app.main import app


def test_api_signup_login_and_projects_flow() -> None:
    client = TestClient(app)

    signup = client.post("/api/auth/signup", json={"email": "demo@example.com", "password": "secret123"})
    assert signup.status_code == 200
    assert signup.json()["ok"] is True

    login = client.post("/api/auth/login", json={"email": "demo@example.com", "password": "secret123"})
    assert login.status_code == 200
    set_cookie_header = login.headers.get("set-cookie", "")
    assert "session_token=" in set_cookie_header
    assert "HttpOnly" in set_cookie_header
    assert "SameSite=lax" in set_cookie_header

    me = client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["user"] is not None

    create = client.post("/api/projects", json={"id": "e2e-p1", "name": "E2E 프로젝트"})
    assert create.status_code == 201

    outbox_summary = client.get("/api/projects/outbox/summary")
    assert outbox_summary.status_code == 200
    assert outbox_summary.json()["total"] >= 1
    assert outbox_summary.json()["pending"] >= 1

    list_response = client.get("/api/projects")
    assert list_response.status_code == 200
    assert any(project["id"] == "e2e-p1" for project in list_response.json())


def test_cors_allows_configured_origin() -> None:
    client = TestClient(app)
    response = client.options(
        "/api/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
