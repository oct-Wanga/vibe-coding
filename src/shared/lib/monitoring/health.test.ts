import { describe, expect, it } from "vitest";

import { createHealthLogContext, createHealthPayload } from "./health";

describe("createHealthPayload", () => {
  it("returns a stable payload", () => {
    const now = new Date("2025-01-02T03:04:05.000Z");

    expect(createHealthPayload(now, "test", "req-1")).toEqual({
      status: "ok",
      timestamp: "2025-01-02T03:04:05.000Z",
      environment: "test",
      requestId: "req-1",
    });
  });

  it("creates a log context from payload", () => {
    const payload = createHealthPayload(
      new Date("2025-01-02T03:04:05.000Z"),
      "test",
      "req-2",
    );

    expect(createHealthLogContext(payload)).toEqual({
      status: "ok",
      environment: "test",
      requestId: "req-2",
    });
  });
});
