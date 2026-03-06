---
alwaysApply: false
description: "Routing/Naming Rules: route groups, segments, 파일/폴더 네이밍"
globs:
  - "apps/web/src/app/**/*"
  - "apps/web/src/views/**/*"
---

# Routing & Naming Rules

- route group은 `(marketing)`, `(app)`, `(auth)`처럼 역할 기반
- segment는 kebab-case, 리소스 중심 네이밍
- dynamic segment는 의미 있는 이름(`[projectId]`) 우선
- page는 얇게(조립만), 로직은 features로

테스트의 page.goto는 baseUrl 포함 금지(경로만). (자세한 건 70-testing.md)

---
