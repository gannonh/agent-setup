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
write .claude/CLAUDE.md               blocks global lifecycle claude-pstack-models
write .codex/AGENTS.md                blocks global lifecycle codex-pstack-models
write .pi/agent/AGENTS.md             blocks pi-sub-agents global lifecycle
write .cursor/rules/global.mdc        mdc "global agent rules" global
write .cursor/rules/lifecycle.mdc     mdc "development lifecycle" lifecycle
write .cursor/rules/ponytail.mdc      mdc "Ponytail, lazy senior dev mode. Always pick the simplest solution that works." cursor-ponytail
write .cursor/rules/sub-agents.mdc    mdc "sub-agent model routing" cursor-sub-agents
write .cursor/rules/pstack-models.mdc mdc "pstack per-role model choices (overrides skill defaults)" cursor-pstack-models
