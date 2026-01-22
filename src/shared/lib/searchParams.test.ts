import { describe, expect, it } from "vitest";

import { getEnumParam, getNumberParam, getStringParam, setParam } from "./searchParams";

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

  it("getEnumParam returns allowed value only", () => {
    const allowed = ["all", "active", "archived"] as const;

    expect(getEnumParam(new URLSearchParams("status=active"), "status", allowed)).toBe("active");
    expect(getEnumParam(new URLSearchParams("status=invalid"), "status", allowed)).toBeUndefined();
    expect(getEnumParam(new URLSearchParams(), "status", allowed)).toBeUndefined();
  });

  it("getNumberParam parses finite numbers only", () => {
    const sp = new URLSearchParams("page=2&bad=NaN&inf=Infinity");
    expect(getNumberParam(sp, "page")).toBe(2);
    expect(getNumberParam(sp, "bad")).toBeUndefined();
    expect(getNumberParam(sp, "inf")).toBeUndefined();
    expect(getNumberParam(sp, "missing")).toBeUndefined();
  });

  it("getNumberParam applies min/max constraints", () => {
    const sp = new URLSearchParams("n=5");
    expect(getNumberParam(sp, "n", { min: 1, max: 10 })).toBe(5);
    expect(getNumberParam(sp, "n", { min: 6 })).toBeUndefined();
    expect(getNumberParam(sp, "n", { max: 4 })).toBeUndefined();
  });
});
