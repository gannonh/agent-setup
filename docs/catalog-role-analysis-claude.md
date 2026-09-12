# pstack role analysis

Based on pstack 1.6.4 and CursorBench 4.0 (https://cursor.com/cursorbench, released 2026-09-10). Re-check both when either changes.

This document records where each pstack role is dispatched, how hard the work at that dispatch point is, and which cataloged `provider:model@effort` descriptor to assign. It does not change `~/.claude/pstack-models.md`; apply changes through `/setup-pstack`.

## Terms

- **Role.** A named job in the pstack sheet, such as `bug-fix` or `arena runners`. A pstack skill or playbook dispatches a role at a specific step.
- **Descriptor.** The value assigned to a role: `provider:model@effort`, for example `claude:fable@high`. It pins the subagent to that model and effort.
- **Lane.** One subagent launched for one role. A scalar role launches one lane. A panel role (`arena runners`, `architect runners`, `interrogate reviewers`, `arena cross-judge pool`) lists several descriptors and launches one lane per entry, all at once.
- **Native lane.** A lane whose provider is Claude, launched through Claude Code's own `Agent` tool. It inherits the session's tools, including MCP servers.
- **External lane.** A lane whose provider is Codex, Cursor, or Grok, launched through pstack's runner as a separate CLI process. It does not receive the session's MCP servers.
- **`inherit-parent` / `auto`.** A descriptor that names no model. See the section at the end.

## Constraints

- Each harness runs its own first-party models natively: Claude Code runs Fable and Opus, Codex runs Sol, Astra, Terra, and Luna, and Cursor runs Grok and Composer. Each subscription is most economical inside its own harness. Single-lane roles use the parent's first-party models. A frontier model from another provider runs as an external lane through that provider's CLI, so it bills to that provider's subscription, and only where the difficulty or the need for diversity justifies it.
- Cursor also serves Claude and OpenAI models (`cursor:claude-fable-5-1`, `cursor:gpt-5.6-sol`, and so on). Those are not used here: the same model is cheaper through its own harness.
- Why and Reflect roles need the parent's MCP surface. A subagent inherits it from its parent, so those roles use `inherit-parent`. External runner lanes do not receive it.
- `claude:fable` and `claude:opus` are rolling aliases. The revision they serve is execution evidence, not catalog data; a probe receipt's `reportedModel` shows it. The benchmark rows below are for Fable 5.1 and Opus 5.
- Every Fable and Opus lane, native or external, draws on the Claude subscription's usage limit. When that limit is reached, all of them fail at once, on every harness. The same applies to Grok and Composer lanes against the Cursor subscription, and Sol, Astra, Terra, and Luna lanes against the Codex subscription.

## CursorBench 4.0

Long-horizon tasks from real Cursor sessions in six categories: edit, refactor, investigation, intent understanding, managing jobs, design adherence. Cost per task applies each model's published per-token pricing to the tokens it used. Cursor notes small score differences may not be statistically meaningful. GPT-6 Astra is not on the leaderboard.

| Model @ effort | Score | Cost / task | Tokens / task | Steps / task |
|---|---|---|---|---|
| Fable 5.1 @ max | 51.8% | $17.28 | 117,236 | 128 |
| Fable 5.1 @ xhigh | 51.6% | $13.01 | 87,294 | 101 |
| Fable 5.1 @ high | 49.2% | $9.08 | 58,438 | 77 |
| Fable 5.1 @ medium | 46.8% | $7.05 | 45,411 | 63 |
| Opus 5 @ max | 46.6% | $11.95 | 85,384 | 106 |
| Opus 5 @ xhigh | 46.1% | $11.43 | 80,094 | 103 |
| Fable 5.1 @ low | 45.1% | $5.44 | 34,795 | 51 |
| Opus 5 @ high | 44.7% | $9.00 | 61,405 | 86 |
| Opus 5 @ medium | 43.3% | $6.94 | 45,272 | 72 |
| GPT-5.6 Sol @ max | 41.7% | $8.23 | 42,944 | 99 |
| Grok 4.6 @ xhigh | 41.4% | $6.10 | 49,814 | 56 |
| GPT-5.6 Terra @ max | 41.3% | $5.14 | 60,814 | 107 |
| Opus 5 @ low | 40.7% | $4.87 | 31,995 | 57 |
| Grok 4.6 @ high | 40.4% | $5.20 | 41,387 | 48 |
| GPT-5.6 Sol @ xhigh | 37.7% | $4.40 | 24,729 | 55 |
| Grok 4.6 @ medium | 36.1% | $3.48 | 24,893 | 40 |
| GPT-5.6 Luna @ max | 35.9% | $1.03 | 87,284 | 208 |
| GPT-5.6 Sol @ high | 35.7% | $2.85 | 16,174 | 41 |
| GPT-5.6 Terra @ xhigh | 33.6% | $1.81 | 23,436 | 43 |
| Composer 2.5 | 27.7% | $0.68 | 17,347 | 41 |

### Findings

1. Fable 5.1 dominates on score per dollar at every tier. Fable @ low beats Grok @ xhigh, Sol @ max, and Opus @ low. Fable @ medium beats Opus @ max at 60% of the cost.
2. Opus 5 costs about the same per task as Fable 5.1 at each tier and scores 4 to 5 points lower. Switching to Opus at the same tier saves under a dollar per task. Opus has no score-per-dollar role on a Claude parent; it serves only as a second Claude lane in panels.
3. Fable @ xhigh is the practical ceiling. Max adds 0.2 points for $4.27 more per task, inside the stated variance.
4. Cost is driven by effort tier and fan-out count, not by model choice. Fable @ low is a third the cost of @ max. A four-lane panel at xhigh is about $40 per run regardless of model. Swarm's ten-lane verification is the largest single cost.
5. Grok 4.6's value position from CursorBench 3.2 does not hold on 4.0. It is rank 12 and dominated by Fable @ low. Its remaining use is provider diversity.
6. The cheapest defensible verification lanes are off-native: Sol @ high ($2.85) and Luna @ max ($1.03). Excluded here by the native-only constraint.

## Where each role is dispatched

A role is used only when a pstack skill or playbook reaches the step that names it. `poteto-mode` matches non-trivial tasks to a playbook.

| Role | Dispatch point |
|---|---|
| feature, refactoring | Feature playbook step 4: code-writing handoff. Refactoring playbook step 5: mechanical edits after the parent pins the contract and names the target shape. Both `isolated-write` in a dedicated worktree with a specific scope; the parent reviews the diff. |
| bug-fix | Bug fix playbook step 3: fix handoff after the parent has reproduced and root-caused. |
| perf-issue | Perf issue playbook step 3: fix handoff after the trace is captured. |
| hillclimb | Hillclimb playbook step 5: one hypothesis per lane per iteration, own worktree; parent owns metric, harness, and keep/revert. |
| judgment and prose | Multi-phase plan playbook step 3: read-only exploration subagents that return file pointers. Only dispatch site. |
| hardest tasks | None. Present in `role-defaults.json` only. |
| how explorer | `how` skill, complex questions: 2 to 4 read-only explorers in parallel. |
| how explainer | `how` skill: single-pass explain for simple questions; synthesis lane for complex ones. |
| why investigators | `why` skill: one investigator per evidence category with an MCP. |
| why synthesizer | `why` skill final step. |
| reflect tooling | `reflect` skill tooling reviewer. |
| reflect judgment, divergent, synthesizer | `reflect` skill judgment reviewer, divergent reviewer, synthesizer. |
| arena runners | `arena` Phase B: one candidate per lane. Also Eval playbook. |
| arena cross-judge pool | `arena` Phase C: one read-only judge from a provider other than the parent and the base candidate. |
| architect runners | `architect` Phase B runs `arena` with these lanes. |
| interrogate reviewers | `interrogate` skill: one adversarial reviewer per lane. |
| swarm workers | `swarm` skill default worker. Also Autopilot full/stack merge-ready verification and the multi-phase plan's ten-lane live verification. |

## Recommendations

Difficulty is 1 (easy) to 5 (hard) for the work the lane does at its dispatch point. It is the same on every harness. "Full" is the recommended sheet. "Lean" cuts cost per lane and drops one panel lane.

Each harness gets its own sheet because the set of native offerings differs, and the cross-judge pool must contain a provider other than the parent's.

| | Claude Code parent | Cursor parent | Codex parent |
|---|---|---|---|
| Native offerings | `claude:fable`, `claude:opus` (and their `[1m]` variants) | `cursor:claude-fable-5-1`, `cursor:claude-fable-5-1-thinking`, `cursor:claude-opus-5` (low to high only), `cursor:cursor-grok-4.6` (no max), `cursor:gpt-5.6-sol`, `cursor:gpt-5.6-terra`, `cursor:gpt-5.6-luna` | `codex:gpt-5.6-sol`, `codex:gpt-6-astra`, `codex:gpt-5.6-terra`, `codex:gpt-5.6-luna` |
| Native primitive | `Agent` with a `pstack-<stem>-<effort>` definition | `Task` with `model` set to the mapped slug, when that slug is on the session's allowlist; otherwise the runner's `cursor-agent` path | `spawn_agent` with `model` and `reasoning_effort`; needs `[features] multi_agent = true` |
| Served-model evidence | Native lane transcript | None from `Task`; recorded as `pinned-dispatch`, which panel synthesis counts as a dropout. The runner's `cursor-agent` path does report the model | None; `pinned-argv` is accepted as complete |
| Top native model on CursorBench 4.0 | Fable 5.1 (51.8%) | Fable 5.1 (51.8%) | Sol @ max (41.7%). Fable is available only as an external lane through the Claude CLI |
| `inherit-parent` resolves to | The session's `/model` choice | The model selected in the Cursor session | The Codex session's model |
| First-party models | Fable, Opus | Grok 4.6, Composer 2.5 | Sol, Astra, Terra, Luna |
| Fable lanes bill to | Claude subscription (native) | Claude subscription (external) | Claude subscription (external) |

### Claude Code parent

| Role | Difficulty | Full | Lean |
|---|---|---|---|
| feature, refactoring | 3 | `claude:fable@high` | `claude:fable@medium` |
| bug-fix | 3 | `claude:fable@high` | `claude:fable@medium` |
| perf-issue | 3 | `claude:fable@high` | `claude:fable@medium` |
| hillclimb | 2 | `claude:fable@low` | `claude:fable@low` |
| judgment and prose | 3 | `claude:fable@medium` | `claude:fable@medium` |
| hardest tasks | 5 | `claude:fable@xhigh` | `claude:fable@high` |
| how explorer | 2 | `claude:fable@low` | `claude:fable@low` |
| how explainer | 3 | `claude:fable@high` | `claude:fable@medium` |
| why investigators | 2 | `inherit-parent` | `inherit-parent` |
| why synthesizer | 3 | `inherit-parent` | `inherit-parent` |
| reflect tooling | 2 | `inherit-parent` | `inherit-parent` |
| reflect judgment, divergent, synthesizer | 3 | `inherit-parent` | `inherit-parent` |
| swarm workers | 2 | `claude:fable@low` | `claude:fable@low` |
| arena runners | 4 | `claude:fable@xhigh, claude:opus@xhigh, codex:gpt-5.6-sol@max, cursor:cursor-grok-4.6@xhigh` | `claude:fable@high, codex:gpt-5.6-sol@max, cursor:cursor-grok-4.6@xhigh` |
| arena cross-judge pool | 4 | same as arena runners | same as arena runners |
| architect runners | 4 | same as arena runners | same as arena runners |
| interrogate reviewers | 4 | same as arena runners | same as arena runners |

### Rationale by tier

- `low`: narrow read-only work or work the parent verifies mechanically. Hillclimb reverts bad hypotheses by measurement; explorers cover one angle each; swarm workers run ten at once.
- `medium`: read-only exploration for planning, and the lean tier for implementation and synthesis. Still above Opus @ max.
- `high`: bounded implementation with a named scope, and explanatory synthesis.
- `inherit-parent`: the four Why and Reflect roles. They need the session's MCP servers, and the alias gives them at the session's model and effort. Their difficulty ratings (2 for investigators and the tooling reviewer, 3 for the synthesizers and judgment reviewer) describe the work; they do not set a tier, because the session does.
- `xhigh`: panel candidates and the unused `hardest tasks` role. Max is not worth its increment.
- Panels keep Sol and Grok despite lower scores because `arena`, `architect`, and `interrogate` depend on independent providers, and the cross-judge pool must offer a provider other than the parent. Opus is dropped from the lean panel because it adds no diversity over Fable.

### Cursor parent

Cursor's first-party models are Grok 4.6 and Composer 2.5. Grok 4.6 tops out at `xhigh` (41.4%, $6.10); there is no `max`. Composer 2.5 scores 27.7% at $0.68 and is not in the pstack catalog; add it with `pstack-models add cursor:composer-2.5` before a sheet can name it. The CursorBench costs are API list prices; through the Cursor subscription both models cost less than those figures, which is the reason for using them.

Difficulty 1 to 3 roles run on Grok. Difficulty 4 and 5 roles bring in Fable through the Claude CLI, where it bills to the Claude subscription, and Sol through the Codex CLI for the same reason.

| Role | Difficulty | Full | Lean |
|---|---|---|---|
| feature, refactoring | 3 | `cursor:cursor-grok-4.6@xhigh` | `cursor:cursor-grok-4.6@high` |
| bug-fix | 3 | `cursor:cursor-grok-4.6@xhigh` | `cursor:cursor-grok-4.6@high` |
| perf-issue | 3 | `cursor:cursor-grok-4.6@xhigh` | `cursor:cursor-grok-4.6@high` |
| hillclimb | 2 | `cursor:cursor-grok-4.6@medium` | `cursor:cursor-grok-4.6@low` |
| judgment and prose | 3 | `cursor:cursor-grok-4.6@high` | `cursor:cursor-grok-4.6@medium` |
| hardest tasks | 5 | `claude:fable@xhigh` | `cursor:cursor-grok-4.6@xhigh` |
| how explorer | 2 | `cursor:cursor-grok-4.6@medium` | `cursor:cursor-grok-4.6@low` |
| how explainer | 3 | `cursor:cursor-grok-4.6@xhigh` | `cursor:cursor-grok-4.6@high` |
| why investigators | 2 | `inherit-parent` | `inherit-parent` |
| why synthesizer | 3 | `inherit-parent` | `inherit-parent` |
| reflect tooling | 2 | `inherit-parent` | `inherit-parent` |
| reflect judgment, divergent, synthesizer | 3 | `inherit-parent` | `inherit-parent` |
| swarm workers | 2 | `cursor:cursor-grok-4.6@medium` | `cursor:composer-2.5` once cataloged, otherwise `cursor:cursor-grok-4.6@low` |
| arena runners | 4 | `cursor:cursor-grok-4.6@xhigh, claude:fable@xhigh, codex:gpt-5.6-sol@max, claude:opus@xhigh` | `cursor:cursor-grok-4.6@xhigh, claude:fable@high, codex:gpt-5.6-sol@max` |
| arena cross-judge pool | 4 | same as arena runners | same as arena runners |
| architect runners | 4 | same as arena runners | same as arena runners |
| interrogate reviewers | 4 | same as arena runners | same as arena runners |

Panel notes for Cursor:

- Grok holds the first-party lane in every panel. The remaining lanes are the frontier models from the other two subscriptions, each through its own CLI. Every `cursor:*` lane counts as the parent's provider, so those external lanes are also what makes the cross-judge pool valid.
- `hardest tasks` is the one single-lane role that leaves Grok. It has no dispatch site in pstack 1.6.4, so the choice has no effect today.
- Composer 2.5 fits only work the parent verifies mechanically, such as swarm verification lanes. At 27.7% it is not a candidate for implementation or synthesis.
- Native `Task` lanes carry no served-model evidence in CLI 2026.09.02, and panel synthesis treats them as dropouts. Until Cursor exposes the served model, a panel on a Cursor parent gets verified results only from its external lanes and from `cursor:*` lanes that fell through to the runner's `cursor-agent` path. See the gaps below.

### Codex parent

Codex is the only parent whose native offerings do not include Fable or Opus. The native ceiling on CursorBench 4.0 is Sol @ max (41.7%, $8.23) and Terra @ max (41.3%, $5.14). GPT-6 Astra is not on CursorBench; on Artificial Analysis's Coding Agent Index it ties Fable 5.1 at 62, leads Sol on Terminal-Bench v4 (56% vs 37%), trails Sol on DeepSWE (68% vs 72%), and costs $7.09 per task at max. The table uses Astra where general capability matters, Sol where the work resembles DeepSWE (a fix against a known failure), and Terra or Luna where cost matters. Fable appears only in panels, as an external lane through the Claude CLI; it loses MCP access and bills to the Claude usage limit.

Native Codex lanes require `[features] multi_agent = true` in the Codex config. Without it every native lane is a dropout.

| Role | Difficulty | Full | Lean |
|---|---|---|---|
| feature, refactoring | 3 | `codex:gpt-6-astra@high` | `codex:gpt-5.6-terra@max` |
| bug-fix | 3 | `codex:gpt-5.6-sol@max` | `codex:gpt-5.6-sol@xhigh` |
| perf-issue | 3 | `codex:gpt-5.6-sol@max` | `codex:gpt-5.6-sol@xhigh` |
| hillclimb | 2 | `codex:gpt-5.6-sol@xhigh` | `codex:gpt-5.6-luna@max` |
| judgment and prose | 3 | `codex:gpt-6-astra@medium` | `codex:gpt-5.6-terra@xhigh` |
| hardest tasks | 5 | `codex:gpt-6-astra@max` | `codex:gpt-6-astra@xhigh` |
| how explorer | 2 | `codex:gpt-5.6-sol@high` | `codex:gpt-5.6-luna@max` |
| how explainer | 3 | `codex:gpt-6-astra@high` | `codex:gpt-5.6-sol@xhigh` |
| why investigators | 2 | `inherit-parent` | `inherit-parent` |
| why synthesizer | 3 | `inherit-parent` | `inherit-parent` |
| reflect tooling | 2 | `inherit-parent` | `inherit-parent` |
| reflect judgment, divergent, synthesizer | 3 | `inherit-parent` | `inherit-parent` |
| swarm workers | 2 | `codex:gpt-5.6-sol@high` | `codex:gpt-5.6-luna@max` |
| arena runners | 4 | `codex:gpt-6-astra@xhigh, codex:gpt-5.6-sol@max, claude:fable@xhigh, cursor:cursor-grok-4.6@xhigh` | `codex:gpt-6-astra@xhigh, codex:gpt-5.6-sol@max, claude:fable@high` |
| arena cross-judge pool | 4 | same as arena runners | same as arena runners |
| architect runners | 4 | same as arena runners | same as arena runners |
| interrogate reviewers | 4 | same as arena runners | same as arena runners |

Panel notes for Codex:

- The cross-judge pool needs a non-Codex entry. `claude:fable` is the strongest judge available and runs externally through the Claude CLI.
- Astra's effort scale runs to `ultra`. Nothing here uses it; no benchmark evidence exists for the increment over `max`.
- Effort names are not comparable across providers. Sol @ high ($2.85) and Fable @ low ($5.44) are both entry tiers, but they are 10 points apart on CursorBench.

### Gaps in pstack 1.6.4

- `hardest tasks` has no dispatch site, so its value has no effect on any harness.
- Native Cursor `Task` lanes expose no served model, and panel synthesis counts them as dropouts. On a Cursor parent this makes native panel lanes unverifiable by design. The runner's `cursor-agent` path does report the model, so routing Cursor panel lanes through the runner would give verified results at the cost of a second CLI startup.
- Native Codex lanes report no served model either, but `pinned-argv` is accepted as complete. The two harnesses treat the same evidence gap differently.
- The catalog's `defaultEffort` for `codex:gpt-6-astra` is `medium`, while every other frontier offering defaults to `max` or `xhigh`. That default sets what an operator gets from an empty effort input in `/setup-pstack`.

## `inherit-parent`

For each role, the subagent is dispatched with the model and effort in its descriptor. `inherit-parent` (alias `auto`) means no model is defined, so the subagent uses the model of its parent, the Claude Code session.

This document keeps it for the four Why and Reflect roles. They need MCP servers, and a subagent inherits them from its parent. Those roles therefore run at whatever model and effort the session is set to, and their cost follows that setting.

A named `claude:*` descriptor also inherits MCP servers. Use one instead if a Why or Reflect role should run at a fixed tier regardless of the session.

In a panel, `inherit-parent` counts as one Claude lane and reduces provider diversity.
