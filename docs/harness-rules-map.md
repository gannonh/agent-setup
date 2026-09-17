# Harness rules map

The simplest project layout where OpenCode, Claude Code, Codex, and Cursor each read one file that none of the others read.

## The shape

```text
project/
├── AGENTS.override.md          # Codex
├── OPENCODE.md                 # OpenCode
├── opencode.json               # { "instructions": ["OPENCODE.md"] }
├── .claude/
│   └── CLAUDE.md               # Claude Code
└── .cursor/
    └── rules/
        └── project.mdc         # Cursor, frontmatter: alwaysApply: true
```

No root `AGENTS.md` and no root `CLAUDE.md`. Those two names are the only ones more than one harness looks for.

## Why each file is exclusive

| Harness | Reads | Why the others skip it |
| --- | --- | --- |
| Codex | `AGENTS.override.md` | Codex checks `AGENTS.override.md` before `AGENTS.md` in each directory from the Git root to the working directory and takes at most one file per directory. No other harness knows the override name. |
| OpenCode | `OPENCODE.md` via `opencode.json` | Only OpenCode reads `opencode.json`. Its native search walks up looking for `AGENTS.md`, then `CLAUDE.md`, and finds neither. |
| Claude Code | `.claude/CLAUDE.md` | Claude Code accepts `./CLAUDE.md` or `./.claude/CLAUDE.md` as the project file. OpenCode's fallback checks only a root-level `CLAUDE.md`. Codex and Cursor never read `CLAUDE.md`. |
| Cursor | `.cursor/rules/project.mdc` | Only Cursor reads `.cursor/rules/`. The file must use the `.mdc` extension. `alwaysApply: true` loads it every session. |

## What breaks the shape

- Adding a root `AGENTS.md` makes OpenCode and Cursor both read it, and Codex ignores it in favor of the override.
- Adding a root `CLAUDE.md` makes OpenCode read it as a fallback. Keep the Claude file inside `.claude/`.
- A `.md` file in `.cursor/rules/` is ignored. Cursor requires `.mdc`.
- Global files stack on top of these: `~/.codex/AGENTS.override.md` or `~/.codex/AGENTS.md`, `~/.claude/CLAUDE.md`, `~/.config/opencode/AGENTS.md`, Cursor User Rules. OpenCode also reads `~/.claude/CLAUDE.md` when `~/.config/opencode/AGENTS.md` is absent, unless `OPENCODE_DISABLE_CLAUDE_CODE_PROMPT=1` is set.

## Full load rules per harness

| Harness | Project search | Global | Merge |
| --- | --- | --- | --- |
| OpenCode | Walk up from cwd for `AGENTS.md`, then `CLAUDE.md`. First hit wins. Plus every entry in `opencode.json` `instructions` (paths, globs, URLs). | `~/.config/opencode/AGENTS.md`, else `~/.claude/CLAUDE.md` | One project file plus instructions entries |
| Claude Code | `CLAUDE.md` or `.claude/CLAUDE.md` and `CLAUDE.local.md` in cwd and every ancestor. `.claude/rules/*.md` (with optional `paths:` globs). Subdirectory files load on demand. `@path` imports expand at launch. | Managed policy file, `~/.claude/CLAUDE.md`, `~/.claude/rules/` | Concatenate, root first |
| Codex | Each directory from Git root to cwd: `AGENTS.override.md`, else `AGENTS.md`, else `project_doc_fallback_filenames`. One file per directory. 32 KiB cap (`project_doc_max_bytes`). | `~/.codex/AGENTS.override.md`, else `~/.codex/AGENTS.md` | Concatenate, root first |
| Cursor | `.cursor/rules/**/*.mdc` by frontmatter (`alwaysApply`, `globs`, `description`, or manual). `AGENTS.md` at root and in subdirectories, nested combined with parents. | Team Rules (dashboard), User Rules (settings) | Team → Project → User, earlier wins |

## Sources

- OpenCode: https://opencode.ai/docs/rules/ and `packages/opencode/src/session/instruction.ts`
- Claude Code: https://code.claude.com/docs/en/memory
- Codex: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- Cursor: https://cursor.com/docs/rules

Checked 2026-09-14.
