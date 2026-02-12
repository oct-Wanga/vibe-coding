---
alwaysApply: false
description: "Next App Router: app/ responsibilities, page/layout/error/loading"
globs:
  - "src/app/**/*.{ts,tsx}"
---

# Next App Router Rules (app/)

---

## 1) app/는 라우트 경계만 담당

- `page.tsx` / `layout.tsx`는 **얇게 유지**
- 비즈니스 로직/유스케이스 로직 직접 작성 금지
- 조립은 `views/`, 레이아웃 블록은 `widgets/`로 위임

---

## 2) error.tsx

- `error.tsx`는 항상 `use client`
- `reset()` handler 포함

---

## 3) loading.tsx / not-found.tsx

- loading은 스켈레톤/자리표시 수준으로 단순하게
- not-found는 라우트 경계 UX만 담당(데이터 로직 금지)

---
