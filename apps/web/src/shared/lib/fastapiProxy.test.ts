import { beforeEach, describe, expect, it, vi } from "vitest";

const captureException = vi.fn();

vi.mock("@sentry/nextjs", () => ({
  captureException,
}));

describe("proxyToFastApi", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    process.env.FASTAPI_BASE_URL = "http://fastapi.test";
  });

  it("upstream fetch 실패 시 Sentry로 예외를 전송하고 503을 반환한다", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("connect ECONNREFUSED")));
    const { proxyToFastApi } = await import("./fastapiProxy");
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-request-id": "req-123",
      },
      body: JSON.stringify({ email: "test@example.com" }),
    }) as unknown as Parameters<typeof proxyToFastApi>[0];

    const response = await proxyToFastApi(request, "/api/auth/login");

    expect(captureException).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(503);
    expect(response.headers.get("x-request-id")).toBe("req-123");
    await expect(response.json()).resolves.toEqual({
      message: "FastAPI upstream unavailable",
    });
  });
});
