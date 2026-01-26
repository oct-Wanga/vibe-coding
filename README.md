# FSD + Next.js(App Router) 예시 프로젝트

이 레포는 **2026년 기준 Frontend 팀 컨벤션을 빠르게 적용할 수 있도록** 만든 예시입니다.

- **Next.js 16 + App Router / React 19 / TypeScript**
- **FSD(Feature-Sliced Design) 레이어링 + Public API(barrel) 규칙**
- **shadcn/ui + Tailwind**
- **TanStack Query(React Query) + Zustand(최소 UI 상태)**
- **Vitest / Playwright**

---

## 1) 실행

```bash
npm i
npm run dev
```

- http://localhost:3000

---

## 1-1) Docker 실행

```bash
# 이미지 빌드 + 컨테이너 실행
docker compose up --build
```

- http://localhost:3000

---

## 2) Scripts

```bash
# 개발
npm run dev

# 빌드
npm run build
npm run start

# 린트(ESLint)
npm run lint
npm run lint:fix

# 포맷(Prettier)
npm run format
npm run format:fix

# 테스트
npm run test            # unit (vitest)
npm run test:e2e        # e2e (playwright)
npm run test:e2e:ui
```

> `next lint --fix`는 Next 16에서 동작이 달라질 수 있어 본 프로젝트는 **eslint를 직접 실행**합니다.

---

## 2-1) 환경 변수 / Mock 모드

Supabase 연동을 사용하려면 아래 환경 변수가 필요합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY= # 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY
```

환경 변수가 없으면 `/api/projects` 관련 엔드포인트는 **mock 데이터**를 사용합니다.
- mock 데이터는 `entities/project/model/mock.ts` 기준
- `POST/PATCH/DELETE`는 성공 응답만 반환하고 **영구 저장은 하지 않습니다**

---

## 2-2) 관측/모니터링

### Health Check

간단한 헬스 체크 엔드포인트를 제공합니다.

- `GET /api/health`

요청에는 `x-request-id`가 자동으로 부여되며 헬스 응답에도 포함됩니다(프록시 경로는 `proxy.ts` 기준).

### 구조화 로그 유틸

`src/shared/lib/monitoring/logger.ts`의 유틸을 사용해 기본 JSON 로그를 남길 수 있습니다.

자세한 설계는 `docs/observability.md`를 참고하세요.

---

## 3) Tech Stack

### Core

- Next.js 16 (App Router)
- React 19
- TypeScript

### UI

- Tailwind CSS
- shadcn/ui (Radix 기반)

### Data

- TanStack Query (서버 상태)
- Zustand (UI 전역 상태 최소화)
- `fetch` 기반 API 호출

### Test

- Vitest
- Playwright

---

## 4) FSD 레이어 규칙(핵심)

이 프로젝트의 기본 레이어는 아래 순서로 의존합니다.

`app → views → widgets → features → entities → shared`

- 상위 레이어는 하위 레이어에만 의존 가능
- 하위 레이어는 상위 레이어를 import 하면 안 됨
- 이 규칙은 `eslint-plugin-boundaries`로 강제합니다.

### 레이어 역할 요약

- **app**: Next 라우팅 엔트리(페이지/레이아웃/route handler)
- **views**: 페이지 단위 컴포지션(섹션/스크린)
- **widgets**: 화면의 큰 블록(헤더/사이드바/리스트 위젯)
- **features**: 사용자 행동(유스케이스) 단위(예: 로그인, 필터 적용)
- **entities**: 도메인 엔티티(타입/키/조회/변경)
- **shared**: 공용(디자인시스템, 유틸, 공통 설정)

---

## 5) 디렉토리 구조

```
src/
  app/                    # Next App Router 엔트리
    (marketing)/
    (app)/
    api/                  # Route Handlers (/api/*)

  views/                  # 페이지(스크린) 단위 컴포지션
    projects/
    dashboard/
    marketing/

  widgets/                # 큰 UI 블록(조립 가능한 화면 구성요소)
    projects-list/
    sidebar/
    header/
    app-shell/

  features/               # 유스케이스(행동) 단위
    auth/
    projects-filter/

  entities/               # 도메인 엔티티 단위
    project/
      model/              # 타입/상수/키/순수 로직
      api/                # 엔티티 관련 fetcher
      hooks/              # React Query hooks
    user/

  shared/                 # 공용 레이어
    ui/                   # shadcn wrapper + design system export
    lib/                  # 범용 유틸(UrlSearchParams, cn 등)
    config/               # 라우트/상수 설정
    stores/               # UI 전역 state(zustand)
```

---

## 6) Public API(barrel) 규칙

각 슬라이스(예: `entities/project`)는 **외부에서 접근 가능한 export를 `index.ts`로만 노출**합니다.

✅ 권장

```ts
import { useProjects, projectKeys, type Project } from "@/entities/project";
```

❌ 지양(딥 임포트)

```ts
import { useProjects } from "@/entities/project/hooks/useProjects";
```

딥 임포트 금지는 `no-restricted-imports`로 기본 차단되어 있습니다.

---

## 7) Client / Server 컴포넌트 규칙

- **Server Component (기본)**: 데이터 프리패치/초기 렌더에 유리
- **Client Component**: 폼/상호작용/브라우저 API가 필요할 때만

### 주의: Next 16 Dynamic APIs

Next 16에서는 `params` / `searchParams`가 **Promise로 타입이 강제**될 수 있습니다.

- `page.tsx`에서 `params/searchParams` 접근 시 `await`로 언랩
- `app/api/**/route.ts`에서 `context.params`도 프로젝트 설정에 따라 `Promise`로 올 수 있어 **validator 타입에 맞춰 구현**

예시:

```ts
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  // ...
}
```

---

## 8) 데이터 설계 가이드(이 프로젝트 기준)

### Entities: 도메인 데이터 접근

- `entities/project/model`: 타입, key, 순수 도메인 로직
- `entities/project/api`: fetcher
- `entities/project/hooks`: TanStack Query hooks

### Features: 유스케이스(행동)

- 예: `features/projects-filter`는 **URL을 싱글 소스로 삼아** 필터를 적용/리셋하는 행동을 담당

### Widgets/Views: 화면 구성

- `views/projects`는 feature + widget을 조립해 스크린을 구성
- `widgets/projects-list`는 “리스트 블록” 책임만 가짐

---

## 9) 예시 라우트

- `/` : 마케팅 홈
- `/dashboard` : 대시보드 예시
- `/projects` : 프로젝트 목록 + URL 필터 + React Query
- `/projects/[id]` : 프로젝트 상세
- `/api/projects` : mock 데이터 목록 API
- `/api/projects/[id]` : mock 데이터 상세 API

---

## 10) UI(shadcn) 사용 위치

- `src/shared/ui/shadcn/*`에 shadcn 컴포넌트 래핑(또는 복사)되어 있고
- `src/shared/ui/index.ts`에서 일괄 export 합니다.

예:

```ts
import { Button, Card, Input, Select } from "@/shared/ui";
```

---

## 11) 참고

- 이 레포의 프로젝트 데이터는 `entities/project/model/mock.ts`에 **mock**으로 들어 있습니다.
- 실제 프로젝트에서는 `entities/*/api`에서 BFF(Route Handlers) 또는 외부 API 서버를 붙이면 됩니다.
