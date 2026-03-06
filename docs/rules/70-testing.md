---
alwaysApply: false
description: "Testing: vitest + Playwright(TDD), config/scripts 제한, 실데이터, data-testid"
globs:
  - "apps/web/tests/**/*.{ts,tsx}"
  - "apps/web/playwright.config.ts"
  - "package.json"
  - "apps/web/package.json"
  - "apps/web/src/**/*.{ts,tsx}"
---

# Testing Rules (Unit + E2E)

---

## 1) 테스트 스택/우선순위

- 유닛테스트: **vitest**
- E2E: **Playwright**
- TDD 기반으로 **Playwright 테스트를 먼저 작성**할 것.

---

## 2) Playwright 설정/실행 규칙

- `apps/web/playwright.config.ts` 설정 변경은 **원칙적으로 지양**한다.
  - 단, 모노레포 구조 변경/테스트 인프라 변경으로 반드시 필요할 때는 변경 사유를 문서화하고 팀 합의를 거친다.
- Playwright 테스트는 루트 `package.json` 또는 `apps/web/package.json`의 scripts에 등록된 명령으로만 실행할 것.
  - 새 실행 명령을 임의로 추가하지 말 것(정말 필요하면 팀 합의가 우선).

---

## 3) 데이터/목(Mock) 규칙

- Playwright 테스트에 **mock 데이터 사용하지 말고**, 실제 데이터를 테스트로 사용할 것.
- Playwright 테스트에 API 테스트가 필요한 경우,
  - 응답 결과를 **하드코딩하지 말 것.**

---

## 4) Timeout 규칙

- timeout 방식 테스트는 가능하면 사용하지 말 것(대체 수단 우선).
- 반드시 timeout이 필요할 때만 사용하며,
  - timeout은 **2000ms 미만**으로 설정할 것.

---

## 5) page.goto 규칙

- 테스트에서 page.goto는 baseUrl(호스트/포트)을 포함하지 말고 **경로만** 사용할 것.
  - 예: `await page.goto("/projects");`

---

## 6) Locator 규칙(data-testid)

- cssModule 충돌 방지를 위해,
  - html/css locator는 가능하면 class 기반 선택자 대신 **data-testid**로 테스트할 것.
- 테스트 가능한 요소에는 `data-testid`를 부여한다.

---
