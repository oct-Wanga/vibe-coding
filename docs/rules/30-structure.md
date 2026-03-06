---
description: "FSD structure: responsibilities + 내부 폴더 템플릿 + placement rules"
globs:
  - "apps/web/src/**/*"
---

# FSD Structure Rules

---

## 1) 레이어 책임

- app/: 라우팅 경계
- views/: 페이지 조립
- widgets/: 큰 블록 조립
- features/: 유스케이스
- entities/: 도메인 모델/규칙
- shared/: 공용 자산

---

## 2) 모듈 내부 템플릿(권장)

features/<feature>/:

- ui/ api/ actions/ model/ schemas/ index.ts

entities/<entity>/:

- model/ ui/ api/ index.ts

shared/:

- ui/ lib/ hooks/ stores/ config/ types 등

---

## 3) 위치 결정 트리

1. feature 한정 → features
2. 도메인 공유 → entities
3. 범용 공용 → shared
4. 조립 블록 → widgets
5. 라우트 종속 조립 → views
6. 라우팅 경계 → app

---
