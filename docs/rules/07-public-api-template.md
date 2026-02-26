---
description: "Public API 규칙: index.ts export 정책/허용 패턴/금지 패턴"
globs:
  - "src/**/index.ts"
  - "src/**/*.{ts,tsx}"
---

# Public API Rules (index.ts)

features/entities/widgets/views는 **외부에서 접근 가능한 public API**를 `index.ts`로만 제공한다.
Cursor는 딥 임포트를 만들지 말고, 필요한 export는 index.ts로 승격시킨다.

---

## 1) 딥 임포트 금지(재강조)

금지:

- `@/features/*/ui/*`
- `@/features/*/model/*`
- `@/entities/*/model/*`
- `@/widgets/*/ui/*`
- `@/views/*/*`

허용:

- `@/features/<feature>`
- `@/entities/<entity>`
- `@/widgets/<widget>`
- `@/views/<view>`

---

## 2) index.ts는 “선별적 export”만 한다

- 필요 최소만 export
- 내부 폴더 구조를 외부에 노출하지 않는다
- 무분별한 barrel export 금지(필요한 엔트리만 선별)

---

## 3) export 범위 가이드

features/<feature>/index.ts 허용:

- Feature Entry UI(루트 컴포넌트)
- 공개 hook(useXxx)
- queryKey factory, public types
- 외부 공유 필요한 계약 스키마

금지:

- private helper, 내부 전용 types
- ui 세부 조각을 대량 노출(필요하면 widget 승격 검토)

---

## 4) index.ts 템플릿(권장)

```ts
export { FeatureEntry } from "./ui/FeatureEntry";
export { useSomething } from "./api/useSomething";
export { somethingKeys } from "./model/keys";
export type { Something } from "./model/types";
```
