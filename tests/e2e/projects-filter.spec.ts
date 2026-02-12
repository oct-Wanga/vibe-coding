import { expect, test } from "@playwright/test";
import { loginAsTestUser } from "./utils/auth";

test.describe("Projects filter (/projects)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("apply updates URL with q and status", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();

    await page.getByPlaceholder("type project name").fill("alpha");

    await page.getByTestId("project-status").click();
    await page.getByRole("option", { name: "active" }).click();
    await page.getByRole("button", { name: "Apply" }).click();

    await expect(page).toHaveURL(/\/projects\?/);
    await expect(page).toHaveURL(/(?:\?|&)q=alpha(?:&|$)/);
    await expect(page).toHaveURL(/(?:\?|&)status=active(?:&|$)/);
  });

  test("reset removes q/status query params", async ({ page }) => {
    await page.goto("/projects?q=alpha&status=archived");
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();

    await page.getByRole("button", { name: "Reset" }).click();

    // reset은 /projects? 처럼 '?'가 남을 수 있으니 파라미터만 제거됐는지 확인
    await expect(page).not.toHaveURL(/(?:\?|&)q=alpha(?:&|$)/);
    await expect(page).not.toHaveURL(/(?:\?|&)status=archived(?:&|$)/);
  });

  test("apply trims q and removes empty q from URL", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();

    await page.getByPlaceholder("type project name").fill("   ");
    await page.getByRole("button", { name: "Apply" }).click();

    await expect(page).not.toHaveURL(/(?:\?|&)q=(?:&|$)/);
  });
});
