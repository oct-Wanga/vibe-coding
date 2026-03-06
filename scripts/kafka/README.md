# Kafka 학습 가이드 (이 프로젝트 기준)

이 폴더는 Kafka를 처음 접하는 사람도 바로 실험할 수 있게 만든 샘플 스크립트 모음입니다.

## 0) Kafka 개념 빠르게 이해하기

- `Broker`: Kafka 서버 1대(이 프로젝트는 단일 브로커)
- `Topic`: 메시지를 저장하는 논리적 채널(예: `projects.project-created.v1`)
- `Partition`: Topic을 나눈 단위. 병렬 처리와 순서 보장 기준
- `Key`: 같은 key는 같은 partition으로 가므로 엔티티 단위 순서 보장에 사용
- `Consumer Group`: 같은 그룹 내 컨슈머들은 파티션을 나눠 읽음
- `Offset`: 파티션에서 어디까지 읽었는지 위치
- `Lag`: "토픽에 쌓인 양 - 소비 완료 양"
- `DLQ(Dead Letter Queue)`: 처리 실패 메시지를 따로 모으는 토픽

이 프로젝트에서는 아래 2개 토픽을 사용합니다.

- `projects.project-created.v1`: 정상 이벤트 흐름
- `events.dlq.v1`: 실패 이벤트 보관

## 0-1) 이 프로젝트 Kafka 로직

### A. 스크립트 학습 로직

1. Producer가 `projects.project-created.v1`에 이벤트 발행
2. Consumer가 이벤트 처리
3. 실패 이벤트(`force_fail=true`)는 `events.dlq.v1`로 이동
4. DLQ Consumer로 실패 원인 확인

### B. 백엔드 Outbox 로직

1. API에서 프로젝트 저장 시 outbox 이벤트를 `pending`으로 함께 저장
2. Relay worker가 pending/failed outbox를 주기적으로 조회
3. Kafka 발행 성공 시 `published`, 실패 시 `failed` + 재시도 카운트 증가
4. 필요하면 별도 consumer가 비즈니스 후처리 수행

## 1) 무엇이 들어있나

- `create-topics.mjs`: 테스트용 토픽 생성
- `produce-project-events.mjs`: 프로젝트 생성 이벤트 발행
- `consume-project-events.mjs`: 이벤트 소비 + 실패 시 DLQ 적재
- `consume-dlq.mjs`: DLQ 이벤트 확인
- `smoke-test.mjs`: 토픽 생성/발행/소비/DLQ 검증을 한 번에 실행

## 2) 먼저 실행

루트에서:

```bash
npm run kafka:up
npm run kafka:topics
```

UI 확인:

- Kafka UI: http://localhost:8080
- Schema Registry: http://localhost:8081

## 3) 가장 쉬운 테스트

```bash
npm run kafka:test
```

기본 동작:

1. 이벤트 100건 발행
2. 10건마다 실패 이벤트(`force_fail`) 주입
3. 워커가 실패 이벤트를 `events.dlq.v1`로 이동
4. 기대 DLQ 건수와 실제 건수를 비교

## 3-1) `kafka:test` 내부 로직

`kafka:test`는 아래 순서로 동작합니다.

1. 토픽 생성(`create-topics`와 동일 역할)
2. 이벤트 발행(`produce-project-events`와 동일 역할)
3. 워커 소비
   - 정상 이벤트는 처리 완료로 카운트
   - `force_fail=true` 이벤트는 DLQ 토픽으로 이동
4. DLQ 토픽 재조회
   - 현재 `run_id` 기준으로 DLQ 건수 검증
5. 기대값과 다르면 종료 코드 `1`로 실패 처리

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
- `RUN_ID`: 실행 식별자 (미지정 시 자동 생성)
- `GROUP_ID`: 컨슈머 그룹 ID (미지정 시 자동 생성)
- `MAX_MESSAGES`: consumer 최대 처리 건수 (`0`이면 계속 실행)

## 6) Outbox와 연결해서 보기

백엔드 Outbox 샘플을 함께 켜면, API에서 생성된 outbox 이벤트가 Kafka로 발행됩니다.

- 관련 코드: `backend/app/services/store.py`, `backend/app/services/outbox_relay.py`
- relay 활성화: `OUTBOX_RELAY_ENABLED=true`

### 6-1) 샘플 스크립트 흐름

```text
create-topics
  -> projects.project-created.v1 / events.dlq.v1 생성

produce-project-events
  -> 프로젝트 이벤트 발행

consume-project-events
  -> 정상 처리 후 commit
  -> 실패(force_fail)면 DLQ로 이동

consume-dlq
  -> 실패 이벤트 원인 확인
```

### 6-2) Outbox 연동 흐름

```text
POST /api/projects
  -> 프로젝트 저장 + outbox(pending) 저장
    -> relay worker polling
      -> Kafka publish (projects.project-created.v1)
        -> consumer 처리
          -> 성공: commit
          -> 실패: DLQ(events.dlq.v1) 이동
```

### Outbox 로직 요약

1. API에서 프로젝트 생성
2. 프로젝트 저장과 outbox 이벤트 저장을 함께 수행
3. relay worker가 outbox의 `pending/failed` 이벤트를 Kafka로 전송
4. 성공 시 `published`, 실패 시 `failed`로 상태 전환
5. `/api/projects/outbox/summary`에서 현재 누적 상태 확인
