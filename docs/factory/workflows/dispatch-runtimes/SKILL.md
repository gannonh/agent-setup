---
name: Dispatch runtimes
description: >-
  use this when choosing Codex vs Cursor vs Claude CLI, picking a model, or launching planning
  or implementation work for Gannon's product repos
---
# Dispatch runtimes

You are management. Do not implement on the Grok Bot computer. Pick one runtime, launch it, own it until the result or an approval ask.

Every dispatched agent runs `/poteto-mode`. Put that in the prompt for Codex and for Cursor. No exceptions. Do not re-teach pstack models in the brief. They already come from the files below.

## Where pstack lives

**Cursor** (local and Cursor cloud runs): `/Users/gannonhall/.cursor/rules/pstack-models.mdc`

**Codex** (Mini): plugin `pstack-codex@codex-plugins` from `/Volumes/EVO/dev/codex-plugins/pstack-codex`, plus `/Users/gannonhall/.codex/AGENTS.md` (the `pstack:models` block).

## Linear labels (ticket override)

On Start / Eng OWN-start, **read Linear labels first**. Kata-sh groups: `runtime`, `model`, `model-effort` (Linear reserves the name `effort`), optional `environment`.

### Runtime (`runtime` group)

| Label | Meaning |
| --- | --- |
| `cursor` | Cursor Cloud Agent. Default when no runtime label. |
| `codex` | ChatGPT/Codex sub via CLI. Thin Cloud Agent on My Machines runs `codex exec` — does **not** implement with a Cursor model. |
| `claude` | Claude Code CLI via thin Cloud Agent on Sartre/Mini — does **not** implement with a Cursor model. |

### Model (`model` group) → canonical slug

| Label | Slug | Allowed runtimes | CloudAgent param family |
| --- | --- | --- | --- |
| `sol` | `gpt-5.6-sol` | cursor, codex | `reasoning` |
| `astra` | `gpt-6-astra` | **codex only** | CLI `-c model_reasoning_effort` |
| `terra` | `gpt-5.6-terra` | cursor, codex | `reasoning` |
| `luna` | `gpt-5.6-luna` | cursor, codex | `reasoning` |
| `fable` | `claude-fable-5-1` (Cursor) / CLI alias `sonnet` | cursor, **claude** | `effort` |
| `opus` | `claude-opus-5` (Cursor) / CLI alias `opus` | cursor, **claude** | `effort` |
| `grok` | `grok-4.6` | **cursor only** | `effort` |
| `composer` | `composer-2.5` | **cursor only** | none (optional `fast`) |

### Effort (`model-effort` group)

Labels: `low` | `medium` | `high` | `xhigh` | `max`.

Map onto the model’s param family from the table above:

- **effort family** (fable, opus, grok): `model_params.effort`
- **reasoning family** (sol, terra, luna): `model_params.reasoning`
- **codex CLI**: `-c model_reasoning_effort="<label>"`
- **composer**: ignore effort label unless Gannon asked for `fast`

Default when no `model-effort` label: `xhigh` (omit for composer if labeled).

### Environment (`environment` group) — optional override

Most tickets leave this unset. When set, it **forces where** the agent runs (after runtime/model are chosen). When unset, use standing host routing below (discretionary flexibility is fine).

| Label | Meaning |
| --- | --- |
| `cloud-vm` | Cursor-managed Linux VM — omit CloudAgent `environment` or `{ "type": "cloud" }` |
| `sartre` | Sartre My Machines — `{ "type": "machine", "name": "<repo-basename>" }` |
| `mini` | Mac Mini — Mini Codex (or Mini My Machines only if workers confirmed up) |

**Conflicts:** `environment:cloud-vm` with `runtime:codex` or `runtime:claude` is invalid (CLI runtimes need a host) — stop and comment. `environment:mini` with pure Linux-only work is allowed only if Gannon labeled it; do not invent Mini.

**Invalid pairs** (examples: `codex`+`fable`, `codex`+`opus`, `codex`+`grok`, `codex`+`composer`, `codex`+`cloud-vm`, `claude`+`grok`, `claude`+`sol`, `claude`+`composer`, `claude`+`astra`, `claude`+`cloud-vm`): stop, comment on the Linear issue, do not silent-fallback.

OWN start brief always includes: `runtime=… model=… slug=… effort=…` and `environment=…` when labeled (else `environment=default`).

### `runtime:codex` launch

1. CloudAgent with `environment: { "type": "machine", "name": "<repo-basename>" }` (sartre worker), unless `environment:mini` → Mini Codex path instead.
2. Prompt: thin wrapper only — run `codex exec` on the checkout; do not implement as the Cursor agent.
3. Command shape on sartre:

```
codex exec -m <slug> -c model_reasoning_effort="<effort>" -C ~/dev/<repo> --approve-for-me "/poteto-mode
<task>"
```

4. Mini Shell + `codex exec` for `environment:mini` or Mac-only work (TCC, Cua, keyring) when no Mac pool.

### `runtime:claude` launch

Same host rules as Codex CLI: **requires** `environment:sartre` or `environment:mini` (never cloud-vm). Thin Cloud Agent (or Mini Shell) only wraps Claude Code CLI — does not implement as the Cursor agent.

Proven on Sartre dry-run KAT-3303 (2026-09-08): binary `/home/gannonh/.local/bin/claude` (mise → Claude Code `2.1.263`); alias `opus` → `claude-opus-5`; `--effort` accepts `low|medium|high|xhigh|max`.

1. Sartre: CloudAgent `environment: { "type": "machine", "name": "<repo-basename>" }`. Mini: Mini Shell / local Claude Code on the checkout.
2. Model labels: `fable` → CLI alias `sonnet`; `opus` → CLI alias `opus`. Absent model → `sonnet`. Pass `--effort <label>` from `model-effort` (default `xhigh`). Do **not** use Cursor `model_params` on this path.
3. **Working command shape** (headless `-p` / print mode). Write the `/poteto-mode` + task prompt to a temp file; feed on **stdin**. Pass `--allowedTools` as **one** comma-separated string (never a trailing positional after a variadic flag — it swallows the prompt).

```
# Prefer absolute path. On Sartre interactive shells, bare `claude` may alias to
# `claude --allow-dangerously-skip-permissions` and bypass --permission-mode.
PROMPT=/tmp/claude-dispatch-$$.txt
cat > "$PROMPT" <<'EOF'
/poteto-mode
<task>
EOF
cd ~/dev/<repo>   # Mini: /Volumes/EVO/dev/<repo>
/home/gannonh/.local/bin/claude -p \
  --model <cli-alias> \
  --effort <effort> \
  --permission-mode acceptEdits \
  --allowedTools "mcp__claude_ai_Linear__get_issue,mcp__claude_ai_Linear__save_comment,Bash(git *),Read(/home/gannonh/.claude/**)" \
  < "$PROMPT"
```

4. **Allowlist rules (from dry-run):**
   - `acceptEdits` alone does **not** grant MCP or skill file reads in `-p` mode — always pass `--allowedTools`.
   - Linear comments/status: allow `mcp__claude_ai_Linear__get_issue` and `mcp__claude_ai_Linear__save_comment` (plus other Linear MCP tools the task needs).
   - Bash patterns are literal-prefix: use `Bash(git *)` not only `Bash(git rev-parse *)` if the agent may pass `-C` or other flags. Prefer one simple command per Bash call (compound `&&` / `|` is permission-checked per segment).
   - If skills resolve under `~/.claude/`, allow `Read(/home/gannonh/.claude/**)`.
5. Prompt starts with `/poteto-mode`. Require Claude Code authenticated on that host (OAuth under `~/.claude/` or API key — do not paste secrets into chat). Linear MCP should already be connected for Claude Code on the host when the task needs Linear writes.
6. One in-flight agent per branch across Cursor / Codex / Claude.

### `runtime:cursor` launch

Normal CloudAgent with mapped `model` + `model_params` from labels. Host from `environment` label if set; else **prefer managed VM** for observability. Use My Machines only when the implementing agent must touch host state mid-flight (OAuth CLIs, local install, Docker Desktop host evidence). Screenshots / UAT after CI can stay off the Build host. Never `codex exec` for this path.

## Standing routing (when labels absent)

**Default (no `runtime` / `model` / `model-effort` / `environment` labels):** `runtime=cursor` · `model=grok` · slug=`grok-4.6` · `effort=xhigh` on a **managed Cursor VM** (`cloud-vm`).

Labels still override when present. Mini Codex stays narrow (real Mac only) unless `environment:mini`.

| Work | Runtime | Model | Effort / reasoning | Host |
| --- | --- | --- | --- | --- |
| Default (labels absent) | Cursor Cloud Agent | `grok-4.6` | `effort=xhigh` | managed VM |
| Needs a real Linux host / Claude+Codex OAuth / local tools on sartre | Cursor Cloud Agent | label model, else `grok-4.6` | label effort, else `xhigh` | Sartre My Machines |
| Needs a real Mac (install, TCC, Cua, keyring CLI auth) | Mini Codex, or Cursor cloud on a Mac pool if one exists | Mini: label or `gpt-5.6-sol`; cloud: label or `grok-4.6` | Mini: label or `xhigh`; cloud: as above | Mini / Mac pool |
| iOS / TestFlight | Cursor cloud + pool `mobile-ios-mac` | label or `grok-4.6` | label or `xhigh` | pool |

Non-default models (`fable`, `sol`, `composer`, `opus`, …) only when the ticket labels them (or Gannon asks in chat).

### Model notes (Cursor cloud)

- **`claude-fable-5-1` / `claude-opus-5` / `grok-4.6`**: pass `model_params.effort`.
- **`gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna`**: pass `model_params.reasoning`.
- Label `opus` / `fable` / `sol` / etc. on the ticket **is** naming them — allowed when labeled. Without a label, use the default `grok-4.6` / `xhigh` — do not pick Opus/Fable/Sol/Sonnet/Gemini/Kimi/GLM from the catalog.

## Where Cloud Agents run (`environment` param)

Pass CloudAgent `environment` from the Linear `environment` label when set; otherwise from standing host routing. Doc: `/Volumes/EVO/dev/devops/docs/agent-worker.md` and https://cursor.com/docs/cloud-agent/self-hosted/my-machines

| Target | CloudAgent `environment` | When |
| --- | --- | --- |
| Cursor-managed Linux VM | omit, or `{ "type": "cloud" }` | `environment:cloud-vm`, or default when no host tools mid-flight |
| Sartre My Machines | `{ "type": "machine", "name": "<repo-basename>" }` | `environment:sartre`, or need real host (OAuth CLIs, local install, evidence gates). Workers named after checkout (`open-pstack`, `devbox`, `kata-code`, `agentis`, …) — **not** `sartre` |
| Team / Mac pool | `{ "type": "pool", "name": "mobile-ios-mac" }` (or another named pool) | iOS / shared pool work |
| Any eligible pool | `{ "type": "pool" }` | When Gannon asks for pool without a name |

`name` must match a running worker for that repo on the same Cursor account. Workers stay up with `./bin/agent-worker start-all` from the devops repo on sartre (`DEV_ROOT` default `/home/gannonh/dev`).

**Mini as My Machines:** only if the same `agent-worker` daemons are running on the Mini (`AGENT_WORKER_DEV_ROOT=/Volumes/EVO/dev`). Today the validated fleet is sartre. Do not assume Mini My Machines unless Gannon confirmed workers are up there. Prefer Mini Codex for `environment:mini` / Mac-only work instead of hoping Mini workers exist.

Grok Bot `ListMachines` (Mini shell) is a **different** channel from Cursor My Machines. Do not confuse them.

## How to launch Cursor Cloud Agent

Pass `model` and `model_params` on CloudAgent launch. Do not omit them and hope the account default is right.

Examples:

- **Default (no labels):** `model: "grok-4.6"`, `model_params: { "effort": "xhigh" }` (managed VM)
- Grok when labeled: `model: "grok-4.6"`, `model_params: { "effort": "<label or xhigh>" }`
- Fable when labeled: `model: "claude-fable-5-1"`, `model_params: { "effort": "xhigh" }`
- Sol when labeled: `model: "gpt-5.6-sol"`, `model_params: { "reasoning": "xhigh" }`
- Opus when labeled: `model: "claude-opus-5"`, `model_params: { "effort": "xhigh" }`
- Composer when labeled: `model: "composer-2.5"` (omit `model_params` unless Gannon asked for `fast`)
- `environment:sartre` for `gannonh/open-pstack`: also `environment: { "type": "machine", "name": "open-pstack" }`
- Mac / iOS pool: `environment: { "type": "pool", "name": "mobile-ios-mac" }`

Prompt starts with `/poteto-mode`. Hand off the problem and outcome. Do not prescribe line-by-line edits. Include the `https://cursor.com/agents/<bc-id>` link in OWN reports when available.

## Mini Codex (narrow use)

Use Mini Codex when `environment:mini`, or when the work **must** run on the Mac Mini itself (real Mac install, TCC, Cua, keyring CLI auth) and no Mac pool is available. This is **not** a Cursor Cloud Agent — it is `codex exec` on the Mini checkout.

- Binary: `/Users/gannonhall/.local/bin/codex`
- Model: from label slug (default `gpt-5.6-sol`)
- Reasoning: from `model-effort` label (default `xhigh`)
- Checkout: `/Volumes/EVO/dev/<repo>` (JabTracker is `jab-tracker-ios`, not `macrokinetic`)
- Command shape:

```
codex exec -m gpt-5.6-sol -c model_reasoning_effort="xhigh" -C /Volumes/EVO/dev/<repo> --approve-for-me "/poteto-mode
<task>"
```

Do not use `-s read-only` if the agent must talk to GitHub (`gh`, issues, PRs). Do not use `codex cloud exec` unless Gannon asked in this conversation. Do not use `--full-auto` (invalid on current Codex); use `--approve-for-me`.

If Mini local-exec rejects with a bind/review-surface error (not an Auto-review policy block), stop retrying workarounds. Report the exact error and give Gannon the verbatim command to run himself, or route to a Mac pool if one exists.

### Codex implementation on Mini

Only when work is already in a Sol session on that checkout, or Cursor is the wrong surface (tight CLI on the Mini): model `gpt-5.6-luna`, reasoning `max`, same `/poteto-mode` prefix and checkout rules.

## Who dispatches

- Product Manager: feature / spec work after Gannon approves, or when he says start
- Eng Manager: Build kicks (approved Phase 1 / approved specs). On Start, read Linear `runtime` / `model` / `model-effort` / `environment` labels before choosing launch path. Absent runtime/model/effort → `cursor` / `grok` / `xhigh`; absent environment → standing host routing (prefer managed VM). `runtime:claude` always needs `sartre` or `mini`.
- PR Babysitter: land PRs (settled-red CI, review comments, red main with no covering PR)
- Release Manager: land Nightly / Release / TestFlight fixes

One in-flight coding agent per branch across Cursor and Codex. If anyone already has a run on that branch, reply to it. Do not stack.

## Checkouts

Do not clone product repos onto the Grok Bot computer.

**Sartre** (preferred Linux host / My Machines): `~/dev/<repo>` (mirrors Mini layout).

**Mini** (local tools + Mini Codex):

| repo | path |
| --- | --- |
| gannonh/devbox | `/Volumes/EVO/dev/devbox` |
| gannonh/kata-code | `/Volumes/EVO/dev/kata-code` |
| gannonh/kata-agents | `/Volumes/EVO/dev/kata-agents` |
| gannonh/kata-symphony | `/Volumes/EVO/dev/kata-symphony` |
| gannonh/macrokinetic | `/Volumes/EVO/dev/jab-tracker-ios` |
| gannonh/agentis | `/Volumes/EVO/dev/agentis` |
| gannonh/open-pstack | `/Volumes/EVO/dev/open-pstack` |
| gannonh/agent-setup | `/Volumes/EVO/dev/agent-setup` |
| gannonh/skills | `/Volumes/EVO/dev/skills` |

Shell on the Mini needs Gannon's local-exec approval. That is expected. Do not announce a fake permission card.

## Brief

Hand off the problem and the outcome. Include repo, issue or PR, success criteria, constraints, how to tell it is done. Specs stay on Linear (product) / GitHub Issues inbound only. Do not write specs under `docs/specs/`.

Return only the result, or an approval ask (merge, pay, delete, ship).
