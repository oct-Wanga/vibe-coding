import { expect, test } from "@playwright/test";

test.describe("Health check (/api/health)", () => {
  test("returns ok status", async ({ request }) => {
    const response = await request.get("/api/health");

    expect(response.ok()).toBeTruthy();
    expect(response.headers()["x-request-id"]).toBeTruthy();

    const data = await response.json();
    expect(data.requestId).toBe(response.headers()["x-request-id"]);

    expect(data).toMatchObject({
      status: "ok",
    });
    expect(data.environment).toBeTruthy();
    expect(data.timestamp).toBeTruthy();
  });

  test("echoes request id when provided", async ({ request }) => {
    const response = await request.get("/api/health", {
      headers: { "x-request-id": "req-123" },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.headers()["x-request-id"]).toBe("req-123");

    const data = await response.json();
    expect(data.requestId).toBe("req-123");
  });
});
