# Architecture Roadmap (Service-Scale)

이 문서는 현재 레포(`web + api + redis + kafka(outbox)`)를 기준으로,
대중적인 서비스를 운영할 때 필요한 아키텍처 확장 순서를 제시합니다.

## 0) 전제

- 현재 강점: FSD 구조, FastAPI 분리, Redis 세션, Outbox/Kafka 실험 기반
- 현재 공백: 운영 자동화, 관측 통합, 고가용성, 데이터 계층 성숙도
- 목표: 과도한 선투자 없이 트래픽 성장에 맞춰 단계적으로 확장

## 1) Phase 1 - 지금 당장 (0~2개월)

핵심 목표: "장애를 빠르게 발견하고, 안전하게 배포"

1. 관측 통합(Logs/Metrics/Tracing): OpenTelemetry 계측 표준화(web/api), 구조화 로그+request id 전파, 에러 추적 대시보드 구축, SLO 초안(API p95/error rate) 정의
2. 배포 안정성: CI 테스트 게이트 강화(unit/e2e/api), 배포 헬스체크+자동 롤백, DB/Redis 연결 실패 시 명시적 에러 정책 문서화
3. 운영 보안 최소선: Secret 관리 체계화(.env/CI/운영 분리), 토큰/키 회전 절차 정의, 기본 감사 로그(로그인/권한 실패/관리 액션) 수집

완료 기준:

- 장애 발생 시 10분 내 탐지 가능한 대시보드/알림 보유
- 배포 실패 자동 차단 또는 롤백 동작 검증 완료
- 운영 비밀값이 코드/로그에 노출되지 않음

## 2) Phase 2 - 트래픽 증가기 (2~6개월)

핵심 목표: "읽기/쓰기 부하를 분리하고 병목을 줄임"

1. 데이터 계층 강화: PostgreSQL(또는 동급 RDB) 정식 도입, HA/백업(PITR), Redis 역할 분리(세션 vs 캐시), migration/rollback runbook 정립
2. 비동기 처리 분리: Kafka consumer 별도 worker 서비스화, 재시도/backoff/idempotency 키 표준화, DLQ 재처리 도구(runbook+script) 준비
3. 경계 계층 추가: API Gateway/Ingress rate limit, CDN+WAF+bot 방어 기본 설정, 캐시 전략(HTTP/API cache) 표준화

완료 기준:

- 피크 트래픽에서 API 오류율/지연 목표치 유지
- DLQ 누적 이벤트 재처리 절차가 문서+자동화로 준비됨
- DB/캐시 장애 시 서비스 영향 범위를 설명 가능한 상태

## 3) Phase 3 - 대규모 운영기 (6개월+)

핵심 목표: "서비스 확장과 조직 운영을 동시에 견디는 구조"

1. 아키텍처 분할: 도메인별 서비스 경계 명확화(모듈러 모놀리식 -> 점진 분리), read model/CQRS 조회 최적화, 검색 수요 증가 시 OpenSearch/Elasticsearch 도입
2. 신뢰성/복구 고도화: 멀티 AZ/리전 DR, 카나리/블루그린+feature flag 연계 배포, chaos test/복구 훈련 정례화
3. 제품 운영 플랫폼화: A/B test 및 분석 파이프라인, 백오피스 RBAC 정교화, 데이터 거버넌스(PII 마스킹/삭제요청/보존주기) 자동화

완료 기준:

- 주요 장애 시 RTO/RPO 목표 충족
- 실험/배포가 사용자 영향 최소화 상태로 상시 가능
- 규제/보안 감사 대응 문서와 로그 체계 확보

## 4) 현재 레포 기준 우선순위 Top 10

1. `docs/observability.md` 기준으로 API/Web 공통 OTel 계측 항목 정의
2. 에러 예산 기반 SLO/SLA 초안 작성
3. 배포 파이프라인에 헬스체크+롤백 단계 추가
4. `apps/api` DB 정식 도입 계획서(스키마/마이그레이션 정책)
5. Redis 세션/캐시 분리 전략 문서화
6. outbox relay -> consumer 분리 프로세스 설계
7. DLQ 재처리 스크립트/운영 절차 문서화
8. API gateway rate limit 정책 수립(로그인/쓰기 API 우선)
9. Secret rotation runbook 작성
10. 장애 훈련(게임데이) 시나리오 1회 실행

## 5) 실행 방식 권장

- 월 단위로 Phase를 고정하지 말고, SLO/트래픽 지표로 다음 단계 진입 결정
- 신규 기능 개발 시 "운영 항목(모니터링/알림/복구)"을 Definition of Done에 포함
- 큰 전환(DB, gateway, worker 분리)은 반드시 다크런/카나리로 검증
