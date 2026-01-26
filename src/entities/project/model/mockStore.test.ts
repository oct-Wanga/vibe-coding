import { describe, expect, it } from "vitest";

import {
  createMockProject,
  deleteMockProject,
  getMockProjects,
  updateMockProject,
} from "./mockStore";

describe("mockStore", () => {
  it("createMockProject는 목록에 추가한다", () => {
    const project = createMockProject({ id: "p_test_store", name: "Store Project" });
    const ids = getMockProjects().map((item) => item.id);

    expect(ids).toContain(project.id);
  });

  it("updateMockProject는 이름을 업데이트한다", () => {
    const updated = updateMockProject("p_test_store", { name: "Updated Name" });

    expect(updated?.name).toBe("Updated Name");
  });

  it("deleteMockProject는 항목을 제거한다", () => {
    const deleted = deleteMockProject("p_test_store");
    const ids = getMockProjects().map((item) => item.id);

    expect(deleted).toBe(true);
    expect(ids).not.toContain("p_test_store");
  });
});
