import { expect, test } from "@playwright/test";

test.describe("Home auth toggle (/)", () => {
  test("default / shows login UI", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("auth-shell")).toBeVisible();
    await expect(page.getByTestId("auth-mode")).toHaveText("Sign in");

    // login form 필드 (id/label 기반이 불안하면 이것도 testid로)
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();

    await expect(page).not.toHaveURL(/auth=signup/);
  });

  test("toggle to signup updates UI and URL", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("auth-tab-signup").click();

    await expect(page.getByTestId("auth-mode")).toHaveText("Create account");
    await expect(page).toHaveURL(/auth=signup/);

    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
  });

  test("toggle back to login removes query", async ({ page }) => {
    await page.goto("/?auth=signup");

    await expect(page.getByTestId("auth-mode")).toHaveText("Create account");

    await page.getByTestId("auth-tab-login").click();

    await expect(page.getByTestId("auth-mode")).toHaveText("Sign in");
    await expect(page).not.toHaveURL(/auth=signup/);
  });

  test("direct entry /?auth=signup opens signup UI", async ({ page }) => {
    await page.goto("/?auth=signup");

    await expect(page.getByTestId("auth-mode")).toHaveText("Create account");
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
  });
});
