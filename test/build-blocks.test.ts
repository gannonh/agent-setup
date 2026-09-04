import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

describe("blocks/build.sh", () => {
  it("committed rule files match a fresh build", () => {
    const out = mkdtempSync(join(tmpdir(), "agent-setup-blocks-"));
    execFileSync("blocks/build.sh", [out]);
    const targets = (readdirSync(out, { recursive: true }) as string[]).filter((rel) =>
      statSync(join(out, rel)).isFile(),
    );
    assert.ok(targets.length >= 8, `expected build output, got ${targets.length} files`);
    for (const target of targets) {
      assert.equal(
        readFileSync(target, "utf8"),
        readFileSync(join(out, target), "utf8"),
        `${target} is stale; run blocks/build.sh`,
      );
    }
  });
});
