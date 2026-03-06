# FastAPI Backend

`apps/api`는 Frontend(`/api/*`)가 프록시할 수 있는 FastAPI 서버입니다.

- 기본 주소: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`
- API Prefix: `/api`

## 1) 로컬 실행

### macOS/Linux

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Redis 없이 실행하려면 memory 권장
export SESSION_STORE_BACKEND=memory

# Redis 사용 시
# export SESSION_STORE_BACKEND=redis
# export REDIS_URL=redis://localhost:6379/0

export SESSION_SINGLE_LOGIN=true
export LOGIN_RATE_LIMIT_MAX_ATTEMPTS=5
export LOGIN_RATE_LIMIT_WINDOW_SECONDS=60

# 선택(Supabase Auth/로그)
export SUPABASE_URL=
export SUPABASE_SERVICE_ROLE_KEY=

python -m uvicorn app.main:app --reload --port 8000
```

### Windows PowerShell

```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Redis 없이 실행하려면 memory 권장
$env:SESSION_STORE_BACKEND="memory"

# Redis 사용 시
# $env:SESSION_STORE_BACKEND="redis"
# $env:REDIS_URL="redis://localhost:6379/0"

# 선택(Outbox relay -> Kafka)
# $env:OUTBOX_RELAY_ENABLED="true"
# $env:KAFKA_BOOTSTRAP_SERVERS="localhost:9094"

$env:SESSION_SINGLE_LOGIN="true"
$env:LOGIN_RATE_LIMIT_MAX_ATTEMPTS="5"
$env:LOGIN_RATE_LIMIT_WINDOW_SECONDS="60"

# 선택(Supabase Auth/로그)
$env:SUPABASE_URL=""
$env:SUPABASE_SERVICE_ROLE_KEY=""

python -m uvicorn app.main:app --reload --port 8000
```

## 2) 환경 변수 메모

- `SESSION_STORE_BACKEND`
  - `memory`: Redis 없이 개발할 때 권장
  - `redis`: Redis 세션 저장소 사용
- `REDIS_URL`: Redis 연결 주소
- `SESSION_SINGLE_LOGIN`: `true`면 동일 계정 중복 로그인 차단
- `LOGIN_RATE_LIMIT_MAX_ATTEMPTS`, `LOGIN_RATE_LIMIT_WINDOW_SECONDS`: 로그인 시도 제한 정책
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - 설정 시 `signup/login`은 Supabase Auth를 우선 사용
  - 설정 시 `projects` CRUD도 Supabase `projects` 테이블을 우선 사용
  - 미설정 시 사용자/프로젝트는 in-memory 저장소를 사용
- `OUTBOX_ENABLED`
  - 기본 `true`
  - `create project` 시 outbox 이벤트를 함께 기록
- `OUTBOX_RELAY_ENABLED`
  - 기본 `false`
  - `true`일 때 FastAPI 시작 시 relay worker가 pending outbox를 Kafka로 전송
- `KAFKA_BOOTSTRAP_SERVERS`
  - 로컬 직접 실행 기본 `localhost:9094`
  - Docker `api` 컨테이너 실행 시 `kafka:9092`
- `KAFKA_PROJECTS_CREATED_TOPIC`
  - 기본 `projects.project-created.v1`
- `OUTBOX_RELAY_POLL_INTERVAL_SECONDS`, `OUTBOX_RELAY_BATCH_SIZE`, `OUTBOX_RELAY_MAX_ATTEMPTS`
  - relay polling/batch/retry 제어

## 3) 테스트

```bash
cd apps/api
PYTHONPATH=. pytest -q
```

## 4) Outbox 동작 확인

1. 프로젝트 생성

```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"id":"obx-1","name":"Outbox sample"}'
```

2. outbox 요약 확인

```bash
curl http://localhost:8000/api/projects/outbox/summary
```
