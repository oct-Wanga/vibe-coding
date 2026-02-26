import { expect, test } from "@playwright/test";

test("health API는 정상 응답을 반환한다", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();

  const body = (await response.json()) as {
    status?: string;
    requestId?: string;
    request_id?: string;
  };

  expect(body.status).toBe("ok");
  expect((body.requestId ?? body.request_id ?? "").length).toBeGreaterThan(0);
});
