import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findPackageRoot } from "../src/paths.js";

describe("findPackageRoot", () => {
  it("walks up from this test file to @gannonh/agent-setup", () => {
    const root = findPackageRoot();
    assert.match(root, /agent-setup$/);
  });
});
