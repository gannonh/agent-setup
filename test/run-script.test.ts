import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { formatElapsed, runScript } from "../src/run-script.js";

describe("formatElapsed", () => {
  it("formats seconds, minutes, and mixed", () => {
    assert.equal(formatElapsed(0), "0s");
    assert.equal(formatElapsed(1000), "1s");
    assert.equal(formatElapsed(59_000), "59s");
    assert.equal(formatElapsed(60_000), "1m");
    assert.equal(formatElapsed(90_000), "1m 30s");
  });
});

describe("runScript", () => {
  it("logs elapsed time when a script finishes", async () => {
    const root = mkdtempSync(join(tmpdir(), "agent-setup-script-"));
    mkdirSync(join(root, "scripts"));
    writeFileSync(join(root, "scripts", "ok.sh"), "#!/usr/bin/env bash\nexit 0\n");
    const logs: string[] = [];
    await runScript({
      packageRoot: root,
      scriptName: "ok.sh",
      home: root,
      log: (message) => {
        logs.push(message);
      },
    });
    assert.ok(logs.some((line) => /^ {2}done \(\d+s\)$/.test(line)));
  });

  it("prints a heartbeat while a script is still running", async () => {
    const root = mkdtempSync(join(tmpdir(), "agent-setup-script-"));
    mkdirSync(join(root, "scripts"));
    writeFileSync(join(root, "scripts", "slow.sh"), "#!/usr/bin/env bash\nsleep 0.2\n");
    const logs: string[] = [];
    await runScript({
      packageRoot: root,
      scriptName: "slow.sh",
      home: root,
      heartbeatMs: 50,
      log: (message) => {
        logs.push(message);
      },
    });
    assert.ok(logs.some((line) => line.startsWith("  still working...")));
    assert.ok(logs.some((line) => line.startsWith("  done (")));
  });
});
