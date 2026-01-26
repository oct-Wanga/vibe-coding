import { expect, test } from "@playwright/test";

test.describe("Health check (/api/health)", () => {
  test("returns ok status", async ({ request }) => {
    const response = await request.get("/api/health");

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    expect(data).toMatchObject({
      status: "ok",
    });
    expect(data.timestamp).toBeTruthy();
  });
});
