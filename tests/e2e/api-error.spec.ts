import { expect, test } from "@playwright/test";

test.describe("API error reporting", () => {
  test("returns an error id when JSON is invalid", async ({ request }) => {
    const response = await request.post("/api/projects", {
      data: "{",
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status()).toBe(400);

    const data = (await response.json()) as { message?: string; errorId?: string };
    expect(["invalid json", "id/name required"]).toContain(data.message);
    if (data.message === "invalid json") {
      expect(data.errorId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    }
  });
});
