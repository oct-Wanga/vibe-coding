import { describe, expect, it } from "vitest";

import type { Project, ProjectsParams } from "../model/project";
import { matchesProjectsParams } from "./filter";

const baseProject: Project = {
  id: "p_001",
  name: "Alpha Project",
  status: "active",
  created_at: "2021-05-05",
  updated_at: "2021-05-06",
};

describe("matchesProjectsParams", () => {
  it("상태 필터가 all이면 항상 통과한다", () => {
    const params: ProjectsParams = { status: "all" };

    expect(matchesProjectsParams(baseProject, params)).toBe(true);
  });

  it("상태 필터가 다르면 실패한다", () => {
    const params: ProjectsParams = { status: "archived" };

    expect(matchesProjectsParams(baseProject, params)).toBe(false);
  });

  it("검색어가 포함되면 통과한다", () => {
    const params: ProjectsParams = { q: "alpha" };

    expect(matchesProjectsParams(baseProject, params)).toBe(true);
  });

  it("검색어가 포함되지 않으면 실패한다", () => {
    const params: ProjectsParams = { q: "bravo" };

    expect(matchesProjectsParams(baseProject, params)).toBe(false);
  });

  it("상태/검색어 조건을 모두 만족해야 한다", () => {
    const params: ProjectsParams = { q: "alpha", status: "active" };

    expect(matchesProjectsParams(baseProject, params)).toBe(true);
  });
});
