# FSD Monorepo Reference

이 저장소는 단순한 "FSD 프론트엔드 예제"에서 확장되어, 현재는 아래를 한 번에 다루는 **모노레포 레퍼런스**입니다.

- `apps/web`: Next.js 16 + FSD 구조의 웹 앱
- `apps/api`: FastAPI 백엔드(인증/세션/프로젝트 API)
- `Redis`: 세션/로그인 제한 저장소
- `Kafka`: Outbox relay 기반 비동기 이벤트 실험
- `packages/contracts`: FE/BE 공용 계약(schema/type)

즉, 이 프로젝트의 스토리는
**"FSD 프론트엔드 구조를 유지하면서, 실제 서비스 운영 요소(API/세션/비동기 이벤트)까지 단계적으로 붙여 본 통합 예제"**입니다.

## 1) 현재 아키텍처 한눈에 보기

```text
apps/web (Next.js, FSD)
  -> /api/* (Route Handler / Proxy)
    -> apps/api (FastAPI)
      -> Redis (session, rate-limit)
      -> Outbox Relay -> Kafka (optional)
```

- 기본 사용자 진입은 `apps/web`
- API 실행 모드는 `API_BACKEND`로 분기
  - `route` (기본): Next Route Handler 중심
  - `fastapi`: Next가 FastAPI로 프록시
- Kafka는 항상 필수는 아니고, **Outbox/이벤트 흐름 검증 시 선택적으로 활성화**

## 2) 빠른 시작

실행 전에 아키텍처 경로를 먼저 보면 이해가 빠릅니다.

- Local 경로 보기: [docs/architecture.md#4-local-run-path-npm-run-dev-중심](docs/architecture.md#4-local-run-path-npm-run-dev-중심)
- Docker 경로 보기: [docs/architecture.md#5-docker-run-path-docker-compose--containersup](docs/architecture.md#5-docker-run-path-docker-compose--containersup)

### 2-1) 권장 시작 시나리오(체크리스트)

- [ ] UI/FSD 구조만 빠르게 확인: `npm i` -> `npm run dev`
- [ ] API/세션까지 함께 확인: `docker compose up --build`
- [ ] 이벤트 파이프라인(Outbox->Kafka->DLQ)까지 확인: `npm run containers:up` 후 `npm run kafka:test`

### 2-2) 웹(FSD)만 빠르게 실행

```bash
npm i
npm run dev
```

- Web: http://localhost:3000

### 2-3) 앱 전체(웹+API+Redis) 컨테이너 실행

```bash
docker compose up --build
```

- Web: http://localhost:3000
- FastAPI Docs: http://localhost:8000/docs
- RedisInsight: http://localhost:5540

### 2-4) Kafka까지 포함한 전체 스택 실행

```bash
npm run containers:up
```

- Kafka Broker: `localhost:9094`
- Kafka UI: http://localhost:8080
- Schema Registry: http://localhost:8081

종료:

```bash
npm run containers:down
```

## 3) 워크스페이스 구조

```text
apps/
  web/            # Next.js + FSD
  api/            # FastAPI
packages/
  contracts/      # FE/BE 공용 계약
scripts/
  kafka/          # Kafka 학습/검증 스크립트
```

- 루트는 오케스트레이션 스크립트 중심
- 실제 구현/의존성은 가능한 각 워크스페이스(`apps/*`, `packages/*`)에 둠

## 4) 주요 스크립트

```bash
# dev
npm run dev
npm run dev:web
npm run dev:api
npm run dev:all

# test
npm run test
npm run test:web
npm run test:api
npm run test:all
npm run test:e2e

# stack
npm run kafka:up
npm run kafka:down
npm run containers:up
npm run containers:down
```

## 5) 테스트 모드 기준

- Web unit: Vitest
- Web e2e: Playwright
- API: pytest
- E2E 백엔드 분기:
  - `API_BACKEND=route`: route 전용 시나리오
  - `API_BACKEND=fastapi`: fastapi 전용 시나리오

예시:

```bash
API_BACKEND=route npm run test:e2e
API_BACKEND=fastapi FASTAPI_BASE_URL=http://localhost:8000 npm run test:e2e
```

PowerShell:

```powershell
$env:API_BACKEND="fastapi"
$env:FASTAPI_BASE_URL="http://localhost:8000"
npm run test:e2e
```

## 6) 환경 변수 핵심 포인트

- 웹 Supabase 공개 키: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`(또는 `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- API 인증/저장 연동: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- API 세션 저장소: `SESSION_STORE_BACKEND=memory|redis`
- Kafka relay: `OUTBOX_RELAY_ENABLED`, `KAFKA_BOOTSTRAP_SERVERS`

세부는 각 문서 참고:

- 백엔드 실행/환경 변수: `apps/api/README.md`
- Kafka 시나리오: `scripts/kafka/README.md`

## 7) 규칙 문서(필독)

- 아키텍처/레이어: `docs/rules/00-core.md`, `docs/rules/30-structure.md`
- 스택 원칙: `docs/rules/05-tech-stack.md`
- 백엔드/API: `docs/rules/51-backend-api.md`
- 계약 관리: `docs/rules/52-contracts.md`
- 테스트 기준: `docs/rules/70-testing.md`

## 8) 아키텍처 다이어그램

- 전체 다이어그램: `docs/architecture.md`
- 서비스 확장 로드맵: `docs/architecture-roadmap.md`

## 9) 협업/Git 가이드

- Git 운용 전략: `docs/git-strategy.md`
