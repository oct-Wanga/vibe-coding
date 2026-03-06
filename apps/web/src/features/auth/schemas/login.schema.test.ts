import { describe, expect, it } from "vitest";

import { loginSchema } from "./login.schema";

describe("loginSchema", () => {
  it("accepts valid input", () => {
    const parsed = loginSchema.parse({ email: "a@b.com", password: "12345678" });
    expect(parsed).toEqual({ email: "a@b.com", password: "12345678" });
  });

  it("rejects invalid email", () => {
    expect(() => loginSchema.parse({ email: "not-email", password: "12345678" })).toThrow();
  });

  it("rejects short password", () => {
    expect(() => loginSchema.parse({ email: "a@b.com", password: "123" })).toThrow();
  });
});
