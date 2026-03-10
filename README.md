# 바이브 코딩 (Vibe Coding)

`Vibe Coding`은 아래 스택을 기준으로 운영 관점까지 포함해 학습/실험하는 풀스택 레퍼런스입니다.

- Next.js 16 (App Router) + React + TypeScript
- FastAPI
- Redis (세션/로그인 제한)
- Kafka (Outbox Relay)
- Sentry (FE/BE 관측)

## 1) 구성

| 영역 | 설명 |
| --- | --- |
| `apps/web` | Next.js 16 + FSD 웹 앱 |
| `apps/api` | FastAPI 백엔드 (인증/세션/프로젝트 API) |
| `Redis` | 세션/로그인 제한 저장소 |
| `Kafka` | Outbox relay 이벤트 파이프라인 (선택) |
| `Sentry` | FE/BE 에러 및 샘플링 기반 성능 모니터링 |
| `packages/contracts` | FE/BE 공용 타입/계약 |

## 2) 아키텍처 요약

```text
apps/web (Next.js, FSD)
  -> /api/* (Route Handler / Proxy)
    -> apps/api (FastAPI)
      -> Redis (session, rate-limit)
      -> Outbox Relay -> Kafka (optional)
```

- 기본 사용자 진입점: `apps/web`
- API 모드:
  - `API_BACKEND=route` (기본)
  - `API_BACKEND=fastapi`

## 3) 빠른 시작

### 3-1) 웹만 실행

```bash
npm i
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

- Web: `http://localhost:3000`

### 3-2) 웹 + API + Redis

```bash
docker compose up --build
```

- Web: `http://localhost:3000`
- FastAPI Docs: `http://localhost:8000/docs`
- RedisInsight: `http://localhost:5540`

### 3-3) Kafka 포함 전체 스택

```bash
npm run containers:up
```

- Kafka Broker: `localhost:9094`
- Kafka UI: `http://localhost:8080`
- Schema Registry: `http://localhost:8081`

종료:

```bash
npm run containers:down
```

## 4) 주요 스크립트

```bash
# dev
npm run dev
npm run dev:web
npm run dev:api
npm run dev:all

# test
npm run test
npm run test:api
npm run test:all
npm run test:e2e

# infra
npm run kafka:up
npm run kafka:down
npm run containers:up
npm run containers:down
```

## 5) CI/CD (GitHub Actions)

- 워크플로 파일: `.github/workflows/ci.yml`
- 트리거:
  - `push` (모든 브랜치)
  - `pull_request`
- 검증 잡:
  - `Web Lint`
  - `Web Unit Test`
  - `API Unit Test`
  - `Web Build`
- 릴리즈:
  - `main` 브랜치 `push`에서만 실행
  - `semantic-release`로 `vX.Y.Z` 태그 + GitHub Release 생성
  - release job Node 버전: `24`

## 6) 테스트 기준

- Web unit: Vitest
- Web e2e: Playwright
- API: pytest

E2E 백엔드 분기 예시:

```bash
API_BACKEND=route npm run test:e2e
API_BACKEND=fastapi FASTAPI_BASE_URL=http://localhost:8000 npm run test:e2e
```

## 7) 환경 변수 핵심

| 영역 | 핵심 변수 |
| --- | --- |
| Web(Supabase) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 또는 `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| API 모드 | `API_BACKEND`, `FASTAPI_BASE_URL` |
| API 세션 | `SESSION_STORE_BACKEND`, `REDIS_URL` |
| Kafka relay | `OUTBOX_RELAY_ENABLED`, `KAFKA_BOOTSTRAP_SERVERS` |
| Sentry FE | `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_ENVIRONMENT`, `NEXT_PUBLIC_SENTRY_RELEASE` |
| Sentry BE | `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE` |

## 8) Sentry 수집 범위

- FE(`apps/web`)
  - 수집: 브라우저 런타임 예외, App Router request error, 샘플링된 트랜잭션
  - 일반 비수집: 정상 비즈니스 실패(예: 401/400)
- BE(`apps/api`)
  - 수집: 미처리 예외/오류 로그, 샘플링된 API 트랜잭션
  - 제외: `/api/health` 트랜잭션

## 9) 문서 맵

- 아키텍처: `docs/architecture.md`
- 확장 로드맵: `docs/architecture-roadmap.md`
- 관측: `docs/observability.md`
- Git 전략: `docs/git-strategy.md`
- CI 규칙: `docs/rules/71-ci.md`
- Web 가이드: `apps/web/README.md`
- API 가이드: `apps/api/README.md`
- Kafka 가이드: `scripts/kafka/README.md`
