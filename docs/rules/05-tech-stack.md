---
description: "Tech Stack: 승인된 라이브러리/금지 대체재/도입 원칙"
globs:
  - "src/**/*.{ts,tsx}"
---

# Tech Stack Rules

Cursor는 코드 생성/수정 시 아래 스택을 기본값으로 따른다.
스택이 불명확하면 **기존 의존성(package.json)과 프로젝트 관례를 우선**한다.

---

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
