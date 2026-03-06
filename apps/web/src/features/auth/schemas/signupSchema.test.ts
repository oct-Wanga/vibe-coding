import { describe, expect, it } from "vitest";

import { signupSchema } from "./signupSchema";

describe("signupSchema", () => {
  it("accepts valid input", () => {
    const parsed = signupSchema.parse({
      email: "a@b.com",
      password: "12345678",
      confirmPassword: "12345678",
    });

    expect(parsed).toEqual({
      email: "a@b.com",
      password: "12345678",
      confirmPassword: "12345678",
    });
  });

  it("rejects mismatched confirmPassword", () => {
    try {
      signupSchema.parse({
        email: "a@b.com",
        password: "12345678",
        confirmPassword: "87654321",
      });
      expect.unreachable();
    } catch (e) {
      const zodError = e as { errors?: Array<{ path: unknown[]; message: string }> };
      expect(zodError.errors?.[0]?.path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects invalid email", () => {
    expect(() =>
      signupSchema.parse({
        email: "not-email",
        password: "12345678",
        confirmPassword: "12345678",
      }),
    ).toThrow();
  });
});
