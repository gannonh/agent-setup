import * as readline from "node:readline/promises";
import type { Conflict, CopyPlan } from "./copy.js";

export type Prompter = {
  confirm: (label: string) => Promise<boolean>;
  conflict: (plan: CopyPlan) => Promise<Conflict>;
  close: () => void;
};

export function formatConflictHelp(plan: CopyPlan): string {
  if (plan.kind === "file") {
    return [
      `${plan.dest} already exists.`,
      "",
      `  replace  overwrite ${plan.dest} with this package's file`,
      `  append   add this package's content to the end of ${plan.dest}`,
      `  skip     leave ${plan.dest} unchanged`,
      "",
    ].join("\n");
  }

  const lines = [`${plan.dest} already exists.`, "", "This package would write:"];
  for (const file of plan.files) {
    const state = file.exists ? "exists" : "new";
    lines.push(`  ${file.rel}  (${state})`);
  }
  lines.push(
    "",
    `Other files in ${plan.dest} stay.`,
    "",
    "  replace  overwrite existing files listed above; copy new ones",
    "  append   add this package's content to the end of existing files; copy new ones",
    "  skip     write nothing",
    "",
  );
  return lines.join("\n");
}

export function createPrompter(
  input = process.stdin,
  output = process.stdout,
): Prompter {
  const rl = readline.createInterface({ input, output });
  return {
    async confirm(label) {
      const raw = (await rl.question(`${label} (Y/n) `)).trim().toLowerCase();
      if (raw === "") return true;
      return raw === "y" || raw === "yes";
    },
    async conflict(plan) {
      output.write(formatConflictHelp(plan));
      for (;;) {
        const raw = (await rl.question("[r]eplace, [a]ppend, [s]kip: ")).trim().toLowerCase();
        if (raw === "r" || raw === "replace") return "replace";
        if (raw === "a" || raw === "append") return "append";
        if (raw === "s" || raw === "skip") return "skip";
      }
    },
    close() {
      rl.close();
    },
  };
}
