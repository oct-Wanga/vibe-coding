import { expect, test } from "@playwright/test";
import { loginAsTestUser } from "./utils/auth";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("renders dashboard sections", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Recent Projects")).toBeVisible();
    await expect(page.getByText("Team", { exact: true })).toBeVisible();
    await expect(page.getByText("Activity")).toBeVisible();
  });
});
