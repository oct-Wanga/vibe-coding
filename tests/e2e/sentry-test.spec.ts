import { expect, test } from "@playwright/test";

test.describe("Sentry test page", () => {
  test("shows buttons to trigger client and server errors", async ({ page }) => {
    await page.goto("/sentry-test");

    await expect(page.getByRole("heading", { name: "Sentry 오류 발생 테스트" })).toBeVisible();
    await expect(page.getByRole("button", { name: "클라이언트 오류 전송" })).toBeVisible();
    await expect(page.getByRole("button", { name: "서버 오류 요청" })).toBeVisible();
  });
});
