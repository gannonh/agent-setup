# @gannonh/agent-setup

CLI that copies this repo's Codex, Cursor, and Pi configs into `$HOME` and runs the matching plugin/skill install scripts.

```
$ npx @gannonh/agent-setup --help
Install Codex, Cursor, and Pi agent configs, plugins, and skills.

Usage:
  npx @gannonh/agent-setup              Interactive
  npx @gannonh/agent-setup --all        Codex, Cursor, Pi, and skills
  npx @gannonh/agent-setup --codex      Codex only
  npx @gannonh/agent-setup --cursor     Cursor only
  npx @gannonh/agent-setup --pi         Pi AGENTS.md and extensions
```

Node 20+ on macOS or Linux. `npx` downloads the package, then the CLI writes under `$HOME` and runs bash scripts that call `codex`, `git`, `pi`, and `npx` for the targets you pick.

No flags: it asks Codex, Cursor, Pi AGENTS.md, Pi extensions, then Skills. Each prompt defaults to yes. Pi extensions are a separate prompt from AGENTS.md. If a dest already exists, it lists the files this package would write and asks replace (overwrite those files), append (add this package's content to the end of existing files), or skip.

## Flags

```
npx @gannonh/agent-setup --all
npx @gannonh/agent-setup --codex
npx @gannonh/agent-setup --cursor
npx @gannonh/agent-setup --pi
npx @gannonh/agent-setup --codex --cursor
```

`--all` installs Codex, Cursor, Pi AGENTS.md, Pi extensions, and skills. Target flags can be combined. `--pi` installs both Pi AGENTS.md and extensions. There is no `--skills` flag; use interactive or `--all`. Non-interactive flags replace files this package ships and leave other files in the dest directory. While a script runs, the CLI prints what it is doing and a heartbeat every 10s. Pi extensions often take a few minutes.

## What it writes

| Target | Script | Copy |
| --- | --- | --- |
| Codex | `scripts/install-pstack-codex.sh` (`codex plugin marketplace add` / `codex plugin add`) | `.codex` → `~/.codex` |
| Cursor | `scripts/install-pstack-cursor.sh` (sparse-clones `cursor/plugins` pstack into `~/.cursor/plugins/local/pstack`, sets `enabled_plugins.pstack` in `~/.cursor/settings.json`) | `.cursor/rules` → `~/.cursor/rules` |
| Pi AGENTS.md | none | `.pi/agent/AGENTS.md` → `~/.pi/agent/AGENTS.md` |
| Pi extensions | `scripts/install-pi-extensions.sh` (`pi install` for each extension) | none |
| Skills | `scripts/install-skills.sh` (`npx skills add ... --copy`) | none |

Replace overwrites the files this package ships. Append concatenates this package's content onto the existing file (or, for directories, onto matching files and copies files that are missing). Skip leaves the dest as-is.

## Undo

`scripts/remove-pstack-codex.sh` removes the Codex pstack plugin, marketplace entries, and leftover `config.toml` tables.

Copied files: delete `~/.codex`, `~/.cursor/rules`, `~/.pi/agent/AGENTS.md` (or the individual files you do not want). Cursor pstack: remove `enabled_plugins.pstack` from `~/.cursor/settings.json` and delete `~/.cursor/plugins/local/pstack`. Pi extensions and skills stay until you uninstall them with `pi` / `npx skills`.

## License

MIT
