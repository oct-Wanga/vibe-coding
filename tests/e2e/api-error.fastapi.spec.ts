import { expect, test } from "@playwright/test";

import { isFastApiBackend } from "./backendMode";

test.skip(!isFastApiBackend, "fastapi backend 전용 테스트");

test.describe("API error reporting (fastapi)", () => {
  test("returns validation error when JSON is invalid", async ({ request }) => {
    const response = await request.post("/api/projects", {
      data: "{",
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status()).toBe(422);

    const data = (await response.json()) as { detail?: unknown };
    expect(data.detail).toBeTruthy();
  });
});
