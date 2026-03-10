# Kafka Guide (`scripts/kafka`)

Kafka 학습/검증 스크립트 모음입니다.  
목표는 Outbox relay 기반 이벤트 파이프라인을 빠르게 확인하는 것입니다.

## 1) 기본 토픽

- `projects.project-created.v1`: 정상 이벤트
- `events.dlq.v1`: 실패 이벤트(DLQ)

## 2) 포함 스크립트

| 스크립트 | 설명 |
| --- | --- |
| `create-topics.mjs` | 토픽 생성 |
| `produce-project-events.mjs` | 프로젝트 생성 이벤트 발행 |
| `consume-project-events.mjs` | 이벤트 소비, 실패 시 DLQ 전송 |
| `consume-dlq.mjs` | DLQ 확인 |
| `smoke-test.mjs` | 토픽/발행/소비/DLQ 통합 검증 |

## 3) 실행 순서

```bash
npm run kafka:up
npm run kafka:test
```

- `kafka:up`에는 `kafka-topics-init`가 포함되어 기본 토픽을 자동 bootstrap
- `npm run kafka:topics`는 수동 재생성이 필요할 때만 사용

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

## 5) 환경 변수

| 변수 | 설명 | 기본값 |
| --- | --- | --- |
| `COUNT` | 발행 건수 | `100` |
| `FAIL_EVERY` | N건마다 실패 이벤트 주입 | `10` |
| `RUN_ID` | 실행 식별자 | 자동 생성 |
| `GROUP_ID` | 컨슈머 그룹 ID | 자동 생성 |
| `MAX_MESSAGES` | 컨슈머 최대 처리 건수 (`0`은 계속 실행) | `0` |

## 6) Outbox 연동 관점

```text
POST /api/projects
  -> project 저장 + outbox(pending)
    -> relay polling
      -> Kafka publish
        -> consumer 처리
          -> 성공 commit / 실패 DLQ
```

관련 코드:

- `apps/api/app/services/store.py`
- `apps/api/app/services/outbox_relay.py`

상태 확인:

- `GET /api/projects/outbox/summary`

## 7) 네트워크 주소

- 로컬 Node 스크립트: `localhost:9094`
- Docker `api` 컨테이너 내부: `kafka:9092`
- Kafka UI: `http://localhost:8080`
- Schema Registry: `http://localhost:8081`
