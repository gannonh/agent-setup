#!/usr/bin/env bash
# Install the Cursor plugins listed in plugins-cursor.toml.
# Cursor's CLI manages marketplaces but cannot install plugins, so each entry
# is sparse-cloned into ~/.cursor/plugins/local/<name> and registered under
# enabled_plugins in ~/.cursor/settings.json (the documented local-plugin
# mechanism). Restart Cursor or run "Developer: Reload Window" to pick them up.
set -euo pipefail

SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
MANIFEST="$SCRIPTS_DIR/plugins-cursor.toml"
LOCAL_DIR="${HOME}/.cursor/plugins/local"
SETTINGS="${HOME}/.cursor/settings.json"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

# Parse the [[plugin]] tables (name/repo/path/ref string keys) into TSV.
MANIFEST="$MANIFEST" node > "$tmp/entries.tsv" <<'NODE'
const { readFileSync } = require("fs");
const text = readFileSync(process.env.MANIFEST, "utf8");
const blocks = text.split(/^\[\[plugin\]\]\s*$/m).slice(1);
if (blocks.length === 0) throw new Error("no [[plugin]] tables in manifest");
for (const block of blocks) {
  const entry = {};
  for (const line of block.split("\n")) {
    const m = line.match(/^\s*(name|repo|path|ref)\s*=\s*"([^"]*)"\s*(#.*)?$/);
    if (m) entry[m[1]] = m[2];
  }
  for (const key of ["name", "repo", "path"]) {
    if (!entry[key]) throw new Error(`plugin entry missing ${key}`);
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(entry.name)) {
    throw new Error(`plugin name must be lowercase letters, digits, hyphens: ${entry.name}`);
  }
  console.log([entry.name, entry.repo, entry.path, entry.ref || "main"].join("\t"));
}
NODE

names=()
while IFS=$'\t' read -r name repo path ref; do
  checkout="$tmp/$name"
  git init -q "$checkout"
  git -C "$checkout" remote add origin "$repo"
  git -C "$checkout" sparse-checkout init --cone
  git -C "$checkout" sparse-checkout set "$path"
  git -C "$checkout" fetch -q --depth 1 origin "$ref"
  git -C "$checkout" checkout -q FETCH_HEAD
  sha="$(git -C "$checkout" rev-parse --short HEAD)"
  src="$checkout/$path"
  if [[ ! -f "$src/.cursor-plugin/plugin.json" && ! -f "$src/plugin.json" ]]; then
    echo "error: $repo $path has no plugin manifest" >&2
    exit 1
  fi
  mkdir -p "$LOCAL_DIR"
  rm -rf "${LOCAL_DIR:?}/$name"
  cp -R "$src" "$LOCAL_DIR/$name"
  echo "cursor plugin $name -> $LOCAL_DIR/$name ($sha)"
  names+=("$name")
done < "$tmp/entries.tsv"

PLUGIN_NAMES="${names[*]}" LOCAL_DIR="$LOCAL_DIR" SETTINGS="$SETTINGS" node <<'NODE'
const fs = require("fs");
const path = require("path");
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
for (const name of process.env.PLUGIN_NAMES.split(" ").filter(Boolean)) {
  plugins[name] = { path: `${process.env.LOCAL_DIR}/${name}` };
}
data.enabled_plugins = plugins;
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
NODE
echo "cursor enabled_plugins -> $SETTINGS"
