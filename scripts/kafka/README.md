# Kafka Guide (`scripts/kafka`)

이 디렉터리는 이 프로젝트의 Kafka 흐름을 빠르게 검증하기 위한 스크립트 모음입니다.
핵심 목적은 두 가지입니다.

- Kafka 기본 동작(발행/소비/DLQ) 학습
- FastAPI Outbox relay와 연결된 이벤트 파이프라인 점검

## 1) 이 프로젝트에서 Kafka가 하는 일

Kafka는 "웹/백엔드 기본 실행"의 필수 요소가 아니라,
**Outbox 기반 비동기 이벤트 처리 시나리오를 검증할 때 활성화하는 선택 컴포넌트**입니다.

기본 토픽:

- `projects.project-created.v1`: 정상 이벤트
- `events.dlq.v1`: 실패 이벤트

## 2) 포함된 스크립트

- `create-topics.mjs`: 토픽 생성
- `produce-project-events.mjs`: 프로젝트 생성 이벤트 발행
- `consume-project-events.mjs`: 이벤트 소비, 실패 시 DLQ 전송
- `consume-dlq.mjs`: DLQ 이벤트 확인
- `smoke-test.mjs`: 토픽/발행/소비/DLQ 검증 자동화

## 3) 실행 순서

루트에서:

```bash
npm run kafka:up
npm run kafka:test
```

`kafka:up`에는 토픽 bootstrap 컨테이너(`kafka-topics-init`)가 포함되어 있어
기본 토픽(`projects.project-created.v1`, `events.dlq.v1`)은 자동 생성됩니다.
`npm run kafka:topics`는 수동 재생성이 필요할 때만 사용하세요.

UI:

- Kafka UI: http://localhost:8080
- Schema Registry: http://localhost:8081

종료:

```bash
npm run kafka:down
```

## 4) 수동 실습

터미널 A:

```bash
npm run kafka:consume
```

터미널 B:

```bash
npm run kafka:produce
```

터미널 C:

```bash
npm run kafka:consume:dlq
```

## 5) 자주 쓰는 환경 변수

- `COUNT`: 발행 건수 (기본 `100`)
- `FAIL_EVERY`: N건마다 실패 이벤트 주입 (기본 `10`)
- `RUN_ID`: 실행 식별자
- `GROUP_ID`: 컨슈머 그룹 ID
- `MAX_MESSAGES`: 컨슈머 최대 처리 건수 (`0`은 계속 실행)

## 6) Outbox 연동 관점

```text
POST /api/projects
  -> project 저장 + outbox(pending)
    -> relay polling
      -> Kafka publish
        -> consumer 처리
          -> 성공 commit / 실패 DLQ
```

- 관련 코드:
  - `apps/api/app/services/store.py`
  - `apps/api/app/services/outbox_relay.py`
- relay 활성화:
  - `OUTBOX_RELAY_ENABLED=true`
- 상태 확인:
  - `GET /api/projects/outbox/summary`

## 7) 네트워크 주소 기준

- 로컬 Node 스크립트(`npm run kafka:*`): `localhost:9094`
- Docker `api` 컨테이너 내부: `kafka:9092`
