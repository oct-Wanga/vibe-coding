# 관측/모니터링 가이드

이 문서는 현재 저장소의 실제 관측 구성(요청 ID, 접근 로그, Sentry)을 기준으로 정리한다.

## 1) 현재 구성

- API Health Check: `GET /api/health`
- Request ID 전파: `x-request-id`
- API 구조화 접근 로그: request/response 메타데이터 + 지연 시간
- Sentry (FE + BE): 에러 추적 + 샘플링 기반 성능 트랜잭션

## 2) Request ID / API 로그

- API는 요청마다 `x-request-id`를 해석(없으면 생성)하고 응답 헤더에 다시 내려준다.
- Request ID는 로그와 Sentry 태그에 함께 사용된다.
- API 접근 로그는 JSON 형태로 기록되며 느린 요청은 warning 레벨로 승격된다.

관련 코드:

- `apps/api/app/core/observability.py`
- `apps/api/app/main.py`
- `apps/api/app/api/deps.py`

## 3) Sentry 설정 위치

### 3-1) FE (`apps/web`)

- 초기화 파일:
  - `apps/web/instrumentation-client.ts`
  - `apps/web/src/instrumentation.ts`
  - `apps/web/sentry.server.config.ts`
  - `apps/web/sentry.edge.config.ts`
- 환경 변수:
  - `NEXT_PUBLIC_SENTRY_DSN`
  - `NEXT_PUBLIC_SENTRY_ENVIRONMENT`
  - `NEXT_PUBLIC_SENTRY_RELEASE`
  - `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`
  - `NEXT_PUBLIC_SENTRY_PROFILES_SAMPLE_RATE`
  - (선택) `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`, `SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_PROFILES_SAMPLE_RATE`
- 개발 서버(`npm run dev:web`)는 `apps/web/.env.local`을 우선 사용한다.

### 3-2) BE (`apps/api`)

- 초기화 파일:
  - `apps/api/app/core/sentry.py`
  - `apps/api/app/main.py`
  - `apps/api/app/core/config.py`
- 환경 변수:
  - `SENTRY_DSN`
  - `SENTRY_ENVIRONMENT`
  - `SENTRY_RELEASE`
  - `SENTRY_TRACES_SAMPLE_RATE`
  - `SENTRY_PROFILES_SAMPLE_RATE`
  - `SENTRY_SEND_DEFAULT_PII`

## 4) Sentry 수집 범위

### 4-1) FE 수집/비수집

- 수집:
  - 브라우저 런타임 예외
  - App Router request error (`onRequestError`)
  - 샘플링된 성능 트랜잭션
- 일반적으로 비수집:
  - 정상 비즈니스 실패 응답(예: 인증 실패 401, 검증 실패 400)
  - DSN 미설정 상태

### 4-2) BE 수집/비수집

- 수집:
  - 미처리 예외(주로 500)
  - 오류 레벨 로그(`event_level=ERROR`)
  - 샘플링된 API 트랜잭션
- 제외:
  - `/api/health` 트랜잭션

## 5) 빠른 검증 방법

### 5-1) FE

1. `apps/web/.env.local`에 `NEXT_PUBLIC_SENTRY_DSN` 설정
2. `npm run dev:web` 재시작
3. 브라우저 콘솔에서 예외 발생:

```js
setTimeout(() => {
  throw new Error("fe-sentry-check-" + Date.now());
}, 0);
```

4. Sentry 프로젝트 `Issues`에서 `fe-sentry-check-` 검색

### 5-2) BE

1. API 실행 환경에 `SENTRY_DSN` 설정
2. 예외(500) 또는 스모크 테스트로 이벤트 전송
3. Sentry 프로젝트 `Issues`에서 이벤트 확인

스모크 테스트 파일:

- `apps/api/tests/e2e/test_sentry_smoke.py`

## 6) 운영 권장

- FE/BE는 가능하면 분리 프로젝트(분리 DSN) 사용
- `SENTRY_RELEASE`는 CI에서 git sha/배포 버전으로 주입
- 테스트 노이즈 방지를 위해 `apps/api/.env.test`의 `SENTRY_DSN`은 기본 비움
