# Web App (`apps/web`)

`apps/web`는 이 모노레포의 Next.js(App Router) 프론트엔드 워크스페이스입니다.

## 1) 역할

- 사용자 진입 UI 제공
- FSD 레이어 구조(`app -> views -> widgets -> features -> entities -> shared`) 유지
- 필요 시 `/api/*` 경로를 통해 FastAPI와 연동

## 2) 실행

루트에서:

```bash
npm run dev:web
```

또는 `apps/web`에서:

```bash
npm run dev
```

- 기본 주소: `http://localhost:3000`

FastAPI 프록시 연동(루트 실행 기준):

```bash
API_BACKEND=fastapi FASTAPI_BASE_URL=http://localhost:8000 npm run dev:web
```

PowerShell:

```powershell
$env:API_BACKEND="fastapi"
$env:FASTAPI_BASE_URL="http://localhost:8000"
npm run dev:web
```

## 3) 주요 스크립트

루트 기준:

```bash
npm run dev:web
npm run build:web
npm run lint:web
npm run test:web
npm run test:e2e
```

워크스페이스 기준:

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run test:e2e
```

## 4) 테스트

- Unit: Vitest
- E2E: Playwright
- E2E 모드 분기:
  - `API_BACKEND=route`
  - `API_BACKEND=fastapi`

예시:

```bash
API_BACKEND=route npm run test:e2e
API_BACKEND=fastapi FASTAPI_BASE_URL=http://localhost:8000 npm run test:e2e
```

## 5) 환경 변수

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 또는 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `API_BACKEND` (`route` | `fastapi`)
- `FASTAPI_BASE_URL` (예: `http://localhost:8000`)

## 6) 개발 규칙

아래 문서를 우선 적용:

- `docs/rules/00-core.md`
- `docs/rules/05-tech-stack.md`
- `docs/rules/30-structure.md`
- `docs/rules/70-testing.md`

전체 구조/아키텍처는 루트 문서 참고:

- `README.md`
- `docs/architecture.md`
