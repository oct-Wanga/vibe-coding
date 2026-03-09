# FastAPI Backend (`apps/api`)

`apps/api`는 이 모노레포의 백엔드 서비스입니다.
웹(`apps/web`)은 `/api/*` 경로에서 이 서비스를 직접 호출하거나 프록시할 수 있습니다.

- Base URL: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`
- Prefix: `/api`

## 1) 백엔드 역할

- 인증(`signup/login`) 처리
- 세션 저장소(memory/redis) 관리
- 로그인 시도 제한(rate limit)
- 프로젝트 CRUD
- Outbox 이벤트 저장 및(옵션) Kafka relay

## 2) 실행

### 2-1) macOS/Linux

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 로컬 최소 실행(권장 시작점)
export SESSION_STORE_BACKEND=memory
export SESSION_SINGLE_LOGIN=true
export LOGIN_RATE_LIMIT_MAX_ATTEMPTS=5
export LOGIN_RATE_LIMIT_WINDOW_SECONDS=60

python -m uvicorn app.main:app --reload --port 8000
```

### 2-2) Windows PowerShell

```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 로컬 최소 실행(권장 시작점)
$env:SESSION_STORE_BACKEND="memory"
$env:SESSION_SINGLE_LOGIN="true"
$env:LOGIN_RATE_LIMIT_MAX_ATTEMPTS="5"
$env:LOGIN_RATE_LIMIT_WINDOW_SECONDS="60"

python -m uvicorn app.main:app --reload --port 8000
```

## 3) Redis/Kafka 포함 실행

### 3-1) Redis 세션 저장소 사용

```bash
# Linux/macOS
export SESSION_STORE_BACKEND=redis
export REDIS_URL=redis://localhost:6379/0
```

```powershell
# PowerShell
$env:SESSION_STORE_BACKEND="redis"
$env:REDIS_URL="redis://localhost:6379/0"
```

### 3-2) Outbox relay -> Kafka 사용

```bash
# Linux/macOS
export OUTBOX_RELAY_ENABLED=true
export KAFKA_BOOTSTRAP_SERVERS=localhost:9094
```

```powershell
# PowerShell
$env:OUTBOX_RELAY_ENABLED="true"
$env:KAFKA_BOOTSTRAP_SERVERS="localhost:9094"
```

컨테이너 기반으로는 루트에서 `docker compose up --build` 또는 `npm run containers:up`을 사용하면 됩니다.

## 4) 주요 환경 변수

- `SESSION_STORE_BACKEND`: `memory` | `redis`
- `REDIS_URL`: Redis 연결 문자열
- `SESSION_SINGLE_LOGIN`: 동일 계정 중복 로그인 차단 여부
- `LOGIN_RATE_LIMIT_MAX_ATTEMPTS`, `LOGIN_RATE_LIMIT_WINDOW_SECONDS`: 로그인 제한 정책
- `LOGIN_RATE_LIMIT_FALLBACK_TO_MEMORY`
  - 기본 `false` (권장)
  - `false`: Redis 장애를 명시적 오류로 노출
  - `true`: in-memory fallback으로 완화
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - 설정 시 Auth/프로젝트 저장을 Supabase 우선 사용
  - 미설정 시 in-memory 저장소 동작
- `OUTBOX_ENABLED`: 기본 `true`
- `OUTBOX_RELAY_ENABLED`: 기본 `false`
- `KAFKA_BOOTSTRAP_SERVERS`: 로컬 `localhost:9094`, 컨테이너 `kafka:9092`
- `KAFKA_PROJECTS_CREATED_TOPIC`: 기본 `projects.project-created.v1`
- `API_ACCESS_LOG_ENABLED`: 기본 `true`, API 요청 접근 로그 출력 여부
- `API_ACCESS_LOG_SLOW_MS`: 기본 `1000`, 지정 시간(ms) 이상 요청을 warning 레벨로 기록
- `SENTRY_DSN`: 설정 시 Sentry 활성화(미설정 시 비활성)
- `SENTRY_ENVIRONMENT`: 기본값은 `APP_ENV`
- `SENTRY_RELEASE`: 배포 버전 태그(선택)
- `SENTRY_TRACES_SAMPLE_RATE`: 성능 트랜잭션 샘플링(기본 `0.1`)
- `SENTRY_PROFILES_SAMPLE_RATE`: 프로파일링 샘플링(기본 `0.0`)
- `SENTRY_SEND_DEFAULT_PII`: 개인정보 전송 여부(기본 `false`)

Sentry는 `SENTRY_DSN`이 비어 있으면 비활성입니다.
운영/스테이징에서 DSN을 설정한 뒤 예외가 발생하면 Sentry 웹 콘솔(`sentry.io`)의 해당 프로젝트 `Issues`에서 확인할 수 있습니다.

Sentry 수집 범위:

- 수집:
  - 미처리 예외(주로 500)
  - 오류 레벨 로그(`event_level=ERROR`)
  - 샘플링된 성능 트랜잭션
- 제외/비수집(일반):
  - `/api/health` 트랜잭션
  - 정상 비즈니스 실패 응답(예: 인증 실패 401, 검증 실패 400)

## 5) 테스트

```bash
cd apps/api
PYTHONPATH=. pytest -q
```

- 테스트 환경의 SSOT는 `apps/api/.env.test`
- `tests/conftest.py`에서 `.env.test`를 로드
- Redis 경로까지 검증하려면 `.env.test`에서 `SESSION_STORE_BACKEND=redis`와 `REDIS_URL`을 맞춰 실행

## 6) Outbox 확인

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
