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

describe("shipped assets", () => {
  it("ships the cursor rules --cursor copies to ~/.cursor/rules", () => {
    const root = findPackageRoot();
    assert.equal(existsSync(join(root, ".cursor", "rules", "global.mdc")), true);
    assert.equal(existsSync(join(root, ".cursor", "rules", "pstack-models.mdc")), true);
  });

  it("ships the CLAUDE.md --claude copies to ~/.claude", () => {
    const root = findPackageRoot();
    assert.equal(existsSync(join(root, ".claude", "CLAUDE.md")), true);
  });
});
