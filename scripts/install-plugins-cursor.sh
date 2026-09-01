#!/usr/bin/env bash
# Install official Cursor pstack into ~/.cursor/plugins/local (no marketplace CLI).
# Override dest with PSTACK_DST=...
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PSTACK_DST="${PSTACK_DST:-${HOME}/.cursor/plugins/local/pstack}"
SETTINGS="${HOME}/.cursor/settings.json"
RULES_SRC="$ROOT/.cursor/rules"
RULES_DST="${HOME}/.cursor/rules"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

git -C "$tmp" init -q
git -C "$tmp" remote add origin https://github.com/cursor/plugins.git
git -C "$tmp" sparse-checkout init --cone
git -C "$tmp" sparse-checkout set pstack
git -C "$tmp" fetch -q --depth 1 origin main
git -C "$tmp" checkout -q FETCH_HEAD
sha="$(git -C "$tmp" rev-parse --short HEAD)"
test -f "$tmp/pstack/.cursor-plugin/plugin.json"

mkdir -p "$(dirname "$PSTACK_DST")"
rm -rf "$PSTACK_DST"
cp -R "$tmp/pstack" "$PSTACK_DST"

# Upstream skill defaults name Claude/GPT. Rewrite to Cursor Models so Task
# fallbacks stay on Grok/Composer. Re-applied on every install.
python3 - "$PSTACK_DST" <<'PY'
from pathlib import Path
import sys
root = Path(sys.argv[1])
subs = [
    ("claude-fable-5-thinking-max, gpt-5.6-sol-max, grok-4.6-fast-xhigh, claude-opus-5-thinking-xhigh",
     "cursor-grok-4.6-xhigh, composer-2.5-fast, cursor-grok-4.5-high-fast, composer-2.5-fast"),
    ("claude-fable-5-thinking-max", "cursor-grok-4.6-xhigh"),
    ("gpt-5.6-sol-max", "composer-2.5-fast"),
    ("claude-opus-5-thinking-xhigh", "cursor-grok-4.5-high-fast"),
    ("grok-4.6-fast-xhigh", "cursor-grok-4.6-xhigh"),
]
stale = (
    "claude-fable-5-thinking-max",
    "gpt-5.6-sol-max",
    "claude-opus-5-thinking-xhigh",
    "grok-4.6-fast-xhigh",
)
missed = []
for path in root.rglob("*"):
    if not path.is_file() or path.suffix not in {".md", ".mdc", ".mjs", ".ts", ".txt"}:
        continue
    try:
        text = path.read_text()
    except (OSError, UnicodeDecodeError):
        continue
    new = text
    for a, b in subs:
        new = new.replace(a, b)
    if new != text:
        path.write_text(new)
        text = new
    if any(s in text for s in stale):
        missed.append(str(path))
if missed:
    raise SystemExit("pstack rewrite left third-party skill defaults:\n" + "\n".join(missed))
PY

PSTACK_DST="$PSTACK_DST" SETTINGS="$SETTINGS" node <<'NODE'
const fs = require("fs");
const path = require("path");
const dst = process.env.PSTACK_DST;
const file = process.env.SETTINGS;
let data = {};
try {
  data = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}
if (data === null || typeof data !== "object" || Array.isArray(data)) {
  throw new Error(`${file} is not a JSON object`);
}
const plugins =
  data.enabled_plugins && typeof data.enabled_plugins === "object" && !Array.isArray(data.enabled_plugins)
    ? data.enabled_plugins
    : {};
data.enabled_plugins = { ...plugins, pstack: { path: dst } };
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
NODE

test -d "$RULES_SRC"
mkdir -p "$RULES_DST"
cp "$RULES_SRC/pstack-models.mdc" "$RULES_DST/pstack-models.mdc"

echo "cursor pstack -> $PSTACK_DST ($sha)"
echo "cursor pstack models -> $RULES_DST"
