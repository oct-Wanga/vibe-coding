---
description: "Server Actions / Route Handlers 선택 기준 + 위치 규정"
globs:
  - "src/**/*.{ts,tsx}"
  - "src/app/**/*.{ts,tsx}"
---

# Server Actions & Route Handlers Rules

Track B(Next 풀스택)에서는 **쓰기 경로를 Server Actions로 통일**한다.
Route Handler는 “서버-서버 통신/외부 공개 API” 중심으로 제한한다.

---

## 1) 우선순위

- Write: Server Actions 우선
- Read: RSC(Server) 우선, 필요 시 React Query 보조

---

## 2) Route Handler 허용 케이스

허용:
- 외부 서비스 웹훅 수신
- 외부 공개 API
- 서버 간 통신 등 HTTP endpoint가 명확히 필요할 때

금지(대부분 SA로 대체 가능):
- 단순 CRUD를 습관적으로 `/api/*`로 만드는 것
- “Client에서 fetch 편해서” Route Handler 만드는 것

---

## 3) 위치

- Server Actions: `src/features/<feature>/actions/*.ts`
- Route Handlers: `src/app/api/**/route.ts` (라우트는 얇게, 로직은 feature로 위임)

---

## 4) 검증/에러

- 입력은 zod 등으로 검증
- 에러를 숨기지 말고 전파(보안 메시지 분리)

---
