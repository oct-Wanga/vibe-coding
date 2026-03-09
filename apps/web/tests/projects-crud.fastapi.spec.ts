import type { Page } from "@playwright/test";
import type { Locator } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { isFastApiBackend } from "./backendMode";

test.skip(!isFastApiBackend, "fastapi backend 전용 테스트");

async function ensureAuthenticated(page: Page): Promise<void> {
  const email = `e2e_fastapi_${Date.now()}@example.com`;
  const password = "secret1234";

  const signupResponse = await page.request.post("/api/auth/signup", {
    data: { email, password },
  });
  expect(signupResponse.ok()).toBeTruthy();

  const loginResponse = await page.request.post("/api/auth/login", {
    data: { email, password },
  });
  expect(loginResponse.ok()).toBeTruthy();
}

async function openProjectDetail(page: Page, listItem: Locator, projectId: string) {
  await Promise.all([
    page.waitForURL(new RegExp(`/projects/${projectId}$`)),
    listItem.getByRole("link", { name: "Open" }).click(),
  ]);
}

test.describe("Projects CRUD (/projects, fastapi)", () => {
  test("create, update, archive, delete flow", async ({ page }) => {
    const uniqueId = `p_e2e_${Date.now()}`;
    const projectName = `E2E Project ${uniqueId}`;
    const updatedName = `${projectName} Updated`;

    await ensureAuthenticated(page);
    await page.goto("/projects");

    await page.getByPlaceholder("type project name").fill(projectName);
    await page.getByRole("button", { name: "Apply" }).click();

    await page.getByPlaceholder("프로젝트 이름").fill(projectName);
    await page.getByPlaceholder("자동 생성됨").fill(uniqueId);
    await page.getByRole("button", { name: "생성" }).click();

    await page.getByRole("button", { name: "Apply" }).click();

    const listItem = page.locator("li", { hasText: projectName });
    await expect(listItem).toBeVisible();

    await openProjectDetail(page, listItem, uniqueId);
    await expect(page.getByRole("heading", { name: projectName })).toBeVisible();

    await page.getByRole("textbox").first().fill(updatedName);
    await page.getByRole("button", { name: "변경" }).click();
    await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();

    await page.getByRole("button", { name: "보관" }).click();
    await expect(page.getByText("archived")).toBeVisible();

    const deleteResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === "DELETE" &&
        response.url().includes(`/api/projects/${uniqueId}`),
    );
    await page.getByRole("button", { name: "삭제" }).click();
    await page.getByRole("button", { name: "정말 삭제" }).click();
    const deleteResponse = await deleteResponsePromise;
    expect(deleteResponse.ok()).toBeTruthy();

    await page.goto("/projects");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.locator("li", { hasText: updatedName })).toHaveCount(0);
  });

  test("create project shows in list", async ({ page }) => {
    const uniqueId = `p_e2e_list_${Date.now()}`;
    const projectName = `E2E List ${uniqueId}`;

    await ensureAuthenticated(page);
    await page.goto("/projects");

    await page.getByPlaceholder("프로젝트 이름").fill(projectName);
    await page.getByPlaceholder("자동 생성됨").fill(uniqueId);
    await page.getByRole("button", { name: "생성" }).click();

    const listItem = page.locator("li", { hasText: projectName });
    await expect(listItem).toBeVisible();

    await openProjectDetail(page, listItem, uniqueId);
    const deleteResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === "DELETE" &&
        response.url().includes(`/api/projects/${uniqueId}`),
    );
    await page.getByRole("button", { name: "삭제" }).click();
    await page.getByRole("button", { name: "정말 삭제" }).click();
    const deleteResponse = await deleteResponsePromise;
    expect(deleteResponse.ok()).toBeTruthy();

    await page.goto("/projects");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.locator("li", { hasText: projectName })).toHaveCount(0);
  });
});
