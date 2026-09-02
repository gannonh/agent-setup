import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseArgs } from "../src/args.js";
import { STEPS } from "../src/targets.js";

describe("parseArgs", () => {
  it("with no flags is interactive", () => {
    assert.deepEqual(parseArgs([]), { kind: "interactive" });
  });

  it("parses --all as every step", () => {
    assert.deepEqual(parseArgs(["--all"]), { kind: "install", targets: [...STEPS] });
  });

  it("parses a single target flag", () => {
    assert.deepEqual(parseArgs(["--claude"]), { kind: "install", targets: ["claude"] });
    assert.deepEqual(parseArgs(["--codex"]), { kind: "install", targets: ["codex"] });
    assert.deepEqual(parseArgs(["--cursor"]), { kind: "install", targets: ["cursor"] });
    assert.deepEqual(parseArgs(["--skills"]), { kind: "install", targets: ["skills"] });
  });

  it("parses --pi as AGENTS.md and extensions", () => {
    assert.deepEqual(parseArgs(["--pi"]), {
      kind: "install",
      targets: ["pi-agents", "pi-extensions"],
    });
  });

  it("combines target flags in stable order", () => {
    assert.deepEqual(parseArgs(["--pi", "--codex"]), {
      kind: "install",
      targets: ["codex", "pi-agents", "pi-extensions"],
    });
    assert.deepEqual(parseArgs(["--codex", "--claude"]), {
      kind: "install",
      targets: ["claude", "codex"],
    });
    assert.deepEqual(parseArgs(["--skills", "--codex"]), {
      kind: "install",
      targets: ["codex", "skills"],
    });
  });

  it("lets --all win over target flags", () => {
    assert.deepEqual(parseArgs(["--codex", "--all"]), {
      kind: "install",
      targets: [...STEPS],
    });
  });

  it("treats --help as help even with other flags", () => {
    assert.deepEqual(parseArgs(["--codex", "--help"]), { kind: "help" });
    assert.deepEqual(parseArgs(["-h"]), { kind: "help" });
  });

  it("parses --version", () => {
    assert.deepEqual(parseArgs(["--version"]), { kind: "version" });
    assert.deepEqual(parseArgs(["-v"]), { kind: "version" });
  });

  it("rejects unknown options", () => {
    const parsed = parseArgs(["--foo"]);
    assert.equal(parsed.kind, "error");
    if (parsed.kind === "error") {
      assert.match(parsed.message, /Unknown option: --foo/);
    }
  });
});
