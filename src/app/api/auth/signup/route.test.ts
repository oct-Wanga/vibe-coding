import { describe, expect, it, vi } from "vitest";

describe("/api/auth/signup POST", () => {
  it("fastapi 회원가입 엔드포인트로 프록시한다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, userId: "u1", needsEmailConfirm: false }), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "x-request-id": "req-2",
        },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", password: "12345678" }),
      headers: { "Content-Type": "application/json" },
    }) as unknown as Parameters<typeof POST>[0];

    const res = await POST(req);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/auth/signup",
      expect.any(Object),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("x-request-id")).toBe("req-2");
    expect(await res.json()).toEqual({ ok: true, userId: "u1", needsEmailConfirm: false });
  });
});
