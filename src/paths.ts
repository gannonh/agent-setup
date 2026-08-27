import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_NAME = "@gannonh/agent-setup";

export function findPackageRoot(
  start = fileURLToPath(new URL(".", import.meta.url)),
): string {
  let dir = start;
  for (;;) {
    const pkgPath = join(dir, "package.json");
    if (existsSync(pkgPath)) {
      const raw: unknown = JSON.parse(readFileSync(pkgPath, "utf8"));
      if (isPackageName(raw, PACKAGE_NAME)) return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(`could not find ${PACKAGE_NAME} package root`);
    }
    dir = parent;
  }
}

function isPackageName(raw: unknown, name: string): boolean {
  return (
    typeof raw === "object" &&
    raw !== null &&
    "name" in raw &&
    raw.name === name
  );
}
