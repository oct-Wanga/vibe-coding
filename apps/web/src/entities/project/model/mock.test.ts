import { describe, expect, it } from "vitest";

import { filterProjects, findProject, PROJECTS } from "./mock";

describe("project mock helpers", () => {
  it("findProject는 동일한 id를 반환한다", () => {
    const target = PROJECTS[0];
    const result = findProject(target.id);

    expect(result).toEqual(target);
  });

  it("filterProjects는 상태 필터를 적용한다", () => {
    const result = filterProjects({ status: "archived" });

    expect(result.every((project) => project.status === "archived")).toBe(true);
  });

  it("filterProjects는 검색어 필터를 적용한다", () => {
    const result = filterProjects({ q: "alpha" });

    expect(result.every((project) => project.name.toLowerCase().includes("alpha"))).toBe(true);
  });
});
