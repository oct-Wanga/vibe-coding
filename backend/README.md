# FastAPI Backend

## 실행

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export SESSION_STORE_BACKEND=redis
export REDIS_URL=redis://localhost:6379/0
uvicorn app.main:app --reload --port 8000
```

## 테스트

```bash
cd backend
PYTHONPATH=. pytest
```
