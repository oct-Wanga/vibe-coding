import { describe, expect, it } from "vitest";

import { projectKeys } from "./keys";

describe("projectKeys", () => {
  it("all/lists/details are stable", () => {
    expect(projectKeys.all).toEqual(["projects"]);
    expect(projectKeys.lists()).toEqual(["projects", "list"]);
    expect(projectKeys.details()).toEqual(["projects", "detail"]);
  });

  it("list includes params", () => {
    expect(projectKeys.list({ q: "a", status: "active" })).toEqual([
      "projects",
      "list",
      { q: "a", status: "active" },
    ]);
  });

  it("detail includes id", () => {
    expect(projectKeys.detail("p1")).toEqual(["projects", "detail", "p1"]);
  });
});
