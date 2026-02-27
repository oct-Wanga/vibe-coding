# FastAPI Backend

`backend/`는 Frontend(`/api/*`)가 프록시할 수 있는 FastAPI 서버입니다.

- 기본 주소: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`
- API Prefix: `/api`

## 1) 로컬 실행

### macOS/Linux

```bash
cd backend
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

uvicorn app.main:app --reload --port 8000
```

### Windows PowerShell

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Redis 없이 실행하려면 memory 권장
$env:SESSION_STORE_BACKEND="memory"

# Redis 사용 시
# $env:SESSION_STORE_BACKEND="redis"
# $env:REDIS_URL="redis://localhost:6379/0"

$env:SESSION_SINGLE_LOGIN="true"
$env:LOGIN_RATE_LIMIT_MAX_ATTEMPTS="5"
$env:LOGIN_RATE_LIMIT_WINDOW_SECONDS="60"

# 선택(Supabase Auth/로그)
$env:SUPABASE_URL=""
$env:SUPABASE_SERVICE_ROLE_KEY=""

uvicorn app.main:app --reload --port 8000
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
  - 미설정 시 in-memory 사용자 저장소를 사용

## 3) 테스트

```bash
cd backend
PYTHONPATH=. pytest -q
```
