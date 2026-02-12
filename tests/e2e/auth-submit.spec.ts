import { expect, test } from "@playwright/test";
import { loginAsTestUser } from "./utils/auth";

test.describe("Auth submit (real API)", () => {
  test("login submits with real account and can access dashboard", async ({ page }) => {
    await loginAsTestUser(page);

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});
