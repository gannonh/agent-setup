#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Local sibling checkout when present; otherwise the public GitHub marketplace.
if [[ -d ../codex-plugins/.agents/plugins ]]; then
  marketplace="../codex-plugins"
else
  marketplace="gannonh/codex-plugins"
fi

codex plugin marketplace add "$marketplace"
codex plugin add pstack-codex@codex-plugins
