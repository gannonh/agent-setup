import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { findPackageRoot } from "../src/paths.js";

describe("findPackageRoot", () => {
  it("walks up from this test file to @gannonh/agent-setup", () => {
    const root = findPackageRoot();
    assert.match(root, /agent-setup$/);
  });
});

describe("cursor rules package", () => {
  it("ships first-party-models.mdc so --cursor copies it to ~/.cursor/rules", () => {
    const root = findPackageRoot();
    assert.equal(existsSync(join(root, ".cursor", "rules", "first-party-models.mdc")), true);
  });
});
