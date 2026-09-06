# Dispatch reference

The operating contract as of 2026-09-06 sends every Linear Start through Eng OWN, including Agentis. Linear labels select Build execution. The former Gannon self-dispatch path is retired.

## Sources and precedence

Grok Bot's **dispatch-runtimes** skill owns runtime/model/effort validation and launch parameters. Open that skill in Grok Bot before dispatch. This repository documents the contract; it does not install a dispatch runtime or replace the skill.

The [shared lifecycle block](../blocks/lifecycle.md#start-and-build-dispatch) contains this repository's label groups, exact slug map, invalid-pair stop rule, OWN fields, and worktree contract. `blocks/build.sh` copies it into `.claude/CLAUDE.md`, `.codex/AGENTS.md`, and `.cursor/rules/lifecycle.mdc`. The model map appears only in that source block and its generated copies. pstack's per-role tables apply within a session, not to the Linear Build selection.

[Devops `docs/agent-worker.md`](https://github.com/gannonh/devops/blob/main/docs/agent-worker.md) owns worker setup and naming. The host copy inspected for this revision is `/home/gannonh/devops/agent-worker.md` on Sartre. The issue also references `/Volumes/EVO/dev/devops/docs/agent-worker.md` on Mini.

If the lifecycle snapshot and either canonical source disagree, stop and report the discrepancy. Do not infer a fallback from an example, a mock result, or a pstack role table.

## Where work runs

| Component | Responsibility and boundary |
| --- | --- |
| Linear | Spec, AC, status, and the `runtime`, `model`, and `model-effort` label groups. Start signals approved Build work. |
| Grok Bot computer | Program Manager board and Eng OWN coordination. No product clones and no Codex login. Its `ListMachines` inventory is separate from Cursor My Machines. |
| Cursor Cloud agents | A normal CloudAgent implements `runtime:cursor` with the mapped model and supported effort/reasoning. A thin Cloud Agent delegates `runtime:codex` implementation to `codex exec`. |
| Cursor managed VM | Default environment for normal Cursor CloudAgent work. Separate from owned hosts and their repo workers. |
| Sartre | Preferred Linux host for Codex and host-tool Builds. Cursor My Machines workers use the repo basename, such as `agentis`, `agent-setup`, or `open-pstack`. Checkouts are under `/home/gannonh/dev`. Each parallel ticket gets its own worktree and branch. |
| Mini | Local checkouts under `/Volumes/EVO/dev/…`. Mini Codex is reserved for Mac-only work through Eng OWN. Mini is not a fallback when Sartre is unavailable. |
| GitHub | Branches, commits, PRs, CI, and diff review. Linear remains the internal spec. |

For My Machines, the environment selector is `environment: { type: machine, name: <repo> }`. The `name` is the repo basename, not the hostname or Linear id. A named pool is another explicit dispatch target. Neither a pool nor a Grok Bot ListMachines result implies a particular My Machines worker. Follow `dispatch-runtimes` for the actual launch payload.

## Start through review

1. The Program Manager observes Start, moves the issue to In Progress, and sends Eng OWN. The brief includes the Linear id and URL, repo, spec and AC, branch, worktree, runtime, model, slug, effort, and applicable host target.
2. Eng validates labels and model effort support with `dispatch-runtimes`. Invalid or unavailable selections stop dispatch with the exact correction needed. There is no silent fallback.
3. Eng launches one implementing agent on a dedicated branch and worktree for that Linear id. Parallel Starts produce separate OWN briefs and worktrees even when the tickets use one repo worker.
4. For `runtime:codex`, a thin Cursor Cloud Agent on Sartre My Machines runs `codex exec` with the mapped model and effort. For `runtime:cursor`, the normal CloudAgent implements with its selected Cursor model and effort/reasoning. Mac-only Codex work follows the explicit Mini exception through Eng OWN.
5. The implementer pushes code and opens a PR naming the Linear id. The PR stays draft while the artifacts or diffs are not reviewable. Evidence goes back to Eng Manager, who owns the Agent Review and Human Review hops. A draft-only handoff stays draft and In Progress.
6. Agent Review handles CI and all review threads. Human Review pauses agent work unless a human resumes it. Only Linear Merging authorizes merge. Done means merged, then Verify confirms that the AC landed.

Open [dispatch-topology.html](dispatch-topology.html) locally in a browser to see the same flow. All captions, edges, and styles are embedded. Source links are optional and need a network connection.

## Evidence for this revision

- [KAT-3269](https://linear.app/kata-sh/issue/KAT-3269/revise-agent-setup) records the operating contract, the exact slugs, the host distinctions, and the live Agentis Gate 0 Start behavior. The Grok Bot skill itself was not available in the editing session; the embedded map is transcribed from this issue, with no additional compatibility matrix inferred.
- [KAT-3259](https://linear.app/kata-sh/issue/KAT-3259/dispatch-routing-mock-linear-labels-cursor-codex) records the completed mock matrix and its verification. The existing [mock artifacts](dispatch-mock/) and merged PRs [#10](https://github.com/gannonh/agent-setup/pull/10), [#11](https://github.com/gannonh/agent-setup/pull/11), [#12](https://github.com/gannonh/agent-setup/pull/12), [#13](https://github.com/gannonh/agent-setup/pull/13), [#14](https://github.com/gannonh/agent-setup/pull/14), [#15](https://github.com/gannonh/agent-setup/pull/15), [#16](https://github.com/gannonh/agent-setup/pull/16), [#17](https://github.com/gannonh/agent-setup/pull/17), and [#18](https://github.com/gannonh/agent-setup/pull/18) are historical evidence, not a new validation run or an exhaustive effort-support table.
- [KAT-3248](https://linear.app/kata-sh/issue/KAT-3248/update-blockslifecyclemd-with-linear-milestone-guidance) owns the existing milestone guidance, which this revision preserves.

This change is documentation and setup source only. It does not change Linear label definitions, install plugins, or modify personal Cursor or Codex configuration.
