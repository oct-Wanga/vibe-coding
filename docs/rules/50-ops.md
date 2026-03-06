---
alwaysApply: false
description: "Ops: caching, env, logging, error, auth unification"
globs:
  - "apps/web/src/**/*.{ts,tsx,js,jsx}"
---

# Operations Rules

- 캐싱 원칙 혼용 금지(프로젝트 전체 일관)
- 인증/세션(JWT header vs HttpOnly cookie) 통일
- 에러 포맷/로깅(구조화) 통일
- 환경변수 NEXT*PUBLIC* 규칙 준수, 서버 전용 env 노출 금지

---
