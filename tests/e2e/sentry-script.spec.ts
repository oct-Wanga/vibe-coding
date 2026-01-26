import { expect, test } from "@playwright/test";

test.describe("Sentry browser script", () => {
  test("reports sentry enabled when DSN is configured", async ({ request }) => {
    const response = await request.get("/api/observability/sentry");

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    expect(data).toEqual({ enabled: true });
  });
});
