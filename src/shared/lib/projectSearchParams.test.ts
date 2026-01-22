import { describe, expect, it } from "vitest";

import { PROJECT_STATUS, readProjectsFilters } from "./projectSearchParams";

describe("projectSearchParams", () => {
  it("readProjectsFilters uses fallback when empty", () => {
    const sp = new URLSearchParams();

    const result = readProjectsFilters(sp, { q: "init", status: "all" });

    expect(result).toEqual({ q: "init", status: "all" });
  });

  it("readProjectsFilters reads q/status from URLSearchParams", () => {
    const sp = new URLSearchParams("q=hello&status=active");

    const result = readProjectsFilters(sp, { q: "init", status: "all" });

    expect(result).toEqual({ q: "hello", status: "active" });
  });

  it("readProjectsFilters ignores invalid status", () => {
    const sp = new URLSearchParams("status=invalid");

    const result = readProjectsFilters(sp, { q: "init", status: "archived" });

    expect(result).toEqual({ q: "init", status: "archived" });
  });

  it("PROJECT_STATUS contains allowed values", () => {
    expect(PROJECT_STATUS).toEqual(["all", "active", "archived"]);
  });
});
