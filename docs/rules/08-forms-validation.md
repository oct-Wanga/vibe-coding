---
description: "Forms & Validation: react-hook-form + zod 강제"
globs:
  - "apps/web/src/**/*.{ts,tsx}"
---

# Forms & Validation Rules

---

## 1) 폼 구현

- 이미 설치된 **react-hook-form**을 사용하여 폼을 구현할 것.
- 폼 상태 관리를 위해 불필요하게 useState를 남발하지 말 것(필요 최소).

---

## 2) 검증 로직

- 이미 설치된 **zod**를 사용하여 검증로직을 구현할 것.
- 폼 입력 검증은 가능한 zod 스키마로 “단일 소스(SSOT)”를 만들 것.
- 검증 스키마는 원칙적으로 feature의 `schemas/`에 둔다. (공유 시 entities/shared 승격)

---

## 3) 금지

- yup/joi 등 다른 검증 라이브러리 도입(팀 표준이 zod라면)
- 검증 규칙이 UI에 분산되어 중복되는 패턴

---
