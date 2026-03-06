---
alwaysApply: false
description: "Contracts Rules: packages/contracts 타입/스키마 관리 원칙"
globs:
  - "packages/contracts/**/*.ts"
  - "apps/web/src/**/*.ts"
  - "apps/web/src/**/*.tsx"
---

# Contracts Rules

## 1) 공용 계약 우선

- FE/BE 간 공유되는 요청/응답 타입과 검증 스키마는 `packages/contracts`를 우선 사용한다.
- 동일 계약을 앱 내부에 중복 정의하지 않는다.

## 2) 변경 호환성

- contracts 변경 시 영향받는 소비자(`apps/web`, `apps/api`)를 함께 점검한다.
- 기존 필드를 제거/의미 변경할 때는 호환성 영향을 커밋/문서에 명시한다.

## 3) 의존성 원칙

- contracts는 가능한 가볍게 유지한다.
- 앱 전용 구현 상세(프레임워크/런타임 의존 로직)는 contracts에 넣지 않는다.
