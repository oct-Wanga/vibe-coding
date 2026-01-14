import {describe, expect, it} from "vitest";

import {assert} from "./assert";

describe("assert", () => {
  it("throws when condition is false", () => {
    expect(() => assert(false, "boom")).toThrow("boom");
  });
});
