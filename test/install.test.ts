import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { install } from "../src/install.js";
import type { Conflict } from "../src/copy.js";

function fixture(): { pkg: string; home: string } {
  const root = mkdtempSync(join(tmpdir(), "agent-setup-install-"));
  const pkg = join(root, "pkg");
  const home = join(root, "home");
  mkdirSync(join(pkg, ".codex"), { recursive: true });
  mkdirSync(join(pkg, ".cursor", "rules"), { recursive: true });
  mkdirSync(join(pkg, ".pi", "agent"), { recursive: true });
  mkdirSync(home);
  writeFileSync(join(pkg, ".codex", "AGENTS.md"), "codex-src\n");
  writeFileSync(join(pkg, ".cursor", "rules", "global.mdc"), "cursor-src\n");
  writeFileSync(join(pkg, ".cursor", "rules", "first-party-models.mdc"), "first-party-src\n");
  writeFileSync(join(pkg, ".pi", "agent", "AGENTS.md"), "pi-src\n");
  return { pkg, home };
}

describe("install", () => {
  it("runs only the Claude script for the claude target", async () => {
    const { pkg, home } = fixture();
    const scripts: string[] = [];
    await install({
      targets: ["claude"],
      home,
      packageRoot: pkg,
      runScript: (name) => {
        scripts.push(name);
      },
      onConflict: () => "replace",
      log: () => {},
    });
    assert.deepEqual(scripts, ["install-pstack-claude.sh"]);
  });

  it("runs the Codex script then copies ~/.codex", async () => {
    const { pkg, home } = fixture();
    const scripts: string[] = [];
    await install({
      targets: ["codex"],
      home,
      packageRoot: pkg,
      runScript: (name) => {
        scripts.push(name);
      },
      onConflict: () => "replace",
      log: () => {},
    });
    assert.deepEqual(scripts, ["install-pstack-codex.sh"]);
    assert.equal(readFileSync(join(home, ".codex", "AGENTS.md"), "utf8"), "codex-src\n");
  });

  it("runs the Cursor script then copies ~/.cursor/rules", async () => {
    const { pkg, home } = fixture();
    const scripts: string[] = [];
    await install({
      targets: ["cursor"],
      home,
      packageRoot: pkg,
      runScript: (name) => {
        scripts.push(name);
      },
      onConflict: () => "replace",
      log: () => {},
    });
    assert.deepEqual(scripts, ["install-pstack-cursor.sh"]);
    assert.equal(readFileSync(join(home, ".cursor", "rules", "global.mdc"), "utf8"), "cursor-src\n");
    assert.equal(
      readFileSync(join(home, ".cursor", "rules", "first-party-models.mdc"), "utf8"),
      "first-party-src\n",
    );
  });

  it("copies ~/.pi/agent/AGENTS.md without installing extensions", async () => {
    const { pkg, home } = fixture();
    const scripts: string[] = [];
    await install({
      targets: ["pi-agents"],
      home,
      packageRoot: pkg,
      runScript: (name) => {
        scripts.push(name);
      },
      onConflict: () => "replace",
      log: () => {},
    });
    assert.deepEqual(scripts, []);
    assert.equal(readFileSync(join(home, ".pi", "agent", "AGENTS.md"), "utf8"), "pi-src\n");
  });

  it("installs Pi extensions without copying AGENTS.md", async () => {
    const { pkg, home } = fixture();
    const scripts: string[] = [];
    await install({
      targets: ["pi-extensions"],
      home,
      packageRoot: pkg,
      runScript: (name) => {
        scripts.push(name);
      },
      onConflict: () => "replace",
      log: () => {},
    });
    assert.deepEqual(scripts, ["install-pi-extensions.sh"]);
    assert.equal(existsSync(join(home, ".pi", "agent", "AGENTS.md")), false);
  });

  it("copies AGENTS.md before running extensions when both are selected", async () => {
    const { pkg, home } = fixture();
    const order: string[] = [];
    await install({
      targets: ["pi-agents", "pi-extensions"],
      home,
      packageRoot: pkg,
      runScript: (name) => {
        order.push(`script:${name}`);
        assert.equal(readFileSync(join(home, ".pi", "agent", "AGENTS.md"), "utf8"), "pi-src\n");
      },
      onConflict: () => "replace",
      log: () => {},
    });
    assert.deepEqual(order, ["script:install-pi-extensions.sh"]);
  });

  it("replaces ~/.pi/agent/AGENTS.md when the dest file exists", async () => {
    const { pkg, home } = fixture();
    mkdirSync(join(home, ".pi", "agent"), { recursive: true });
    writeFileSync(join(home, ".pi", "agent", "AGENTS.md"), "keep\n");
    await install({
      targets: ["pi-agents"],
      home,
      packageRoot: pkg,
      runScript: () => {},
      onConflict: () => "replace",
      log: () => {},
    });
    assert.equal(readFileSync(join(home, ".pi", "agent", "AGENTS.md"), "utf8"), "pi-src\n");
  });

  it("appends this package's content onto ~/.pi/agent/AGENTS.md", async () => {
    const { pkg, home } = fixture();
    mkdirSync(join(home, ".pi", "agent"), { recursive: true });
    writeFileSync(join(home, ".pi", "agent", "AGENTS.md"), "keep\n");
    await install({
      targets: ["pi-agents"],
      home,
      packageRoot: pkg,
      runScript: () => {},
      onConflict: () => "append",
      log: () => {},
    });
    assert.equal(readFileSync(join(home, ".pi", "agent", "AGENTS.md"), "utf8"), "keep\npi-src\n");
  });

  it("asks onConflict when dest exists and honors skip", async () => {
    const { pkg, home } = fixture();
    mkdirSync(join(home, ".codex"));
    writeFileSync(join(home, ".codex", "AGENTS.md"), "keep\n");
    const asked: string[] = [];
    await install({
      targets: ["codex"],
      home,
      packageRoot: pkg,
      runScript: () => {},
      onConflict: (plan) => {
        asked.push(plan.dest);
        return "skip";
      },
      log: () => {},
    });
    assert.deepEqual(asked, [join(home, ".codex")]);
    assert.equal(readFileSync(join(home, ".codex", "AGENTS.md"), "utf8"), "keep\n");
  });

  it("does not call onConflict when dest is missing", async () => {
    const { pkg, home } = fixture();
    let called = false;
    await install({
      targets: ["codex"],
      home,
      packageRoot: pkg,
      runScript: () => {},
      onConflict: () => {
        called = true;
        return "replace" satisfies Conflict;
      },
      log: () => {},
    });
    assert.equal(called, false);
  });

  it("runs --all in Codex, Cursor, Pi AGENTS.md, Pi extensions, skills order", async () => {
    const { pkg, home } = fixture();
    const scripts: string[] = [];
    await install({
      targets: ["codex", "cursor", "pi-agents", "pi-extensions", "skills"],
      home,
      packageRoot: pkg,
      runScript: (name) => {
        scripts.push(name);
      },
      onConflict: () => "replace",
      log: () => {},
    });
    assert.deepEqual(scripts, [
      "install-pstack-codex.sh",
      "install-pstack-cursor.sh",
      "install-pi-extensions.sh",
      "install-skills.sh",
    ]);
  });

  it("announces that Pi extensions can take a few minutes", async () => {
    const { pkg, home } = fixture();
    const logs: string[] = [];
    await install({
      targets: ["pi-extensions"],
      home,
      packageRoot: pkg,
      runScript: () => {},
      onConflict: () => "replace",
      log: (message) => {
        logs.push(message);
      },
    });
    assert.ok(logs.some((line) => line.includes("can take a few minutes")));
    assert.ok(logs.some((line) => line.includes("running install-pi-extensions.sh")));
  });
});
