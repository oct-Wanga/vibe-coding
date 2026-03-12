from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from app.main import app


REPO_ROOT = Path(__file__).resolve().parents[4]
AUTH_CONTRACT_PATH = REPO_ROOT / "packages/contracts/src/auth.ts"


def _read_contract(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _extract_schema_block(source: str, schema_name: str) -> str:
    pattern = re.compile(
        rf"export const {schema_name}\s*=\s*z\s*\.\s*object\(\s*\{{(?P<body>.*?)\}}\s*\)",
        re.DOTALL,
    )
    match = pattern.search(source)
    if not match:
        raise AssertionError(f"{schema_name} not found in contracts")
    return match.group("body")


def _extract_min_length(schema_block: str, field_name: str) -> int:
    pattern = re.compile(rf"{field_name}\s*:\s*z\.string\(\)\.min\((?P<min>\d+)")
    match = pattern.search(schema_block)
    if not match:
        raise AssertionError(f"{field_name}.min(...) not found in contracts")
    return int(match.group("min"))


def _resolve_schema(spec: dict[str, Any], ref: str) -> dict[str, Any]:
    name = ref.rsplit("/", maxsplit=1)[-1]
    return spec["components"]["schemas"][name]


def test_auth_constraints_match_contracts() -> None:
    auth_contract = _read_contract(AUTH_CONTRACT_PATH)
    login_block = _extract_schema_block(auth_contract, "loginSchema")
    signup_block = _extract_schema_block(auth_contract, "signupSchema")

    expected_login_password_min = _extract_min_length(login_block, "password")
    expected_signup_password_min = _extract_min_length(signup_block, "password")

    spec = app.openapi()
    login_ref = spec["paths"]["/api/auth/login"]["post"]["requestBody"]["content"]["application/json"]["schema"]["$ref"]
    signup_ref = spec["paths"]["/api/auth/signup"]["post"]["requestBody"]["content"]["application/json"]["schema"]["$ref"]
    login_schema = _resolve_schema(spec, login_ref)
    signup_schema = _resolve_schema(spec, signup_ref)

    login_password = login_schema["properties"]["password"]
    signup_password = signup_schema["properties"]["password"]
    login_email = login_schema["properties"]["email"]
    signup_email = signup_schema["properties"]["email"]

    assert set(login_schema["required"]) == {"email", "password"}
    assert set(signup_schema["required"]) == {"email", "password"}
    assert login_email.get("format") == "email"
    assert signup_email.get("format") == "email"
    assert login_password.get("minLength") == expected_login_password_min
    assert signup_password.get("minLength") == expected_signup_password_min
