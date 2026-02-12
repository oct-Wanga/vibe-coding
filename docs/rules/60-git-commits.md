---
alwaysApply: false
description: "Git: Conventional Commits + 한국어 커밋 + 인코딩 깨짐 대응"
globs:
---

# Git Commit Rules

---

## 1) Conventional Commits 규칙

작업이 모두 끝나면 **Conventional Commits** 형식으로 커밋 메시지를 작성한다.

형식:
- `type(scope): subject`

권장 type:
- feat, fix, refactor, chore, docs, test, ci

---

## 2) 커밋 메시지는 한국어로 작성

- subject는 한국어로 작성한다.
- scope는 필요할 때만(기능/모듈 단위).

예:
- `feat(auth): 로그인 폼 추가`
- `fix(project): 프로젝트 상세 조회 오류 수정`
- `test(e2e): 결제 플로우 시나리오 추가`

---

## 3) 한국어 깨짐(인코딩 문제) 발생 시

- 커밋 로그에서 한국어가 깨졌다면, 올바른 인코딩으로 수정해서 **다시 커밋할 수 있도록** 한다.
- 필요 시:
  - 마지막 커밋 메시지 수정(amend)
  - 또는 revert 후 재커밋
- 팀 정책이 “rewrite 금지”면 amend 대신 추가 커밋으로 교정한다.

---
