import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { findPackageRoot } from "../src/paths.js";

function runBash(script: string, cwd: string, env: NodeJS.ProcessEnv): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("bash", [script], { cwd, env, stdio: "ignore" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`install-skills.sh exited ${code ?? 1}`));
    });
  });
}

describe("install-skills.sh", () => {
  it("runs npx skills add in the caller's directory, not the package root", async () => {
    const project = mkdtempSync(join(tmpdir(), "agent-setup-skills-cwd-"));
    const bin = join(project, "bin");
    mkdirSync(bin);
    const record = join(project, "npx-cwd.txt");
    writeFileSync(
      join(bin, "npx"),
      `#!/usr/bin/env bash\nprintf '%s\\n' "$PWD" >> "${record}"\nexit 0\n`,
      { mode: 0o755 },
    );
    const pkg = findPackageRoot();
    await runBash(join(pkg, "scripts", "install-skills.sh"), project, {
      ...process.env,
      PATH: `${bin}:${process.env.PATH ?? ""}`,
      HOME: project,
    });
    const lines = readFileSync(record, "utf8").trim().split("\n");
    assert.ok(lines.length > 0);
    for (const line of lines) {
      assert.equal(realpathSync(line), realpathSync(project));
    }
  });
});
