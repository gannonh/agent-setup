export const STEPS = ["codex", "cursor", "pi-agents", "pi-extensions", "skills"] as const;

export type Step = (typeof STEPS)[number];
