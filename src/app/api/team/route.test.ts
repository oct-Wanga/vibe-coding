import { describe, expect, it, vi } from "vitest";

const getClaims = vi.fn();
const select = vi.fn();
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

describe("/api/team GET", () => {
  it("returns 500 when supabase env missing", async () => {
    const { GET } = await import("./route");
    hasSupabaseEnv.mockReturnValueOnce(false);

    const req = new Request("http://localhost/api/team") as unknown as Parameters<typeof GET>[0];
    const res = await GET(req);

    expect(res.status).toBe(500);
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });

  it("returns 401 when claims missing", async () => {
    const { GET } = await import("./route");
    hasSupabaseEnv.mockReturnValueOnce(true);
    getClaims.mockResolvedValueOnce({ data: null });

    const req = new Request("http://localhost/api/team") as unknown as Parameters<typeof GET>[0];
    const res = await GET(req);

    expect(res.status).toBe(401);
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });

  it("returns normalized team members", async () => {
    const { GET } = await import("./route");
    hasSupabaseEnv.mockReturnValueOnce(true);
    getClaims.mockResolvedValueOnce({ data: { claims: { sub: "u1" } } });
    select.mockResolvedValueOnce({
      data: [
        {
          id: "u1",
          email: "a@b.com",
          name: "User",
          full_name: null,
          avatar_url: "https://example.com/a.png",
          role: "admin",
        },
      ],
      error: null,
    });

    const req = new Request("http://localhost/api/team") as unknown as Parameters<typeof GET>[0];
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = (await res.json()) as Array<{
      id: string;
      email: string;
      name: string | null;
      imageUrl?: string | null;
      role?: string;
    }>;
    expect(json).toHaveLength(1);
    expect(json[0]).toMatchObject({
      id: "u1",
      email: "a@b.com",
      name: "User",
      imageUrl: "https://example.com/a.png",
      role: "admin",
    });
  });
});
