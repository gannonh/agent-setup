#!/usr/bin/env bash
# Uninstall pstack-codex from this machine. Leaves the source checkout alone.
set -euo pipefail

CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
PLUGIN_IDS=(
  pstack-codex@codex-plugins
  pstack@pstack-codex
  pstack@open-pstack
)
MARKETPLACES=(
  codex-plugins
  pstack-codex
  open-pstack
)

for id in "${PLUGIN_IDS[@]}"; do
  if codex plugin remove "$id" >/dev/null 2>&1; then
    echo "removed plugin $id"
  fi
done

for name in "${MARKETPLACES[@]}"; do
  if codex plugin marketplace remove "$name" >/dev/null 2>&1; then
    echo "removed marketplace $name"
  fi
done

rm -rf \
  "$CODEX_HOME/plugins/cache/codex-plugins" \
  "$CODEX_HOME/plugins/cache/pstack-codex" \
  "$CODEX_HOME/plugins/cache/open-pstack" \
  "$CODEX_HOME/.tmp/marketplaces/codex-plugins" \
  "$CODEX_HOME/.tmp/marketplaces/pstack-codex" \
  "$CODEX_HOME/.tmp/marketplaces/open-pstack"

config="$CODEX_HOME/config.toml"
if [[ -f "$config" ]]; then
  python3 - "$config" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()
drop = (
    "codex-plugins",
    "pstack-codex",
    "open-pstack",
)


def header(block: str) -> str:
    for line in block.splitlines():
        stripped = line.strip()
        if stripped.startswith("["):
            return stripped
    return ""


def keep(block: str) -> bool:
    name = header(block)
    if not name:
        return True
    return not any(token in name for token in drop)

blocks: list[str] = []
current: list[str] = []
for line in text.splitlines(keepends=True):
    if line.startswith("[") and current:
        blocks.append("".join(current))
        current = [line]
    else:
        current.append(line)
if current:
    blocks.append("".join(current))

kept = [block for block in blocks if keep(block)]
new = "".join(kept).rstrip() + "\n"
if new != text:
    path.write_text(new)
    print(f"stripped leftover pstack tables from {path}")
PY
fi
