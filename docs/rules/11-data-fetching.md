---
description: "Data Fetching: Track A/B, RSC vs React Query, SSOT"
globs:
  - "src/**/*.{ts,tsx}"
---

# Data Fetching Rules (Track 기반)

프로젝트는 Track A 또는 Track B 중 하나를 기본으로 한다(혼용 금지).
현재 트랙이 불명확하면, 기존 코드 패턴을 따라가고 **새 규칙을 추가하지 않는다.**

---

## Track A — FE(API Consumer)

- Client: React Query로 조회/캐시/동기화
- Write: React Query mutation + (필요 시) BFF(Route Handler) 프록시
- 인증/쿠키 정책에 따라 직접 호출 vs BFF를 하나로 통일

---

## Track B — Next 풀스택

- Read: Server Components에서 fetch/DB 호출 우선
- Write: Server Actions 우선
- Route Handlers는 외부 공개 API/웹훅 등으로 제한
- Client(React Query)는 인터랙션 강한 화면에서만 보조적 사용

---

## 공통 (SSOT)

- 같은 데이터를 RSC + React Query로 **이중 소스로 관리 금지**
- 에러는 숨기지 말고 throw/전파

---
