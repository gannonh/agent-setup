import { STEPS, type Step } from "./targets.js";

export type ParsedArgs =
  | { kind: "help" }
  | { kind: "version" }
  | { kind: "error"; message: string }
  | { kind: "interactive" }
  | { kind: "install"; targets: Step[] };

export function parseArgs(argv: string[]): ParsedArgs {
  if (argv.length === 0) return { kind: "interactive" };

  let all = false;
  let help = false;
  let version = false;
  const selected = new Set<Step>();

  for (const arg of argv) {
    switch (arg) {
      case "-h":
      case "--help":
        help = true;
        break;
      case "-v":
      case "--version":
        version = true;
        break;
      case "--all":
        all = true;
        break;
      case "--claude":
        selected.add("claude");
        break;
      case "--codex":
        selected.add("codex");
        break;
      case "--cursor":
        selected.add("cursor");
        break;
      case "--pi":
        selected.add("pi-agents");
        selected.add("pi-extensions");
        break;
      case "--skills":
        selected.add("skills");
        break;
      default:
        return { kind: "error", message: `Unknown option: ${arg}` };
    }
  }

  if (help) return { kind: "help" };
  if (version) return { kind: "version" };
  if (all) return { kind: "install", targets: [...STEPS] };
  if (selected.size === 0) {
    return {
      kind: "error",
      message: "No targets selected. Pass --all, --claude, --codex, --cursor, --pi, --skills, or run with no flags.",
    };
  }

  return {
    kind: "install",
    targets: STEPS.filter((step) => selected.has(step)),
  };
}
