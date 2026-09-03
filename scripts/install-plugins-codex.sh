#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

codex plugin marketplace add gannonh/open-pstack --ref main
codex plugin add pstack@open-pstack

codex plugin marketplace add gannonh/plan-build-verify
codex plugin add plan-build-verify@plan-build-verify
