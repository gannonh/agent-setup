import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

export const HEARTBEAT_MS = 10_000;

export function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec}s`;
  if (sec === 0) return `${min}m`;
  return `${min}m ${sec}s`;
}

export async function runScript(opts: {
  packageRoot: string;
  scriptName: string;
  home: string;
  log?: (message: string) => void;
  now?: () => number;
  heartbeatMs?: number;
}): Promise<void> {
  const log = opts.log ?? ((message: string) => process.stdout.write(`${message}\n`));
  const now = opts.now ?? Date.now;
  const script = join(opts.packageRoot, "scripts", opts.scriptName);
  if (!existsSync(script)) {
    throw new Error(`missing script: ${script}`);
  }
  const start = now();
  const timer = setInterval(() => {
    log(`  still working... ${formatElapsed(now() - start)}`);
  }, opts.heartbeatMs ?? HEARTBEAT_MS);
  timer.unref();
  try {
    await spawnBash({ script, scriptName: opts.scriptName, cwd: opts.packageRoot, home: opts.home });
  } finally {
    clearInterval(timer);
  }
  log(`  done (${formatElapsed(now() - start)})`);
}

function spawnBash(opts: {
  script: string;
  scriptName: string;
  cwd: string;
  home: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("bash", [opts.script], {
      stdio: "inherit",
      cwd: opts.cwd,
      env: { ...process.env, HOME: opts.home },
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${opts.scriptName} exited ${code ?? 1}`));
    });
  });
}
