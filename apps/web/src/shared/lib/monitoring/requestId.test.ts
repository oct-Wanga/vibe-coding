import { describe, expect, it } from "vitest";

import { ensureRequestId, getRequestId, REQUEST_ID_HEADER, resolveRequestId } from "./requestId";

describe("requestId utils", () => {
  it("prefers existing request id", () => {
    const existing = "existing";
    const generated = ensureRequestId(existing, () => "generated");

    expect(generated).toBe("existing");
  });

  it("generates when missing", () => {
    const generated = ensureRequestId(null, () => "generated");

    expect(generated).toBe("generated");
  });

  it("reads request id from headers", () => {
    const headers = new Headers({ [REQUEST_ID_HEADER]: "req-123" });

    expect(getRequestId(headers)).toBe("req-123");
  });

  it("resolves request id from headers or generator", () => {
    const headers = new Headers({ [REQUEST_ID_HEADER]: "req-456" });

    expect(resolveRequestId(headers, () => "generated")).toBe("req-456");
    expect(resolveRequestId(new Headers(), () => "generated")).toBe("generated");
  });
});
