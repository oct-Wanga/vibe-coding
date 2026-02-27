import { expect, test } from "@playwright/test";

import { isFastApiBackend } from "./backendMode";

test.skip(!isFastApiBackend, "fastapi backend 전용 테스트");

test("health API는 정상 응답을 반환한다 (fastapi)", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();

  const body = (await response.json()) as {
    ok?: boolean;
    request_id?: string;
  };

  expect(body.ok).toBe(true);
  expect((body.request_id ?? "").length).toBeGreaterThan(0);
});
