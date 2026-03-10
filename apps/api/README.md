# FastAPI Backend (`apps/api`)

`apps/api`는 인증/세션/프로젝트 API를 제공하는 백엔드 워크스페이스입니다.

## 1) 역할

- `signup/login` 인증 처리
- 세션 저장소(memory/redis) 관리
- 로그인 시도 제한(rate limit)
- 프로젝트 CRUD
- Outbox 이벤트 저장 및 Kafka relay(선택)

## 2) 엔드포인트

- Base URL: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`
- Prefix: `/api`

## 3) 실행

### 3-1) macOS/Linux

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

export SESSION_STORE_BACKEND=memory
export SESSION_SINGLE_LOGIN=true
export LOGIN_RATE_LIMIT_MAX_ATTEMPTS=5
export LOGIN_RATE_LIMIT_WINDOW_SECONDS=60

python -m uvicorn app.main:app --reload --port 8000
```

### 3-2) Windows PowerShell

```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

$env:SESSION_STORE_BACKEND="memory"
$env:SESSION_SINGLE_LOGIN="true"
$env:LOGIN_RATE_LIMIT_MAX_ATTEMPTS="5"
$env:LOGIN_RATE_LIMIT_WINDOW_SECONDS="60"

python -m uvicorn app.main:app --reload --port 8000
```

컨테이너 기반:

```bash
docker compose up --build
```

Kafka까지 포함:

```bash
npm run containers:up
```

## 4) 주요 환경 변수

| 분류 | 변수 |
| --- | --- |
| Session | `SESSION_STORE_BACKEND`, `REDIS_URL`, `SESSION_TTL_SECONDS`, `SESSION_SINGLE_LOGIN` |
| Login Rate Limit | `LOGIN_RATE_LIMIT_MAX_ATTEMPTS`, `LOGIN_RATE_LIMIT_WINDOW_SECONDS`, `LOGIN_RATE_LIMIT_FALLBACK_TO_MEMORY` |
| Supabase | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Outbox/Kafka | `OUTBOX_ENABLED`, `OUTBOX_RELAY_ENABLED`, `KAFKA_BOOTSTRAP_SERVERS`, `KAFKA_PROJECTS_CREATED_TOPIC`, `KAFKA_CLIENT_ID` |
| API 로그 | `API_ACCESS_LOG_ENABLED`, `API_ACCESS_LOG_SLOW_MS` |
| Sentry | `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`, `SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_PROFILES_SAMPLE_RATE`, `SENTRY_SEND_DEFAULT_PII` |

기본 정책:

- `OUTBOX_RELAY_ENABLED` 기본값: `false`
- `SENTRY_DSN`이 비어 있으면 Sentry 비활성

## 5) Sentry 수집 범위

- 수집:
  - 미처리 예외(주로 500)
  - 오류 레벨 로그(`event_level=ERROR`)
  - 샘플링된 성능 트랜잭션
- 제외/비수집:
  - `/api/health` 트랜잭션
  - 정상 비즈니스 실패 응답(예: 인증 실패 401, 검증 실패 400)

## 6) 테스트

```bash
cd apps/api
PYTHONPATH=. pytest -q
```

- 테스트 SSOT: `apps/api/.env.test`
- Redis 경로 검증 시 `.env.test`의 `SESSION_STORE_BACKEND=redis`, `REDIS_URL` 설정 필요

## 7) Outbox 확인

프로젝트 생성:

```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"id":"obx-1","name":"Outbox sample"}'
```

요약 확인:

```bash
curl http://localhost:8000/api/projects/outbox/summary
```
