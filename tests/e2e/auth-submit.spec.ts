import { expect, test } from "@playwright/test";

test.describe("Auth submit", () => {
  test("signup shows confirmPassword mismatch then success message on real API", async ({ page }) => {
    await page.goto("/?auth=signup");

    const form = page.locator("form");
    const email = `e2e_${Date.now()}@example.com`;

    await form.getByLabel(/email/i).fill(email);
    await form.getByLabel(/^password$/i).fill("12345678");
    await form.getByLabel(/confirm password/i).fill("87654321");

    await form.getByRole("button", { name: "Sign up" }).click();

    await expect(page.getByText("비밀번호가 일치하지 않습니다.")).toBeVisible();

    await form.getByLabel(/^password$/i).fill("12345678");
    await form.getByLabel(/confirm password/i).fill("12345678");
    const signupResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" && response.url().includes("/api/auth/signup"),
    );
    await form.getByRole("button", { name: "Sign up" }).click();
    const signupResponse = await signupResponsePromise;
    expect(signupResponse.ok()).toBeTruthy();

    await expect(
      page.getByText(/가입 완료! 이메일 인증을 진행해주세요\.|가입 완료! 로그인할 수 있어요\./),
    ).toBeVisible();
  });
});
