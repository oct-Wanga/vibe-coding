import { expect, test } from "@playwright/test";
import { loginAsTestUser } from "./utils/auth";

test.describe("Projects CRUD (/projects)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("create, update, archive, delete flow", async ({ page }) => {
    const uniqueId = `p_e2e_${Date.now()}`;
    const projectName = `E2E Project ${uniqueId}`;
    const updatedName = `${projectName} Updated`;

    await page.goto("/projects");

    await page.getByPlaceholder("type project name").fill(projectName);
    await page.getByRole("button", { name: "Apply" }).click();

    await page.getByPlaceholder("프로젝트 이름").fill(projectName);
    await page.getByPlaceholder("자동 생성됨").fill(uniqueId);
    await page.getByRole("button", { name: "생성" }).click();

    await page.getByRole("button", { name: "Apply" }).click();

    const listItem = page.locator("li", { hasText: projectName });
    await expect(listItem).toBeVisible();

    await listItem.getByRole("link", { name: "Open" }).click();
    await expect(page.getByRole("heading", { name: projectName })).toBeVisible();

    await page.getByRole("textbox").first().fill(updatedName);
    await page.getByRole("button", { name: "변경" }).click();
    await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();

    await page.getByRole("button", { name: "보관" }).click();
    await expect(page.getByText("archived")).toBeVisible();

    await page.getByRole("button", { name: "삭제" }).click();
    await page.getByRole("button", { name: "정말 삭제" }).click();

    await expect(page).toHaveURL("/projects");
    await expect(page.locator("li", { hasText: updatedName })).toHaveCount(0);
  });

  test("create project shows in list", async ({ page }) => {
    const uniqueId = `p_e2e_list_${Date.now()}`;
    const projectName = `E2E List ${uniqueId}`;

    await page.goto("/projects");

    await page.getByPlaceholder("프로젝트 이름").fill(projectName);
    await page.getByPlaceholder("자동 생성됨").fill(uniqueId);
    await page.getByRole("button", { name: "생성" }).click();

    const listItem = page.locator("li", { hasText: projectName });
    await expect(listItem).toBeVisible();

    await listItem.getByRole("link", { name: "Open" }).click();
    await page.getByRole("button", { name: "삭제" }).click();
    await page.getByRole("button", { name: "정말 삭제" }).click();

    await expect(page).toHaveURL("/projects");
  });
});
