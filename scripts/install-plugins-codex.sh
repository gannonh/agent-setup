#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

codex plugin marketplace add gannonh/open-pstack --ref main
codex plugin add pstack@open-pstack
