import { describe, expect, it } from "vitest";

import { formatProjectLabel } from "./format";

describe("formatProjectLabel", () => {
  it("adds (archived) suffix when status is archived", () => {
    expect(formatProjectLabel({ name: "Alpha", status: "archived" })).toBe("Alpha (archived)");
  });

  it("returns name as-is when status is active", () => {
    expect(formatProjectLabel({ name: "Alpha", status: "active" })).toBe("Alpha");
  });
});
