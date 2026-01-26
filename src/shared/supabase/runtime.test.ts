import { describe, expect, it } from "vitest";

import { shouldUseMockProjects } from "./runtime";

describe("shouldUseMockProjects", () => {
  it("supabase 환경이 없으면 mock 사용", () => {
    const result = shouldUseMockProjects({ hasEnv: false, hasClaims: false, nodeEnv: "test" });

    expect(result).toBe(true);
  });

  it("claims가 있으면 mock 사용하지 않음", () => {
    const result = shouldUseMockProjects({ hasEnv: true, hasClaims: true, nodeEnv: "test" });

    expect(result).toBe(false);
  });

  it("production에서 claims가 없으면 mock 사용하지 않음", () => {
    const result = shouldUseMockProjects({ hasEnv: true, hasClaims: false, nodeEnv: "production" });

    expect(result).toBe(false);
  });

  it("development/test에서 claims가 없으면 mock 사용", () => {
    const result = shouldUseMockProjects({ hasEnv: true, hasClaims: false, nodeEnv: "test" });

    expect(result).toBe(true);
  });
});
