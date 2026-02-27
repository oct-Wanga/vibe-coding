# FastAPI Backend

## 실행

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export SESSION_STORE_BACKEND=redis
export REDIS_URL=redis://localhost:6379/0
export SUPABASE_URL=
export SUPABASE_SERVICE_ROLE_KEY=
uvicorn app.main:app --reload --port 8000
```

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`가 설정되면 `signup/login`은 Supabase Auth를 사용합니다.
- 미설정 시에는 기존 in-memory 사용자 저장소를 사용합니다.

## 테스트

```bash
cd backend
PYTHONPATH=. pytest
```
