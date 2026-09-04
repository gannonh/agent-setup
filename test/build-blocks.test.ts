import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

const TARGETS = [
  ".claude/CLAUDE.md",
  ".codex/AGENTS.md",
  ".pi/agent/AGENTS.md",
  ".cursor/rules/global.mdc",
  ".cursor/rules/lifecycle.mdc",
  ".cursor/rules/pstack-models.mdc",
];

describe("blocks/build.sh", () => {
  it("committed rule files match a fresh build", () => {
    const out = mkdtempSync(join(tmpdir(), "agent-setup-blocks-"));
    execFileSync("blocks/build.sh", [out]);
    for (const target of TARGETS) {
      assert.equal(
        readFileSync(target, "utf8"),
        readFileSync(join(out, target), "utf8"),
        `${target} is stale; run blocks/build.sh`,
      );
    }
  });
});
