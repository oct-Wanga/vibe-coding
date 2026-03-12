# Web App (`apps/web`)

`apps/web`는 Next.js(App Router) + FSD 구조의 프론트엔드 워크스페이스입니다.

## 1) 역할

- 사용자 UI 진입점 제공
- FSD 레이어(`app -> views -> widgets -> features -> entities -> shared`) 유지
- 필요 시 `/api/*`를 통해 FastAPI와 연동
- BFF 라우트(`src/app/api/**/route.ts`)는 공통 관문(`src/shared/lib/bff/handleBffRoute.ts`)을 통해 백엔드 분기를 수행
- FastAPI 대상 경로는 `src/shared/config/bffEndpoints.ts`에서 중앙 관리

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

FastAPI 연동 예시:

```bash
API_BACKEND=fastapi FASTAPI_BASE_URL=http://localhost:8000 npm run dev:web
```

## 3) 주요 스크립트

| 위치 | 명령 |
| --- | --- |
| 루트 | `npm run dev:web`, `npm run build`, `npm run lint`, `npm run test`, `npm run test:e2e` |
| 워크스페이스 | `npm run dev`, `npm run build`, `npm run lint`, `npm run test`, `npm run test:e2e` |

## 4) 테스트

- Unit: Vitest
- E2E: Playwright
- E2E 백엔드 분기:
  - `API_BACKEND=route`
  - `API_BACKEND=fastapi`

예시:

```bash
API_BACKEND=route npm run test:e2e
API_BACKEND=fastapi FASTAPI_BASE_URL=http://localhost:8000 npm run test:e2e
```

## 5) 환경 변수

### 5-1) 파일 위치 / 우선순위

- 웹 개발 서버는 `apps/web/.env.local`을 우선 사용
- 루트 `.env.local`은 웹 기준 보조 용도(Playwright/E2E)
- 웹 관련 값은 `apps/web/.env.local` 일원화 권장
- 템플릿: `apps/web/.env.example` -> `apps/web/.env.local` 복사 후 값 입력

### 5-2) 필수(권장) 변수

| 용도 | 변수 |
| --- | --- |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 또는 `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| 백엔드 연결 | `API_BACKEND` (`route` \| `fastapi`), `FASTAPI_BASE_URL` |

### 5-3) Sentry 변수

| 영역 | 변수 |
| --- | --- |
| FE SDK | `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_ENVIRONMENT`, `NEXT_PUBLIC_SENTRY_RELEASE`, `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`, `NEXT_PUBLIC_SENTRY_PROFILES_SAMPLE_RATE` |
| server/edge SDK(선택) | `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`, `SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_PROFILES_SAMPLE_RATE` |

예시(`apps/web/.env.local`):

```env
API_BACKEND=fastapi
FASTAPI_BASE_URL=http://localhost:8000

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...

NEXT_PUBLIC_SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_ENVIRONMENT=local
NEXT_PUBLIC_SENTRY_RELEASE=web-local
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
NEXT_PUBLIC_SENTRY_PROFILES_SAMPLE_RATE=0.0
```

## 6) Sentry 수집 범위

- 수집:
  - 브라우저 런타임 예외
  - App Router request error (`onRequestError`)
  - 샘플링된 성능 트랜잭션
- 일반 비수집:
  - 정상 비즈니스 실패 응답(예: 로그인 비밀번호 불일치 401)
  - DSN 미설정 상태

## 7) 참고 문서

- 루트 개요: `README.md`
- 아키텍처: `docs/architecture.md`
- 관측: `docs/observability.md`

