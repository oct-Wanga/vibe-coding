---
description: "Code Style: naming, exports, file naming, client/server suffix"
globs:
  - "apps/web/src/**/*.{ts,tsx}"
---

# Coding Style Rules

- const 우선, ===/!==, eval 금지.
- boolean: is/has/can/should.
- props callback: onX / 내부: handleX.
- 폴더 kebab-case, 컴포넌트 PascalCase.tsx, 훅 useX.ts.
- named export 우선, public API는 index.ts.
- server/client 의도 강하면 .server / .client suffix 사용.
- 자료구조를 근간으로 타입을 지정하여 잡을 것.

---
