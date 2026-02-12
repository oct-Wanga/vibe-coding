import { describe, expect, it, vi } from "vitest";

const getClaims = vi.fn();
const limit = vi.fn();
const order = vi.fn(() => ({ limit }));
const select = vi.fn(() => ({ order }));
const from = vi.fn(() => ({ select }));

const hasSupabaseEnv = vi.fn();

vi.mock("@/shared/supabase", () => {
  return {
    createSupabaseServerClient: vi.fn(async () => ({
      auth: { getClaims },
      from,
    })),
    hasSupabaseEnv,
  };
});

describe("/api/activity GET", () => {
  it("returns 500 when supabase env missing", async () => {
    const { GET } = await import("./route");
    hasSupabaseEnv.mockReturnValueOnce(false);

    const req = new Request("http://localhost/api/activity") as unknown as Parameters<
      typeof GET
    >[0];
    const res = await GET(req);

    expect(res.status).toBe(500);
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });

  it("returns 401 when claims missing", async () => {
    const { GET } = await import("./route");
    hasSupabaseEnv.mockReturnValueOnce(true);
    getClaims.mockResolvedValueOnce({ data: null });

    const req = new Request("http://localhost/api/activity") as unknown as Parameters<
      typeof GET
    >[0];
    const res = await GET(req);

    expect(res.status).toBe(401);
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });

  it("returns normalized activity logs", async () => {
    const { GET } = await import("./route");
    hasSupabaseEnv.mockReturnValueOnce(true);
    getClaims.mockResolvedValueOnce({ data: { claims: { sub: "u1" } } });
    limit.mockResolvedValueOnce({
      data: [
        {
          id: "a1",
          type: "project",
          message: "Created",
          actor: { id: "u1", name: "Mina" },
          created_at: "2026-02-12T00:00:00Z",
        },
      ],
      error: null,
    });

    const req = new Request("http://localhost/api/activity") as unknown as Parameters<
      typeof GET
    >[0];
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = (await res.json()) as Array<{ id: string; type: string; message: string }>;
    expect(json).toHaveLength(1);
    expect(json[0]).toMatchObject({ id: "a1", type: "project", message: "Created" });
  });
});
