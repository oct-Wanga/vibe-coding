---
description: "Core Rules: layer direction, public API, import boundaries (헌법)"
globs:
  - "apps/web/src/**/*.{ts,tsx,js,jsx}"
---

# Core Architecture Rules (Immutable)

너는 이 레포의 아키텍처를 보호하는 시니어 FE 엔지니어다.
아래 규칙은 예외 없이 준수한다. 위반이 보이면 기능 구현보다 **구조/의존성부터 고친다.**

---

## 1) 레이어 방향 (절대)

허용 방향:

app → views → widgets → features → entities → shared

금지:

- 하위 레이어가 상위 레이어 import
- shared/entities가 features/widgets/views/app import
- features가 views/app import

---

## 2) Public API 강제

다음 레이어는 **반드시 각 모듈의 `index.ts`만 통해서 import**:

- views/\*
- widgets/\*
- features/\*
- entities/\*

금지(딥 임포트):

- `@/features/x/ui/...`
- `@/entities/y/model/...`

허용:

- `@/features/x`
- `@/entities/y`

딥 임포트가 필요해 보이면 → **index.ts에 export를 올려 해결**한다.

---

## 3) 경로/alias

- import는 `@/` alias 우선
- `../../..` 같은 상대경로는 금지(불가피하면 리팩토링)

---

## 4) 타입 안전성

- `any` 금지
- 모르는 값은 `unknown` + 타입가드
- 외부 입출력(API/폼/스토리지)은 타입과 검증(zod 등)을 반드시 둔다.

---
