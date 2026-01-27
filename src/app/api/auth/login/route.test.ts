import { describe, expect, it, vi } from "vitest";

const signInWithPassword = vi.fn();

vi.mock("@/shared/supabase", () => {
  return {
    createSupabaseServerClient: vi.fn(async () => ({
      auth: {
        signInWithPassword,
      },
    })),
  };
});

describe("/api/auth/login POST", () => {
  it("returns 400 when email/password missing", async () => {
    const { POST } = await import("./route");

    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "" }),
      headers: { "Content-Type": "application/json" },
    }) as unknown as Parameters<typeof POST>[0];

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.headers.get("x-request-id")).toBeTruthy();

    const json = (await res.json()) as { message?: string };
    expect(json.message).toBe("email/password required");
  });

  it("returns 401 when supabase returns error", async () => {
    const { POST } = await import("./route");
    signInWithPassword.mockResolvedValueOnce({ error: { message: "Invalid login" } });

    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", password: "12345678" }),
      headers: { "Content-Type": "application/json" },
    }) as unknown as Parameters<typeof POST>[0];

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(res.headers.get("x-request-id")).toBeTruthy();

    const json = (await res.json()) as { message?: string };
    expect(json.message).toBe("Invalid login");
  });

  it("returns 200 ok=true on success", async () => {
    const { POST } = await import("./route");
    signInWithPassword.mockResolvedValueOnce({ error: null });

    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", password: "12345678" }),
      headers: { "Content-Type": "application/json" },
    }) as unknown as Parameters<typeof POST>[0];

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("x-request-id")).toBeTruthy();

    const json = (await res.json()) as { ok?: boolean };
    expect(json.ok).toBe(true);
  });
});
