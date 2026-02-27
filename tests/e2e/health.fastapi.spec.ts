import { expect, test } from "@playwright/test";

import { isFastApiBackend } from "./backendMode";

test.skip(!isFastApiBackend, "fastapi backend 전용 테스트");

test.describe("Health check (/api/health, fastapi)", () => {
  test("returns ok payload", async ({ request }) => {
    const response = await request.get("/api/health");

    expect(response.ok()).toBeTruthy();
    expect(response.headers()["x-request-id"]).toBeTruthy();

    const data = (await response.json()) as {
      ok?: boolean;
      env?: string;
      timestamp?: string;
      request_id?: string;
    };

    expect(data.ok).toBe(true);
    expect(data.env).toBeTruthy();
    expect(data.timestamp).toBeTruthy();
    expect(data.request_id).toBe(response.headers()["x-request-id"]);
  });

  test("echoes request id when provided", async ({ request }) => {
    const response = await request.get("/api/health", {
      headers: { "x-request-id": "req-123" },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.headers()["x-request-id"]).toBe("req-123");

    const data = (await response.json()) as { request_id?: string };
    expect(data.request_id).toBe("req-123");
  });
});
