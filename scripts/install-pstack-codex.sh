#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Local Codex marketplace. Catalog is .codex/.agents/plugins/marketplace.json;
# the plugin itself is .codex/pstack-codex.
codex plugin marketplace add ./.codex
codex plugin add pstack@pstack-codex
