# 관측/모니터링 설계

## 목표

- 서비스 가용성 확인
- 장애 원인 추적을 위한 로그/식별자 확보
- API 및 화면 성능 측정 기반 마련

---

## 구성 요소

### 1) Health Check

- Endpoint: `GET /api/health`
- 응답 필드
  - `status`: "ok"
  - `timestamp`: ISO 문자열
  - `environment`: `NODE_ENV`
  - `requestId`: 요청 식별자(있을 때만)
- 목적
  - 배포 직후 및 로드밸런서의 상태 확인
  - 장애 발생 시 최소한의 정상 응답 확인

### 2) Request ID

- 모든 요청에 대해 `x-request-id` 헤더를 부여
- 동일한 ID를 응답 헤더에도 포함
- 목적
  - 로그/에러 추적 시 동일 요청을 묶어 확인
  - 클라이언트/서버 간 문제 재현 용이

> 이 프로젝트에서는 `proxy.ts`에서 `x-request-id`를 응답 헤더에 설정합니다.

### 3) 구조화 로그

- JSON 기반 로그 유틸 제공
- 로그 필드
  - `level`, `message`, `timestamp`, `context`
- 목적
  - 로그 수집 도구에서 검색/집계 용이

---

## 디렉토리 구조

```
src/shared/lib/monitoring/
  health.ts
  logger.ts
  requestId.ts
```

---

## 후속 확장 제안

- Error Tracking (Sentry)
- APM/Tracing (OpenTelemetry)
- Metrics Export (Prometheus)

---

## Sentry (무료 플랜 사용 가능)

실제 운영 환경 기준으로 `@sentry/nextjs` 패키지와 공식 설정 파일을 사용합니다.

설치:

```
npm install @sentry/nextjs
```

필요 환경 변수:

```
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_ENVIRONMENT=development
```

설정 여부 확인:

- `GET /api/observability/sentry`

설정 파일:

- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
