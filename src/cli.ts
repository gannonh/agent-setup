#!/usr/bin/env node
import { readFileSync } from "node:fs";
import os from "node:os";
import { join } from "node:path";
import { parseArgs } from "./args.js";
import { install } from "./install.js";
import { findPackageRoot } from "./paths.js";
import { createPrompter } from "./prompt.js";
import { runScript as spawnInstallScript } from "./run-script.js";
import type { Step } from "./targets.js";

export const HELP = `Install Codex, Cursor, and Pi agent configs, plugins, and skills.

Usage:
  npx @gannonh/agent-setup              Interactive
  npx @gannonh/agent-setup --all        Codex, Cursor, Pi, and skills
  npx @gannonh/agent-setup --codex      Codex only
  npx @gannonh/agent-setup --cursor     Cursor only
  npx @gannonh/agent-setup --pi         Pi AGENTS.md and extensions

Flags can be combined: --codex --cursor

Codex   install-pstack-codex.sh, then copy .codex to ~/.codex
Cursor  install-pstack-cursor.sh, then copy .cursor/rules to ~/.cursor/rules
Pi      interactive asks AGENTS.md and extensions separately
        --pi copies ~/.pi/agent/AGENTS.md and installs extensions
Skills  install-skills.sh (interactive and --all)

Existing dest files: interactive lists the files this package would write, then asks replace (overwrite those files), append (add this package's content to the end), or skip.
Non-interactive flags replace files this package ships and leave other files in place.
Scripts print progress. Pi extensions can take a few minutes; a heartbeat prints every 10s.

Options:
  --all          Install everything
  --codex        Codex pstack plugin and ~/.codex
  --cursor       Cursor pstack plugin and ~/.cursor/rules
  --pi           ~/.pi/agent/AGENTS.md and Pi extensions
  -h, --help     Show this help
  -v, --version  Print version
`;

async function main(): Promise<void> {
  if (process.platform === "win32") {
    throw new Error("agent-setup requires macOS or Linux");
  }

  const parsed = parseArgs(process.argv.slice(2));
  const packageRoot = findPackageRoot();
  const version = packageVersion(packageRoot);

  switch (parsed.kind) {
    case "help":
      process.stdout.write(HELP);
      return;
    case "version":
      process.stdout.write(`${version}\n`);
      return;
    case "error":
      process.stderr.write(`${parsed.message}\nSee --help.\n`);
      process.exitCode = 1;
      return;
    case "interactive":
      await runInteractive(packageRoot);
      return;
    case "install":
      await runInstall(parsed.targets, packageRoot);
      return;
    default: {
      const _exhaustive: never = parsed;
      throw new Error(`unhandled args: ${_exhaustive}`);
    }
  }
}

async function runInstall(targets: Step[], packageRoot: string): Promise<void> {
  const home = os.homedir();
  const log = (message: string) => {
    process.stdout.write(`${message}\n`);
  };
  await install({
    targets,
    home,
    packageRoot,
    log,
    runScript: (scriptName) =>
      spawnInstallScript({
        packageRoot,
        scriptName,
        home,
        cwd: process.cwd(),
        log,
      }),
    onConflict: () => "replace",
  });
}

async function runInteractive(packageRoot: string): Promise<void> {
  if (!process.stdin.isTTY) {
    throw new Error("No TTY. Pass --all, --codex, --cursor, or --pi.");
  }

  const prompter = createPrompter();
  try {
    const targets: Step[] = [];
    if (await prompter.confirm("Codex (pstack plugin + ~/.codex)")) targets.push("codex");
    if (await prompter.confirm("Cursor (pstack plugin + ~/.cursor/rules)")) {
      targets.push("cursor");
    }
    if (await prompter.confirm("Pi AGENTS.md (~/.pi/agent/AGENTS.md)")) targets.push("pi-agents");
    if (await prompter.confirm("Pi extensions (can take a few minutes)")) {
      targets.push("pi-extensions");
    }
    if (await prompter.confirm("Skills")) targets.push("skills");

    if (targets.length === 0) {
      process.stdout.write("Nothing selected.\n");
      return;
    }

    const home = os.homedir();
    const log = (message: string) => {
      process.stdout.write(`${message}\n`);
    };
    await install({
      targets,
      home,
      packageRoot,
      log,
      runScript: (scriptName) =>
        spawnInstallScript({
          packageRoot,
          scriptName,
          home,
          cwd: process.cwd(),
          log,
        }),
      onConflict: (plan) => prompter.conflict(plan),
    });
  } finally {
    prompter.close();
  }
}

function packageVersion(packageRoot: string): string {
  const raw: unknown = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
  if (typeof raw === "object" && raw !== null && "version" in raw && typeof raw.version === "string") {
    return raw.version;
  }
  throw new Error("package.json is missing version");
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
