import { describe, expect, it } from "vitest";

import { getStringParam, setParam } from "./searchParams";

describe("searchParams utils", () => {
  it("getStringParam works with URLSearchParams", () => {
    const sp = new URLSearchParams("a=1&b=hello");
    expect(getStringParam(sp, "a")).toBe("1");
    expect(getStringParam(sp, "b")).toBe("hello");
    expect(getStringParam(sp, "c")).toBeUndefined();
  });

  it("getStringParam works with object 형태", () => {
    const sp = { a: "1", b: ["x", "y"], c: undefined as unknown as string | undefined };
    expect(getStringParam(sp, "a")).toBe("1");
    expect(getStringParam(sp, "b")).toBe("x");
    expect(getStringParam(sp, "c")).toBeUndefined();
  });

  it("getStringParamOr returns fallback", () => {
    const sp = new URLSearchParams("a=1");
    expect(getStringParam(sp, "a") ?? "fallback").toBe("1");
    expect(getStringParam(sp, "missing") ?? "fallback").toBe("fallback");
  });

  it("setParam sets and deletes properly", () => {
    const next = new URLSearchParams();

    setParam(next, "auth", "signup");
    expect(next.get("auth")).toBe("signup");

    setParam(next, "auth", undefined);
    expect(next.get("auth")).toBeNull();

    setParam(next, "auth", "");
    expect(next.get("auth")).toBeNull();
  });
});
