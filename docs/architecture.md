# Architecture Overview

이 문서는 현재 모노레포의 핵심 런타임 경로를 한 장으로 설명합니다.

## 1) Runtime Flow

```mermaid
flowchart LR
  U[User Browser] --> W[apps/web<br/>Next.js + FSD]
  W -->|/api/*| R[Route Handler / Proxy]
  R --> A[apps/api<br/>FastAPI]
  A --> S[(Session Store)]
  S -->|memory| M[In-memory]
  S -->|redis| D[(Redis)]
  A --> O[Outbox Pending]
  O --> X[Outbox Relay]
  X -->|optional| K[(Kafka)]
  K --> C[Consumer]
  C -->|fail| Q[(DLQ)]
```

## 2) Component Roles

- `apps/web`: 사용자 진입점, FSD 레이어 구조 유지
- `apps/api`: 인증/세션/프로젝트 API 및 outbox 처리
- `Redis`: 세션/로그인 제한 저장소
- `Kafka`: outbox relay가 활성화된 경우 이벤트 파이프라인 담당
- `Sentry`: FE/BE 에러 및 샘플링 기반 성능 트랜잭션 수집
- `packages/contracts`: FE/BE 공용 계약(schema/type) 관리

## 3) Operation Modes

- `API_BACKEND=route`: 웹 라우트 중심 모드
- `API_BACKEND=fastapi`: 웹이 FastAPI로 프록시
- 기본 compose(`docker compose up --build`)는 `OUTBOX_RELAY_ENABLED=false`
- Kafka 포함 스택(`npm run containers:up`)에서는 outbox relay 경로를 함께 검증

## 4) Local Run Path (`npm run dev` 중심)

```mermaid
flowchart LR
  U[Browser :3000] --> W[apps/web dev server]
  W -->|API_BACKEND=route| NR[Next Route Handler]
  W -->|API_BACKEND=fastapi| FP[FastAPI :8000]
  FP -->|SESSION_STORE_BACKEND=memory| MEM[(In-memory)]
  FP -->|SESSION_STORE_BACKEND=redis| R[(Redis :6379)]
```

- 기본 빠른 시작: `npm run dev`
- FastAPI 연동 시: `API_BACKEND=fastapi`, `FASTAPI_BASE_URL=http://localhost:8000`

## 5) Docker Run Path (`docker compose` / `containers:up`)

```mermaid
flowchart LR
  U[Browser] --> WEB[web container :3000]
  WEB --> API[api container :8000]
  API --> REDIS[(redis container :6379)]
  API --> OBX[Outbox Relay]
  OBX -->|optional| K[(kafka container :9092)]
  K --> UI[kafka-ui :8080]
  K --> SR[schema-registry :8081]
```

- 앱 컨테이너: `docker compose up --build`
- 앱+Kafka: `npm run containers:up`
- Kafka 토픽은 `kafka-topics-init` one-shot 컨테이너에서 자동 bootstrap
