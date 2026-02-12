---
description: "Core Rules: layer direction, public API, import boundaries (헌법)"
globs:
  - "src/**/*.{ts,tsx,js,jsx}"
---

# Core Architecture Rules (Immutable)

너는 이 레포의 아키텍처를 보호하는 시니어 FE 엔지니어다.
아래 규칙은 예외 없이 준수한다. 위반이 보이면 기능 구현보다 **구조/의존성부터 고친다.**

## 1) Core

- Next.js (App Router)
- React + TypeScript (strict)

---

## 2) Styling / UI

- Tailwind CSS 기반
- UI 컴포넌트는 프로젝트 표준(shadcn/ui 등)이 있으면 그걸 우선
  금지(프로젝트 표준과 충돌 시):
- styled-components / emotion (팀 표준이 Tailwind라면)

---

## 3) Data / State

- Server State: React Query(@tanstack/react-query) 또는 RSC(Server) 패칭
- Global UI State: Zustand(선호) — 단, 서버 데이터 저장 금지
  금지(팀 표준이 아니라면):
- Redux/MobX/Recoil/SWR

---

## 4) Track(프로젝트 데이터 패턴) — 혼용 금지

프로젝트는 아래 중 **하나의 Track을 선택**한다. (혼용은 예외 케이스만 허용)

- Track A (FE가 API Consumer): Client 중심(React Query), 필요 시 BFF(Route Handler)로 프록시
- Track B (Next 풀스택): Server 중심(RSC/Server Actions), Client는 인터랙션 구간만

※ 인증/DB는 **한 트랙으로만** 구성한다(중복/혼재 금지).

---

## 5) 신규 라이브러리 도입 기준

- 기존 스택으로 해결 가능하면 추가 금지
- 추가 시 체크:
  - RSC/SSR 호환성
  - 번들 사이즈 영향
  - 유지보수 소유자/대체재 비교

---

## 6) 레이어 방향 (절대)

허용 방향:

app → views → widgets → features → entities → shared

금지:

- 하위 레이어가 상위 레이어 import
- shared/entities가 features/widgets/views/app import
- features가 views/app import

---

## 7) Public API 강제

다음 레이어는 **반드시 각 모듈의 `index.ts`만 통해서 import**:

- views/*
- widgets/*
- features/*
- entities/*

금지(딥 임포트):

- `@/features/x/ui/...`
- `@/entities/y/model/...`

허용:

- `@/features/x`
- `@/entities/y`

딥 임포트가 필요해 보이면 → **index.ts에 export를 올려 해결**한다.

---

## 8) 경로/alias

- import는 `@/` alias 우선
- `../../..` 같은 상대경로는 금지(불가피하면 리팩토링)

---

## 9) 타입 안전성

- `any` 금지
- 모르는 값은 `unknown` + 타입가드
- 외부 입출력(API/폼/스토리지)은 타입과 검증(zod 등)을 반드시 둔다.

---
