---
alwaysApply: false
description: "Backend API Rules: FastAPI 계층, 설정, Redis/테스트 환경 원칙"
globs:
  - "apps/api/app/**/*.py"
  - "apps/api/tests/**/*.py"
  - "apps/api/.env.test"
  - "apps/api/README.md"
---

# Backend API Rules

## 1) 계층/책임

- 라우터(`api/routers`)는 얇게 유지하고, 핵심 로직은 `services`로 위임한다.
- 설정값은 `core/config.py`를 통해 읽고, 코드에 하드코딩하지 않는다.

## 2) 저장소/장애 처리

- Redis 장애는 기본적으로 명시적 오류(예: 503)로 드러나야 한다.
- fallback 동작은 설정 플래그로만 제어하고, 기본 동작으로 장애를 숨기지 않는다.

## 3) 테스트 환경

- 테스트 전용 환경값은 `apps/api/.env.test`를 단일 소스(SSOT)로 사용한다.
- 테스트 코드에서 `os.environ` 하드코딩은 지양하고, 필요한 경우 최소 범위로만 오버라이드한다.
