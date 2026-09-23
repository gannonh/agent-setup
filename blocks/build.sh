#!/usr/bin/env bash
# Builds the per-harness rule files from the content blocks in this directory.
# Edit blocks/*.md, then run `blocks/build.sh`. Never edit the generated files.
# Usage: blocks/build.sh [outdir]   (default: repo root)
set -euo pipefail
cd "$(dirname "$0")/.."
out=${1:-.}

blocks() { local sep=; for b in "$@"; do printf '%s' "$sep"; cat "blocks/$b.md"; sep=$'\n'; done; }
mdc() { printf -- '---\ndescription: %s\nalwaysApply: true\n---\n' "$1"; blocks "${@:2}"; }
write() { mkdir -p "$out/$(dirname "$1")"; "${@:2}" > "$out/$1"; }

# Shared blocks: global, lifecycle. Harness-specific blocks carry a <harness>- prefix.
write .harness-rules/claude/.claude/CLAUDE.md      blocks global lifecycle kata-code-browser claude-pstack-models
# write .harness-rules/claude/.claude/CLAUDE.md      blocks global lifecycle
write .harness-rules/codex/AGENTS.override.md      blocks global lifecycle kata-code-browser codex-pstack-models
# write .harness-rules/codex/AGENTS.md      blocks global lifecycle 
write .harness-rules/opencode/OPENCODE.md      blocks global lifecycle kata-code-browser
write .harness-rules/pi/.pi/agent/AGENTS.md  blocks pi-sub-agents
write .harness-rules/cursor/.cursor/rules/global.mdc   mdc "global agent rules" global
write .harness-rules/cursor/.cursor/rules/lifecycle.mdc   mdc "development lifecycle" lifecycle
write .harness-rules/cursor/.cursor/rules/ponytail.mdc   mdc "Ponytail, lazy senior dev mode. Always pick the simplest solution that works." cursor-ponytail
write .harness-rules/cursor/.cursor/rules/sub-agents.mdc   mdc "sub-agent model routing" cursor-sub-agents
write .harness-rules/cursor/.cursor/rules/kata-code-browser.mdc   mdc "kata code browser rules" kata-code-browser
write .harness-rules/cursor/.cursor/rules/open-pstack-models.mdc   mdc "pstack per-role model choices (overrides skill defaults)" cursor-pstack-models
