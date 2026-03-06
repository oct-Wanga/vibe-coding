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

- Frontend: http://localhost:3000
- FastAPI Docs: http://localhost:8000/docs
- RedisInsight Dashboard: http://localhost:5540

RedisInsight에서 Redis 연결 시 아래 값을 사용합니다.

- Host: `redis` (또는 `localhost`)
- Port: `6379`
- DB: `0`
- Username/Password: 없음

---

## 1-2) FastAPI 백엔드 실행

이제 `/api/*`는 Next Route Handler가 **FastAPI(8000)** 로 프록시합니다.

```bash
# 백엔드
cd apps/api
pip install -r requirements.txt
# Redis가 없으면 세션 저장소를 memory로 지정
# export SESSION_STORE_BACKEND=memory
uvicorn app.main:app --reload --port 8000

# 프론트엔드(루트, macOS/Linux)
API_BACKEND=fastapi FASTAPI_BASE_URL=http://localhost:8000 npm run dev
```

```powershell
# 프론트엔드(루트, PowerShell)
$env:API_BACKEND="fastapi"
$env:FASTAPI_BASE_URL="http://localhost:8000"
npm run dev
```

- `API_BACKEND=route`(기본): 기존 Next Route Handler 사용
- `API_BACKEND=fastapi`: Next Route Handler가 FastAPI로 프록시
- FastAPI 기본 URL: `http://localhost:8000`
- Next API 프록시 URL: `http://localhost:3000/api/*`
- FastAPI에서 `activity_logs`를 Supabase에 기록하려면 아래 환경 변수를 추가로 설정:
  - `SUPABASE_SERVICE_ROLE_KEY=`

---

## 1-3) Kafka 테스트 환경 실행

테스트용으로 `Kafka(KRaft 1 broker) + Schema Registry + Kafka UI`를 별도 compose로 제공합니다.

```bash
npm run kafka:up
```

- Kafka Broker: `localhost:9094`
- Schema Registry: http://localhost:8081
- Kafka UI: http://localhost:8080

중지/정리:

```bash
npm run kafka:down
```

앱(`api/web`) + Kafka를 한 번에 올리려면:

```bash
npm run kafka:up:all
```

---

## 2) Scripts

```bash
# 개발
npm run dev
npm run dev:web
npm run dev:api

# 빌드
npm run build
npm run build:web
npm run start
npm run start:web

# 린트(ESLint)
npm run lint
npm run lint:web
npm run lint:fix

# 포맷(Prettier)
npm run format
npm run format:fix

# 테스트
npm run test            # unit (vitest)
npm run test:web
npm run test:api
npm run test:e2e        # e2e (playwright)
npm run test:e2e:ui

# kafka (로컬 테스트)
npm run kafka:up
npm run kafka:topics
npm run kafka:produce
npm run kafka:consume
npm run kafka:consume:dlq
npm run kafka:test      # 100건 발행 + DLQ 검증 smoke test
npm run kafka:down

npm run release:dry-run # 릴리즈 시뮬레이션
npm run release         # semantic-release 실행
```

### 2-1) Workspace(모노레포 1단계)

- 루트는 워크스페이스 오케스트레이터 역할을 하며, 앱 엔트리는 아래와 같습니다.
  - `apps/web`: Next.js 워크스페이스 엔트리(실소스는 `apps/web` 기준)
  - `apps/api`: FastAPI 워크스페이스 엔트리
- 점진적으로 `apps/*`, `packages/*` 구조로 이동할 수 있도록 1단계 레이아웃을 적용했습니다.

> `next lint --fix`는 Next 16에서 동작이 달라질 수 있어 본 프로젝트는 **eslint를 직접 실행**합니다.

---

## 2-2) 환경 변수 / Mock 모드

Supabase 연동을 사용하려면 아래 환경 변수가 필요합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# 또는
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

환경 변수가 없으면 `/api/projects` 관련 엔드포인트는 **mock 데이터**를 사용합니다.

- mock 데이터는 `apps/web/src/entities/project/model/mock.ts` 기준
- `POST/PATCH/DELETE`는 성공 응답만 반환하고 **영구 저장은 하지 않습니다**

---

## 2-3) E2E 백엔드 모드 분리

E2E 테스트는 `API_BACKEND` 값에 따라 `route` 전용/`fastapi` 전용 케이스로 분리되어 있습니다.

- `API_BACKEND=route`: `*.spec.ts`(route 전용) 실행, `*.fastapi.spec.ts`는 skip
- `API_BACKEND=fastapi`: `*.fastapi.spec.ts` 실행, route 전용은 skip

### Route 모드 실행

```powershell
$env:API_BACKEND="route"
npm run test:e2e
```

```bash
API_BACKEND=route npm run test:e2e
```

### FastAPI 모드 실행

FastAPI 서버(`http://localhost:8000`)가 먼저 떠 있어야 합니다.

```powershell
docker compose up -d redis api
$env:API_BACKEND="fastapi"
$env:FASTAPI_BASE_URL="http://localhost:8000"
npm run test:e2e
```

```bash
docker compose up -d redis api
API_BACKEND=fastapi FASTAPI_BASE_URL=http://localhost:8000 npm run test:e2e
```

---

## 2-4) 관측/모니터링

### Health Check

간단한 헬스 체크 엔드포인트를 제공합니다.

- `GET /api/health`

요청에는 `x-request-id`가 자동으로 부여되며 헬스 응답에도 포함됩니다(프록시 경로는 `proxy.ts` 기준).

### 구조화 로그 유틸

`apps/web/src/shared/lib/monitoring/logger.ts`의 유틸을 사용해 기본 JSON 로그를 남길 수 있습니다.

자세한 설계는 `docs/observability.md`를 참고하세요.

### Sentry (무료 플랜)

실제 운영 환경 기준으로 `@sentry/nextjs` 패키지와 공식 설정 파일을 사용합니다.

```
npm install @sentry/nextjs
```

현재 패키지 버전: `@sentry/nextjs` 10.x (10.36.0)

```
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_ENVIRONMENT=development
```

클라이언트/서버 모두 수집하려면 `SENTRY_DSN`과 `NEXT_PUBLIC_SENTRY_DSN`을 **둘 다** 설정합니다(보통 동일 DSN 사용).

설정 여부 확인:

- `GET /api/observability/sentry`

DSN 확인 위치:

- Sentry 대시보드 → Project Settings → Client Keys (DSN)에서 확인합니다.

설정 파일:

- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

실제 사용 요약:

- `apps/web/src/instrumentation.ts`에서 런타임별 Sentry 설정을 로딩합니다.
- `apps/web/src/instrumentation-client.ts`에서 브라우저 계측(Replay 포함)을 초기화합니다.
- 직접 에러를 보낼 때는 `Sentry.captureException` 또는 `Sentry.captureMessage`를 사용합니다.

이벤트/로그 확인:

1. 개발 서버 실행 후, 클라이언트/서버에서 `Sentry.captureMessage` 또는 `Sentry.captureException`을 호출합니다.
2. Sentry 대시보드의 Issues/Discover에서 이벤트 유입을 확인합니다.
3. Replay 사용 시 Project → Replays에서 세션 기록을 확인합니다.

---

## 2-5) 버전/태그 자동화(semantic-release)

이 프로젝트는 `main` 브랜치에서 GitLab CI가 `semantic-release`를 실행해 버전을 자동 산정합니다.

- 자동 생성: Git tag (`vX.Y.Z`), Release notes
- 버전 계산 기준: Conventional Commits
  - `feat:` -> minor
  - `fix:` -> patch
  - `BREAKING CHANGE` 또는 `type!:` -> major

### CI 설정

- 파일: `.gitlab-ci.yml`
- 설정: `.releaserc.json`
- 실행 브랜치: `main`

### 필수 토큰

GitLab 프로젝트/그룹 CI 변수에 아래를 추가합니다.

- `GITLAB_TOKEN` (또는 `GL_TOKEN`)
  - 권한: 최소 `api`, `write_repository`
  - 보호 브랜치(`main`)에 push/tag 가능한 계정 토큰 권장

### 로컬 점검

```bash
npm run release:dry-run
```

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
apps/web/src/
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
      api/queries/        # 엔티티 관련 fetcher + React Query hooks
      lib/                # 엔티티 유틸(포맷/필터 등)
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
import { useProjects } from "@/entities/project/api/queries/useProjects";
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
- `entities/project/api/queries`: fetcher + TanStack Query hooks
- `entities/project/lib`: 필터/포맷 등 엔티티 유틸

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

- `apps/web/src/shared/ui/shadcn/*`에 shadcn 컴포넌트 래핑(또는 복사)되어 있고
- `apps/web/src/shared/ui/index.ts`에서 일괄 export 합니다.

예:

```ts
import { Button, Card, Input, Select } from "@/shared/ui";
```

---

## 11) 참고

- 이 레포의 프로젝트 데이터는 `apps/web/src/entities/project/model/mock.ts`에 **mock**으로 들어 있습니다.
- 실제 프로젝트에서는 `entities/*/api`에서 BFF(Route Handlers) 또는 외부 API 서버를 붙이면 됩니다.

---

## 12) Kafka 테스트 시나리오

상세 학습 가이드는 `scripts/kafka/README.md`를 참고하세요.

### Kafka 적용 로직(이 프로젝트)

#### 0) 전체 그림

```text
Client
  -> FastAPI (/api/projects)
    -> InMemoryStore (project 저장 + outbox pending 저장)
      -> OutboxRelay (polling)
        -> Kafka Topic (projects.project-created.v1)
          -> Consumer Worker
            -> [성공] offset commit
            -> [실패] DLQ Topic (events.dlq.v1)
```

#### A. 샘플 스크립트 기반 로직

```text
npm run kafka:topics
  -> 토픽 생성

npm run kafka:produce
  -> projects.project-created.v1 이벤트 발행

npm run kafka:consume
  -> 이벤트 소비
    -> 정상: 처리 + offset commit
    -> 실패(force_fail): events.dlq.v1로 이동

npm run kafka:consume:dlq
  -> DLQ 이벤트/실패 사유 확인
```

1. `kafka:topics`
  - `projects.project-created.v1`, `events.dlq.v1` 토픽을 생성합니다.
2. `kafka:produce`
  - 프로젝트 생성 이벤트를 발행합니다.
  - `project_id`를 key로 사용해 같은 프로젝트 이벤트는 같은 파티션으로 라우팅됩니다.
3. `kafka:consume`
  - 이벤트를 소비하고 정상 처리 시 offset을 커밋합니다.
  - `force_fail=true` 이벤트는 실패로 간주하고 `events.dlq.v1`로 보냅니다.
4. `kafka:consume:dlq`
  - DLQ 토픽을 읽어 실패 원인(`reason`)을 확인합니다.

#### B. 백엔드 Outbox 연동 로직

```text
POST /api/projects
  -> 프로젝트 저장 + outbox(pending) 저장
    -> relay worker polling
      -> Kafka publish (projects.project-created.v1)
        -> 성공: outbox published
        -> 실패: outbox failed(attempts 증가)
```

1. 클라이언트가 `POST /api/projects` 호출
2. 백엔드 `store.create_project()`에서
  - 프로젝트 데이터 저장
  - outbox 이벤트를 `pending` 상태로 함께 저장
3. `OUTBOX_RELAY_ENABLED=true`이면 FastAPI 시작 시 relay worker 실행
4. relay가 pending/failed outbox를 읽어 Kafka 토픽으로 발행
5. 발행 성공 시 outbox 상태를 `published`로 변경, 실패 시 `failed` + `attempts` 증가
6. `GET /api/projects/outbox/summary`로 상태 집계(`pending/failed/published`) 확인

즉, 이 구조는 "API 처리 성공 후 이벤트 유실"을 줄이기 위한 Outbox 패턴의 최소 샘플입니다.

### 빠른 시작

```bash
npm run kafka:up
npm run kafka:topics
npm run kafka:test
```

`kafka:test`는 아래를 자동으로 수행합니다.

1. 토픽 생성 확인 (`projects.project-created.v1`, `events.dlq.v1`)
2. 테스트 이벤트 100건 발행 (`FAIL_EVERY=10` 기본)
3. 컨슈머 처리 중 실패 이벤트를 DLQ로 이동
4. DLQ 건수 검증 후 성공/실패 출력

### 수동 확인 (학습용)

터미널 A:

```bash
npm run kafka:consume
```

터미널 B:

```bash
npm run kafka:produce
```

터미널 C:

```bash
npm run kafka:consume:dlq
```

### 환경 변수(선택)

- `COUNT`: 발행 건수 (기본 `100`)
- `FAIL_EVERY`: N건마다 실패 이벤트 주입 (기본 `10`)
- `RUN_ID`: 실행 식별자(미지정 시 자동 생성)
- `GROUP_ID`: 컨슈머 그룹 ID(미지정 시 자동 생성)
- `MAX_MESSAGES`: consumer가 처리 후 종료할 최대 건수 (`0`이면 계속 실행)

### 실행 환경별 Kafka 주소 기준

- 로컬에서 Node 스크립트 실행(`npm run kafka:*`): `localhost:9094`
- Docker `api` 컨테이너에서 Kafka 접근: `kafka:9092`

`docker-compose.yml`의 `api` 서비스는 위 기준에 맞게
`OUTBOX_RELAY_ENABLED=true`, `KAFKA_BOOTSTRAP_SERVERS=kafka:9092`로 기본 설정되어 있습니다.
