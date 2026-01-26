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

- 패키지 버전: `@sentry/nextjs` 10.x (현재 10.36.0)

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

클라이언트/서버 모두 수집하려면 `SENTRY_DSN`과 `NEXT_PUBLIC_SENTRY_DSN`을 **둘 다** 설정합니다(보통 동일 DSN 사용).

설정 여부 확인:

- `GET /api/observability/sentry`

DSN 확인 위치:

- Sentry 대시보드 → Project Settings → Client Keys (DSN)에서 확인합니다.

설정 파일:

- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

실제 사용:

1. 환경 변수로 DSN 및 샘플링 비율을 설정합니다.
2. 서버/엣지 런타임은 `src/instrumentation.ts`에서 런타임을 판별해 `sentry.server.config.ts` 또는 `sentry.edge.config.ts`를 로딩합니다.
3. 브라우저는 `src/instrumentation-client.ts`에서 초기화되며 Replay 및 라우팅 전환 계측이 활성화됩니다.
4. 직접 에러를 보내야 할 때는 `Sentry.captureException`, 메시지 기록은 `Sentry.captureMessage`를 사용합니다.
5. 설정 여부는 `/api/observability/sentry` 엔드포인트로 확인할 수 있습니다.

로그/이벤트 확인 방법:

1. 로컬에서 개발 서버를 실행합니다.
2. 브라우저 콘솔 또는 서버 코드에서 아래 예시 중 하나로 이벤트를 전송합니다.

- 클라이언트: `Sentry.captureMessage("client test")`
- 서버: `Sentry.captureException(new Error("server test"))`

3. Sentry 대시보드에서 프로젝트 → Issues 또는 Discover에서 이벤트가 들어왔는지 확인합니다.
4. Replay를 켰다면 Project → Replays에서 세션이 기록되는지 확인합니다.

# Sentry 홈페이지 보는 법

## ✅ 설정/연결 상태 확인

이벤트가 제대로 들어오는지 확인이 최우선입니다.

DSN이 올바르게 설정되어 있어야 서버/클라이언트 이벤트가 들어옵니다.

이 레포에서는 클라이언트/서버 모두 수집하려면 SENTRY_DSN과 NEXT_PUBLIC_SENTRY_DSN을 둘 다 설정하도록 되어 있습니다.

## ✅ Issues 탭

Sentry에서 가장 기본적인 에러 집계 화면입니다.

동일한 에러가 그룹핑되어 들어오는지 확인

발생 횟수, 최근 발생 시간, 영향을 받는 사용자 수 등을 확인

이 프로젝트에서는 Sentry.captureException / captureMessage 호출을 통해 직접 에러를 보내는 흐름을 안내합니다.

## ✅ Discover 탭

특정 조건(라우트, 태그, 사용자 등)으로 이벤트를 찾는 데 필수입니다.

예: 특정 API 오류만 보고 싶다면 태그/필드 기준 필터링

README에서도 Issues/Discover에서 이벤트 유입 확인을 안내합니다.

## ✅ Replay 탭

클라이언트 세션 리플레이가 켜져 있으면 오류 시점의 사용자 행동/화면을 재현할 수 있습니다.

이 프로젝트도 Replay 확인 위치를 안내하고 있습니다.

## ✅ 실제 동작 확인 가이드

개발 서버에서 의도적으로 오류를 발생시키고

Issues/Discover/Replay에서 이벤트 유입을 확인하는 흐름이 권장됩니다.
