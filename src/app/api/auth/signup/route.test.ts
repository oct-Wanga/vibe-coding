import { describe, expect, it, vi } from "vitest";

const signUp = vi.fn();

vi.mock("@/shared/supabase", () => {
  return {
    createSupabaseServerClient: vi.fn(async () => ({
      auth: {
        signUp,
      },
    })),
  };
});

describe("/api/auth/signup POST", () => {
  it("returns 400 when email/password missing", async () => {
    const { POST } = await import("./route");

    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email: "   ", password: "" }),
      headers: { "Content-Type": "application/json" },
    }) as unknown as Parameters<typeof POST>[0];

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = (await res.json()) as { message?: string };
    expect(json.message).toBe("email/password required");
  });

  it("returns 400 with supabase error message", async () => {
    const { POST } = await import("./route");
    signUp.mockResolvedValueOnce({ data: null, error: { message: "User already registered" } });

    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", password: "12345678" }),
      headers: { "Content-Type": "application/json" },
    }) as unknown as Parameters<typeof POST>[0];

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = (await res.json()) as { message?: string };
    expect(json.message).toBe("User already registered");
  });

  it("returns ok with needsEmailConfirm=true when session is null", async () => {
    const { POST } = await import("./route");
    signUp.mockResolvedValueOnce({
      data: { user: { id: "u1" }, session: null },
      error: null,
    });

    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", password: "12345678" }),
      headers: { "Content-Type": "application/json" },
    }) as unknown as Parameters<typeof POST>[0];

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = (await res.json()) as {
      ok?: boolean;
      userId?: string | null;
      needsEmailConfirm?: boolean;
    };

    expect(json.ok).toBe(true);
    expect(json.userId).toBe("u1");
    expect(json.needsEmailConfirm).toBe(true);
  });

  it("returns ok with needsEmailConfirm=false when session exists", async () => {
    const { POST } = await import("./route");
    signUp.mockResolvedValueOnce({
      data: { user: { id: "u2" }, session: { access_token: "t" } },
      error: null,
    });

    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", password: "12345678" }),
      headers: { "Content-Type": "application/json" },
    }) as unknown as Parameters<typeof POST>[0];

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = (await res.json()) as { needsEmailConfirm?: boolean; userId?: string | null };
    expect(json.userId).toBe("u2");
    expect(json.needsEmailConfirm).toBe(false);
  });
});
