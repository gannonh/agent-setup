import { existsSync } from "node:fs";
import { join } from "node:path";
import { applyCopy, copyPlan, type Conflict, type CopyPlan, type CopyResult } from "./copy.js";
import type { Step } from "./targets.js";

export type InstallOpts = {
  targets: Step[];
  home: string;
  packageRoot: string;
  runScript: (scriptName: string) => void | Promise<void>;
  onConflict: (plan: CopyPlan) => Conflict | Promise<Conflict>;
  log?: (message: string) => void;
};

export async function install(opts: InstallOpts): Promise<void> {
  const log = opts.log ?? console.log;
  for (const target of opts.targets) {
    switch (target) {
      case "claude":
        log("Claude Code");
        log("  running install-pstack-claude.sh");
        await opts.runScript("install-pstack-claude.sh");
        await copyAsset({
          src: join(opts.packageRoot, ".claude", "CLAUDE.md"),
          dest: join(opts.home, ".claude", "CLAUDE.md"),
          onConflict: opts.onConflict,
          log,
        });
        break;
      case "codex":
        log("Codex");
        log("  running install-pstack-codex.sh");
        await opts.runScript("install-pstack-codex.sh");
        await copyAsset({
          src: join(opts.packageRoot, ".codex"),
          dest: join(opts.home, ".codex"),
          onConflict: opts.onConflict,
          log,
        });
        break;
      case "cursor":
        log("Cursor");
        log("  running install-pstack-cursor.sh");
        await opts.runScript("install-pstack-cursor.sh");
        await copyAsset({
          src: join(opts.packageRoot, ".cursor", "rules"),
          dest: join(opts.home, ".cursor", "rules"),
          onConflict: opts.onConflict,
          log,
        });
        break;
      case "pi-agents":
        log("Pi AGENTS.md");
        await copyAsset({
          src: join(opts.packageRoot, ".pi", "agent", "AGENTS.md"),
          dest: join(opts.home, ".pi", "agent", "AGENTS.md"),
          onConflict: opts.onConflict,
          log,
        });
        break;
      case "pi-extensions":
        log("Pi extensions (can take a few minutes)");
        log("  running install-pi-extensions.sh");
        await opts.runScript("install-pi-extensions.sh");
        break;
      case "skills":
        log("Skills");
        log("  running install-skills.sh");
        await opts.runScript("install-skills.sh");
        break;
      default: {
        const _exhaustive: never = target;
        throw new Error(`unknown target: ${_exhaustive}`);
      }
    }
  }
}

async function copyAsset(opts: {
  src: string;
  dest: string;
  onConflict: (plan: CopyPlan) => Conflict | Promise<Conflict>;
  log: (message: string) => void;
}): Promise<void> {
  const conflict: Conflict = existsSync(opts.dest)
    ? await opts.onConflict(copyPlan(opts.src, opts.dest))
    : "replace";
  const result: CopyResult = applyCopy(opts.src, opts.dest, conflict);
  opts.log(`  ${opts.dest} (${result})`);
}
