import { describe, expect, it } from "vitest";

import { formatLog } from "./logger";

describe("formatLog", () => {
  it("serializes log payload with context", () => {
    const now = new Date("2025-02-03T04:05:06.000Z");

    expect(formatLog("info", "hello", { requestId: "abc" }, now)).toBe(
      JSON.stringify({
        level: "info",
        message: "hello",
        timestamp: "2025-02-03T04:05:06.000Z",
        context: { requestId: "abc" },
      }),
    );
  });
});
