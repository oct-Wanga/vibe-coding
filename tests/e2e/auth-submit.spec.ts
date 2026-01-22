import { expect, test } from "@playwright/test";

test.describe("Auth submit (mocked API)", () => {
  test("signup shows confirmPassword mismatch then success message on mocked response", async ({
    page,
  }) => {
    await page.goto("/?auth=signup");

    const form = page.locator("form");

    await form.getByLabel(/email/i).fill("a@b.com");
    await form.getByLabel(/^password$/i).fill("12345678");
    await form.getByLabel(/confirm password/i).fill("87654321");

    // ✅ 탭 버튼이 아니라 form submit 버튼만 클릭
    await form.getByRole("button", { name: "Sign up" }).click();

    await expect(page.getByText("비밀번호가 일치하지 않습니다.")).toBeVisible();

    await page.route("**/api/auth/signup", async (route) => {
      const body = route.request().postDataJSON() as { email?: string; password?: string };

      expect(body.email).toBe("a@b.com");
      expect(body.password).toBe("12345678");
      expect((body as { confirmPassword?: string }).confirmPassword).toBeUndefined();

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, userId: "u1", needsEmailConfirm: true }),
      });
    });

    await form.getByLabel(/^password$/i).fill("12345678");
    await form.getByLabel(/confirm password/i).fill("12345678");
    await form.getByRole("button", { name: "Sign up" }).click();

    await expect(page.getByText("가입 완료! 이메일 인증을 진행해주세요.")).toBeVisible();
  });
});
