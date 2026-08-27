import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative } from "node:path";

export type Conflict = "replace" | "append" | "skip";

export type CopyResult = "copied" | "replaced" | "appended" | "skipped";

export type CopyFilePlan = {
  rel: string;
  dest: string;
  exists: boolean;
};

export type CopyPlan =
  | { kind: "file"; dest: string; files: [CopyFilePlan] }
  | { kind: "directory"; dest: string; files: CopyFilePlan[] };

export function copyPlan(src: string, dest: string): CopyPlan {
  if (!existsSync(src)) {
    throw new Error(`missing source: ${src}`);
  }
  const srcStat = statSync(src);
  if (srcStat.isFile()) {
    return {
      kind: "file",
      dest,
      files: [{ rel: basename(src), dest, exists: existsSync(dest) && statSync(dest).isFile() }],
    };
  }
  if (!srcStat.isDirectory()) {
    throw new Error(`source is not a file or directory: ${src}`);
  }
  return {
    kind: "directory",
    dest,
    files: walkFiles(src).map((file) => {
      const destFile = join(dest, file.rel);
      return {
        rel: file.rel,
        dest: destFile,
        exists: existsSync(destFile),
      };
    }),
  };
}

export function applyCopy(src: string, dest: string, conflict: Conflict): CopyResult {
  if (!existsSync(src)) {
    throw new Error(`missing source: ${src}`);
  }
  const srcStat = statSync(src);
  if (srcStat.isDirectory()) return applyCopyDir(src, dest, conflict);
  if (srcStat.isFile()) return applyCopyFile(src, dest, conflict);
  throw new Error(`source is not a file or directory: ${src}`);
}

function applyCopyFile(src: string, dest: string, conflict: Conflict): CopyResult {
  if (!existsSync(dest)) {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    return "copied";
  }
  if (statSync(dest).isDirectory()) {
    throw new Error(`destination is a directory: ${dest}`);
  }
  if (conflict === "skip") return "skipped";
  if (conflict === "replace") {
    copyFileSync(src, dest);
    return "replaced";
  }
  writeFileSync(dest, joinContents(readFileSync(dest), readFileSync(src)));
  return "appended";
}

function applyCopyDir(srcDir: string, destDir: string, conflict: Conflict): CopyResult {
  if (!existsSync(destDir)) {
    cpSync(srcDir, destDir, { recursive: true });
    return "copied";
  }

  if (!statSync(destDir).isDirectory()) {
    throw new Error(`destination is not a directory: ${destDir}`);
  }

  if (conflict === "skip") return "skipped";

  for (const file of walkFiles(srcDir)) {
    const dest = join(destDir, file.rel);
    mkdirSync(dirname(dest), { recursive: true });
    if (!existsSync(dest) || conflict === "replace") {
      copyFileSync(file.abs, dest);
      continue;
    }
    writeFileSync(dest, joinContents(readFileSync(dest), readFileSync(file.abs)));
  }

  return conflict === "replace" ? "replaced" : "appended";
}

function walkFiles(dir: string, base = dir): { rel: string; abs: string }[] {
  const out: { rel: string; abs: string }[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(abs, base));
      continue;
    }
    out.push({ rel: relative(base, abs), abs });
  }
  return out;
}

export function joinContents(prev: Buffer, next: Buffer): Buffer {
  const a = prev.toString("utf8");
  const b = next.toString("utf8");
  const sep = a.length === 0 || a.endsWith("\n") ? "" : "\n";
  return Buffer.from(a + sep + b);
}
