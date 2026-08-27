#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# claude
claude plugin marketplace add ericlitman/open-pstack --scope project
claude plugin install pstack@open-pstack --scope project -y


