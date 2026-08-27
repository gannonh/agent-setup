import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatConflictHelp } from "../src/prompt.js";

describe("formatConflictHelp", () => {
  it("explains replace, append, and skip for a file", () => {
    const dest = "/Users/me/.pi/agent/AGENTS.md";
    const text = formatConflictHelp({
      kind: "file",
      dest,
      files: [{ rel: "AGENTS.md", dest, exists: true }],
    });
    assert.match(text, /already exists/);
    assert.match(text, /overwrite \/Users\/me\/\.pi\/agent\/AGENTS\.md with this package's file/);
    assert.match(text, /add this package's content to the end of \/Users\/me\/\.pi\/agent\/AGENTS\.md/);
    assert.match(text, /leave \/Users\/me\/\.pi\/agent\/AGENTS\.md unchanged/);
  });

  it("lists directory files and whether they already exist", () => {
    const dest = "/Users/me/.codex";
    const text = formatConflictHelp({
      kind: "directory",
      dest,
      files: [
        { rel: "AGENTS.md", dest: `${dest}/AGENTS.md`, exists: true },
        { rel: "pstack-models.md", dest: `${dest}/pstack-models.md`, exists: false },
      ],
    });
    assert.match(text, /This package would write:/);
    assert.match(text, /AGENTS\.md {2}\(exists\)/);
    assert.match(text, /pstack-models\.md {2}\(new\)/);
    assert.match(text, /Other files in \/Users\/me\/\.codex stay/);
    assert.match(text, /overwrite existing files listed above; copy new ones/);
    assert.match(text, /add this package's content to the end of existing files; copy new ones/);
    assert.match(text, /write nothing/);
  });
});
