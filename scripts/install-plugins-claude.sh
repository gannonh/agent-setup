#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

claude plugin marketplace add gannonh/open-pstack
claude plugin install pstack@open-pstack
