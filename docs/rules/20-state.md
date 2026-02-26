---
description: "State: React Query/Zustand/URL, provider 위치, queryKey 규칙"
globs:
  - "src/**/*.{ts,tsx}"
---

# State Management Rules

---

## 1) React Query (Server State)

- GET → useQuery / WRITE → useMutation
- queryKey는 factory로 통일(`model/keys.ts` 등)
- 훅 위치:
  - `features/<feature>/api/use*.ts`
  - `entities/<entity>/api/use*.ts`

Provider:

- QueryClientProvider는 단일 진입점(권장: `src/app/providers.tsx`)에 1회만 둔다.

---

## 2) Zustand (Global UI)

- 모달/토글 등 UI 전역만
- 서버 데이터 저장 금지
- 위치: `shared/stores/*` (feature 전용은 최소)

---

## 3) URL State

- pagination/filter/sort/search는 URL 우선

---
