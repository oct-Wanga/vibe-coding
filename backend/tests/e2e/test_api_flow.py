from fastapi.testclient import TestClient

from app.main import app


def test_api_signup_login_and_projects_flow() -> None:
    client = TestClient(app)

    signup = client.post("/api/auth/signup", json={"email": "demo@example.com", "password": "secret123"})
    assert signup.status_code == 200
    assert signup.json()["ok"] is True

    login = client.post("/api/auth/login", json={"email": "demo@example.com", "password": "secret123"})
    assert login.status_code == 200

    create = client.post("/api/projects", json={"id": "e2e-p1", "name": "E2E 프로젝트"})
    assert create.status_code == 201

    list_response = client.get("/api/projects")
    assert list_response.status_code == 200
    assert any(project["id"] == "e2e-p1" for project in list_response.json())
