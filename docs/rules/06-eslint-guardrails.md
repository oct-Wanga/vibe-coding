---
description: "ESLint Guardrails: boundaries, restricted imports, sort (린트 위반 방지)"
globs:
  - "src/**/*.{ts,tsx,js,jsx}"
  - "eslint.config.{js,mjs,cjs}"
---

# ESLint Guardrails Rules

이 프로젝트는 ESLint를 “아키텍처 방화벽”으로 사용한다.
Cursor는 코드 생성 시 **린트 위반 가능성이 있는 구조를 만들지 않는다.**

---

## 1) Import 경계(레이어) 위반 금지

- 레이어 역방향 import 금지(app/views/widgets/features/entities/shared)
- Public API 우회(딥 임포트) 금지

위반이 발생하면:
1) import 경로를 index.ts로 수정
2) 모듈 배치를 올바른 레이어로 이동
3) 필요 시 공통 코드는 shared/entities로 승격

---

## 2) Restricted Imports 준수

- `features/*`, `entities/*`, `widgets/*`, `views/*`는 index.ts 경유만
- util을 “편의”로 features 내부에서 공유하려 하지 말고 shared로 올릴지 판단

---

## 3) Import 정렬/스타일

- 프로젝트의 import 정렬 규칙(simple-import-sort 등) 준수
- unused import/vars 발생시키지 않기

---
