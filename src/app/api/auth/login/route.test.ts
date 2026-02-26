import { beforeEach, describe, expect, it, vi } from "vitest";

const proxyToFastApi = vi.fn();
const localPost = vi.fn();

vi.mock("@/shared/lib/fastapiProxy", () => ({
  proxyToFastApi,
}));

vi.mock("./route.local", () => ({
  POST: localPost,
}));

describe("/api/auth/login POST", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.API_BACKEND;
  });

  it("API_BACKEND=fastapi면 FastAPI로 프록시한다", async () => {
    process.env.API_BACKEND = "fastapi";
    proxyToFastApi.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
    }) as unknown as Parameters<typeof POST>[0];

    await POST(req);

    expect(proxyToFastApi).toHaveBeenCalledWith(req, "/api/auth/login");
    expect(localPost).not.toHaveBeenCalled();
  });

  it("기본값(route)이면 기존 Route Handler를 사용한다", async () => {
    localPost.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
    }) as unknown as Parameters<typeof POST>[0];

    await POST(req);

    expect(localPost).toHaveBeenCalledWith(req);
    expect(proxyToFastApi).not.toHaveBeenCalled();
  });
});
