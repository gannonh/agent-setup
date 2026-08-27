import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { applyCopy, copyPlan, joinContents } from "../src/copy.js";

function tempDir(): string {
  return mkdtempSync(join(tmpdir(), "agent-setup-copy-"));
}

describe("applyCopy", () => {
  it("copies when dest is missing, regardless of conflict", () => {
    const root = tempDir();
    const src = join(root, "src");
    const dest = join(root, "dest");
    mkdirSync(src);
    writeFileSync(join(src, "AGENTS.md"), "from-pkg\n");

    assert.equal(applyCopy(src, dest, "skip"), "copied");
    assert.equal(readFileSync(join(dest, "AGENTS.md"), "utf8"), "from-pkg\n");
  });

  it("replace overwrites shipped files and leaves extra dest files", () => {
    const root = tempDir();
    const src = join(root, "src");
    const dest = join(root, "dest");
    mkdirSync(src);
    mkdirSync(dest);
    writeFileSync(join(src, "AGENTS.md"), "from-pkg\n");
    writeFileSync(join(dest, "AGENTS.md"), "existing\n");
    writeFileSync(join(dest, "local.md"), "keep\n");

    assert.equal(applyCopy(src, dest, "replace"), "replaced");
    assert.equal(readFileSync(join(dest, "AGENTS.md"), "utf8"), "from-pkg\n");
    assert.equal(readFileSync(join(dest, "local.md"), "utf8"), "keep\n");
  });

  it("append concatenates onto existing files and copies missing ones", () => {
    const root = tempDir();
    const src = join(root, "src");
    const dest = join(root, "dest");
    mkdirSync(join(src, "nested"), { recursive: true });
    mkdirSync(dest);
    writeFileSync(join(src, "AGENTS.md"), "from-pkg\n");
    writeFileSync(join(src, "nested", "extra.md"), "new-file\n");
    writeFileSync(join(dest, "AGENTS.md"), "existing");

    assert.equal(applyCopy(src, dest, "append"), "appended");
    assert.equal(readFileSync(join(dest, "AGENTS.md"), "utf8"), "existing\nfrom-pkg\n");
    assert.equal(readFileSync(join(dest, "nested", "extra.md"), "utf8"), "new-file\n");
  });

  it("skip leaves dest unchanged", () => {
    const root = tempDir();
    const src = join(root, "src");
    const dest = join(root, "dest");
    mkdirSync(src);
    mkdirSync(dest);
    writeFileSync(join(src, "AGENTS.md"), "from-pkg\n");
    writeFileSync(join(dest, "AGENTS.md"), "existing\n");

    assert.equal(applyCopy(src, dest, "skip"), "skipped");
    assert.equal(readFileSync(join(dest, "AGENTS.md"), "utf8"), "existing\n");
  });
});

describe("applyCopy file", () => {
  it("copies a file when dest is missing", () => {
    const root = tempDir();
    const src = join(root, "AGENTS.md");
    const dest = join(root, "home", ".pi", "agent", "AGENTS.md");
    writeFileSync(src, "from-pkg\n");

    assert.equal(applyCopy(src, dest, "skip"), "copied");
    assert.equal(readFileSync(dest, "utf8"), "from-pkg\n");
  });

  it("replace overwrites the dest file", () => {
    const root = tempDir();
    const src = join(root, "AGENTS.md");
    const dest = join(root, "home", ".pi", "agent", "AGENTS.md");
    mkdirSync(join(root, "home", ".pi", "agent"), { recursive: true });
    writeFileSync(src, "from-pkg\n");
    writeFileSync(dest, "existing\n");

    assert.equal(applyCopy(src, dest, "replace"), "replaced");
    assert.equal(readFileSync(dest, "utf8"), "from-pkg\n");
  });

  it("append concatenates onto the dest file", () => {
    const root = tempDir();
    const src = join(root, "AGENTS.md");
    const dest = join(root, "home", ".pi", "agent", "AGENTS.md");
    mkdirSync(join(root, "home", ".pi", "agent"), { recursive: true });
    writeFileSync(src, "from-pkg\n");
    writeFileSync(dest, "existing");

    assert.equal(applyCopy(src, dest, "append"), "appended");
    assert.equal(readFileSync(dest, "utf8"), "existing\nfrom-pkg\n");
  });

  it("skip leaves the dest file unchanged", () => {
    const root = tempDir();
    const src = join(root, "AGENTS.md");
    const dest = join(root, "home", ".pi", "agent", "AGENTS.md");
    mkdirSync(join(root, "home", ".pi", "agent"), { recursive: true });
    writeFileSync(src, "from-pkg\n");
    writeFileSync(dest, "existing\n");

    assert.equal(applyCopy(src, dest, "skip"), "skipped");
    assert.equal(readFileSync(dest, "utf8"), "existing\n");
  });
});

describe("copyPlan", () => {
  it("describes a file dest", () => {
    const root = tempDir();
    const src = join(root, "AGENTS.md");
    const dest = join(root, "home", ".pi", "agent", "AGENTS.md");
    mkdirSync(join(root, "home", ".pi", "agent"), { recursive: true });
    writeFileSync(src, "from-pkg\n");
    writeFileSync(dest, "existing\n");

    assert.deepEqual(copyPlan(src, dest), {
      kind: "file",
      dest,
      files: [{ rel: "AGENTS.md", dest, exists: true }],
    });
  });

  it("marks directory files as exists or new", () => {
    const root = tempDir();
    const src = join(root, "src");
    const dest = join(root, "dest");
    mkdirSync(src);
    mkdirSync(dest);
    writeFileSync(join(src, "AGENTS.md"), "from-pkg\n");
    writeFileSync(join(src, "extra.md"), "new\n");
    writeFileSync(join(dest, "AGENTS.md"), "existing\n");

    const plan = copyPlan(src, dest);
    assert.equal(plan.kind, "directory");
    if (plan.kind !== "directory") return;
    const byRel = new Map(plan.files.map((file) => [file.rel, file]));
    assert.equal(byRel.get("AGENTS.md")?.exists, true);
    assert.equal(byRel.get("extra.md")?.exists, false);
  });
});

describe("joinContents", () => {
  it("inserts a newline when the existing file has none", () => {
    assert.equal(joinContents(Buffer.from("a"), Buffer.from("b")).toString(), "a\nb");
  });

  it("does not double a trailing newline", () => {
    assert.equal(joinContents(Buffer.from("a\n"), Buffer.from("b\n")).toString(), "a\nb\n");
  });
});
