import { describe, expect, it } from "vitest";

import { isArchived } from "./project";

describe("project model", () => {
  it("isArchived returns true when status is archived", () => {
    expect(isArchived({ status: "archived" })).toBe(true);
  });

  it("isArchived returns false when status is active", () => {
    expect(isArchived({ status: "active" })).toBe(false);
  });
});
