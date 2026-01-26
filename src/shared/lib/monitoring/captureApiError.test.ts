import * as Sentry from "@sentry/nextjs";
import { describe, expect, it, vi } from "vitest";

import { captureApiError } from "./captureApiError";

vi.mock("crypto", () => ({
  randomUUID: vi.fn(() => "test-error-id"),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("captureApiError", () => {
  it("adds error context and returns a stable error id", () => {
    const error = new Error("boom");
    const errorId = captureApiError(error, {
      route: "/api/test",
      method: "POST",
      status: 500,
      details: { actor: "tester" },
    });

    expect(errorId).toBe("test-error-id");
    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      level: "error",
      tags: {
        route: "/api/test",
        method: "POST",
        status: "500",
        error_id: "test-error-id",
      },
      extra: { actor: "tester" },
    });
  });
});
