# FastAPI Backend

## 실행

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## 테스트

```bash
cd backend
PYTHONPATH=. pytest
```
