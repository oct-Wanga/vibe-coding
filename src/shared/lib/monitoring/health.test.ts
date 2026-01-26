import { describe, expect, it } from "vitest";

import { createHealthPayload } from "./health";

describe("createHealthPayload", () => {
  it("returns a stable payload", () => {
    const now = new Date("2025-01-02T03:04:05.000Z");

    expect(createHealthPayload(now, "test")).toEqual({
      status: "ok",
      timestamp: "2025-01-02T03:04:05.000Z",
      environment: "test",
    });
  });
});
