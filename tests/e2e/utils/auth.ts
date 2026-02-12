import { expect, type Page } from "@playwright/test";

const TEST_USER_EMAIL = "test12@gmail.com";
const TEST_USER_PASSWORD = "xptmxm1234!@";

export async function loginAsTestUser(page: Page) {
  await page.goto("/");

  await expect(page.getByTestId("auth-shell")).toBeVisible();
  await expect(page.getByTestId("auth-mode")).toHaveText("Sign in");

  await page.getByLabel(/email/i).fill(TEST_USER_EMAIL);
  await page.getByLabel(/^password$/i).fill(TEST_USER_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText("OK")).toBeVisible();
}
