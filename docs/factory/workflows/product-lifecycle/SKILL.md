---
name: product-lifecycle
description: >-
  use this when handing off across Gannon's product cycle, asking what phase
  work is in, grooming the crew, or designing a product bot
---
# Product lifecycle

Use this map for handoffs, "what phase is this," crew grooming, and new product bots.
Do not copy this file into a persona. Personas name their seat. This file is the rail.

Aligns with the global agent-setup lifecycle block (Linear tracker, Linear columns as work states).

## The rail

```
Research → Plan → Build → Review → Verify → Ship
```

Product Operations sits beside the rail. It is not a phase. It owns the board and the cycle picture.

| Seat | Bot | Does | Never |
| --- | --- | --- | --- |
| Research | Research Assistant | sourced brief for Plan | specs, dispatch, PRs, cuts |
| Plan | Product Manager | Linear spec and AC on Backlog; ready for approval | coding agents, merge, cuts, board clerking |
| Build | Eng Manager | Start → In Progress → cloud agent; draft PR | write the spec, merge, cut |
| Review | PR Reviewer | Agent Review until merge-ready | feature kickoff, cuts |
| Verify | Verifier | after Done: confirm AC landed; record on Linear | flip Done yourself, build, merge, cut |
| Ship | Release Manager | nightlies and stables (release cuts) | feature kickoff, PR babysitting, calling PR-land "Ship" |
| Product Operations | Program Manager | Linear board, phase picture, status filter, broadcast | specs, dispatch, merge, cut |

Off-cycle (Buyer Research, X Manager, last30days, bot designer) are not on this rail.

## Linear is the tracker

Linear holds planning, epics, bugs, chores, specs, acceptance criteria, and status.
GitHub holds code: branches, commits, pull requests, CI, and review comments on diffs.

GitHub Issues stay enabled as inbound only. When a GitHub Issue needs work, create a **full** Linear issue (spec and AC in Linear), link the GitHub Issue, implement against Linear. Do not use GitHub Issues as the internal spec.

Architecture and durable process docs live under `docs/` in the repo. Linear Docs may still hold working drafts for ops.

Every implementing PR names exactly one Linear issue id (`KAT-####`) in title or body. Prefer Linear's generated branch name so the GitHub integration links PR and issue.

When blocked, comment on the Linear issue with the exact ask and stop. Prefer the smallest change that satisfies the AC. File out-of-AC work as a new Backlog issue.

## Work states (Linear columns)

Linear status is the phase of the work. Research and Plan happen in Backlog. Build in In Progress. Review across Agent Review through Merging. Verify after Done. Ship after Verify (release cut).

| Linear status | Meaning | Crew owner |
| --- | --- | --- |
| **Backlog** | Research + Plan. Spec and AC written on the issue. Do not implement. | Plan / Research |
| **Todo** | Approved and queued. **Backlog → Todo is the approval.** Build does not start here. | Plan / Product Operations |
| **Start** | Gannon's explicit start. Only he drags here. Program Manager hops to In Progress and **always** pings Eng Manager with an OWN start ask **for that Linear id** (include runtime/model/effort labels when set) — **unless** the issue has the `gannon-drive` label (then skip Eng; Gannon drives Build). Parallel Starts = one OWN per ticket — never skip because another ticket was already kicked. | Gannon drag; Program Manager + Eng (or Gannon if `gannon-drive`) |
| **In Progress** | Build. Implement on a branch/worktree against AC (one agent ↔ one Linear id worktree). Draft PRs stay here. On complete, mark PR ready and move to Agent Review. Column alone does **not** mean Eng was OWN'd — if Start OWN was missed and the issue is **not** `gannon-drive`, Program Manager OWN-starts Eng on the In Progress wake. | Eng Manager (or Gannon if `gannon-drive`) |
| **Agent Review** | Agent-owned review. **PR Reviewer owns it** until required CI is green and all review threads / unanswered comments are closed. Not idle watch. Feature agent finished ≠ Review done. Author `gannonh` does not exempt. Fix CI and threads on the existing branch. When merge-ready, hop to Human Review. Applies even with `gannon-drive`. | PR Reviewer |
| **Human Review** | **Stand-down.** Gannon owns. No coding agents, CI-fix dispatches, or review drives until he moves it or says resume. Entered when gates clear, or when Gannon drags mid-flight to pause everyone. | Gannon |
| **Merging** | Permission to merge. Merge only from this column. Gannon drag = land signal. Program Manager pings PR Reviewer to land. Applies even with `gannon-drive`. | PR Reviewer lands |
| **Done** | Merged. Then Verify: confirm AC landed; comment on the Linear issue. If AC missed, reopen or open a linked issue. Applies even with `gannon-drive`. | Verifier |
| **Canceled / Duplicate** | Terminal. New work needs a new issue. | — |

Merge-ready: PR ready for review (not draft), clean mergeability, required CI green, no open review threads, no unanswered comments.

If a PR closes without merging, comment on the Linear issue with the reason and move it to Todo.

**Ship** means cutting a release channel (nightly, stable, TestFlight). It is not merge and not Agent Review landing.

### `gannon-drive` label

Kata-sh label `gannon-drive`: **Gannon drives Build**. Program Manager must **not** Eng-OWN on Start or In Progress. Hop Start→In Progress as usual. From **Agent Review** onward the crew is normal (PR Reviewer OWN → Merging land → Done→Verifier).

Use when Gannon is driving the Build seat himself and still wants Review/Verify/Ship on the rail. Do **not** read this as “agents must not write code” — Review/Verify still run coding agents as usual.

### Agent Review and Human Review rules (crew)

1. When Build marks a PR ready (or Eng reports ready), hop **Agent Review** and ping PR Reviewer with an **own** ask (repo, PR, Linear id) — not an FYI. Native Linear automation may already move draft→In Progress and ready PR→Agent Review; do not fight it.
2. While in **Agent Review**, PR Reviewer drives until merge-ready. Code fixes and red CI go through a coding agent on the existing branch (Dispatch runtimes).
3. When gates pass, PR Reviewer pings Program Manager. Hop **Human Review** and give Gannon the next human ask.
4. Gannon may drag to **Human Review** at any time to pause the crew. Hard stand-down.
5. Gannon drags to **Merging** when he wants land. Merging-column land wakes Program Manager → PR Reviewer lands.
6. Gannon drags to **Start** when he wants Build. Program Manager hops In Progress → Eng Manager OWN start **per ticket** (parallel Starts each get their own OWN), **unless** `gannon-drive`. Never treat In Progress as proof Eng was kicked.

Agent Review is not "a cloud agent is still typing." Human Review is not "keep babysitting quietly."

## Project milestones (product gates)

Linear **project milestones** are the product's major delivery outcomes. They are not the same as issue status columns and not the same as epics.

| Layer | What it is | Example |
| --- | --- | --- |
| **Project status** | Live vs paused roster | Agentis In Progress |
| **Milestone** | Multi-ticket product gate / phase outcome | Gate 0: Foundation |
| **Epic** | Parent issue that groups work | KAT-3237 |
| **Issue status** | Unit-of-work phase on the rail | Todo / Start / In Progress / … |

### Naming

- Gated outcomes: `Gate N: <short outcome>` (PASS criteria in the milestone description).
- Ungated later phases: `Phase N: <name>` (no formal PASS until we add a Gate).
- Do not invent sprint/week milestones. Do not use milestones for single PRs.

### Rules

1. Every implementable ticket that belongs to a gate/phase gets that **project milestone** set when filed (Plan owns this).
2. Milestone description states **PASS when…** (or "no formal PASS yet" for Phase N).
3. A gate **PASSes** when: all milestone issues that are in scope are Done, and the gate verification ticket (if any) has PASS evidence. Program Manager reports gate status; Verifier confirms AC on the gate ticket.
4. Epics may span milestones; child issues carry the milestone, not usually the epic itself.
5. Onboard a new product: create Gate/Phase milestones on the Linear project before or with the first Phase breakout. Assign children as they are filed.
6. Briefings and stuck reports: name the milestone when a live item is blocked on a gate.

### Agentis (reference)

- Gate 0: Foundation — KAT-3239–3247
- Gate 1: Daily-drivable
- Gate 2: Grok Bot parity
- Gate 3: Coding dispatch
- Phase 4: Reach and always-on
- Phase 5: Ecosystem and hardening

## Scout vs start

Research + Plan (Backlog) is scout. A brief is not a start.
Approval is Backlog → Todo.
Build starts only when Gannon drags to **Start** (not Todo). Program Manager then hops In Progress and kicks Eng — **unless** `gannon-drive`.
Ship-the-cut is Release Manager. It is not merge.

## Handoffs

Every stage change pings Program Manager with repo, Linear id, and the new phase.
Tasked asks use a short id. Reply against that id, including nothing happened.
Standing wakes may stay quiet when their own queue is empty. A tasked ask may not.

Typical path:

1. Plan (or Gannon) asks Research for evidence. Findings go on the Linear issue.
2. Plan writes spec and AC on a Backlog issue. Pings Program Manager: Plan.
3. Gannon moves Backlog → Todo (approval). Ticket waits in Todo until he is ready.
4. Gannon moves Todo → Start. Program Manager hops In Progress and pings Eng Manager (skip Eng if `gannon-drive`). Eng launches the coding agent when OWN'd. Draft PR during In Progress. When complete, mark ready and move to Agent Review. Review owns it.
5. Review clears CI + threads. Program Manager → Human Review. Gannon → Merging when ready. PR merges → Done.
6. Verifier confirms AC on the merged state and comments on the Linear issue. Pings Program Manager: Verify.
7. Release Manager cuts only when a cut is due. Pings Program Manager: Ship.

## One seat

Do the job of your seat. If the next verb belongs to someone else, hand it off.

## Stall hardening (Agent Review + Merging)

Status hops alone are not enough. Main can move under an Agent Review PR (`mergeable_state=dirty`), or Merging can sit green with nobody landing.

### A — Dirty / red while Agent Review
When a live-product PR attached to a Linear **Agent Review** issue is `dirty`, required CI red, or has open review threads with no Review activity: Program Manager OWN-nudges **PR Reviewer** (dedupe: at most once per PR per ~30m). Treat as stuck, not healthy quiet.

### B — Merging land timeout
If Linear is **Merging**, PR is merge-ready (not draft, clean, CI green, threads closed) for **>20 minutes** with no merge: Program Manager re-OWN-nudges PR Reviewer to land. Dedup same window.

### D — PR Reviewer standing rule
On every wake (OWN, GitHub, or stall-watch), before treating Agent Review as idle: scan owned Agent Review PRs for dirty / red CI / open threads. Rebase or fix first. Do not wait for a new Linear hop.

Watches: Program Manager `review-stall-watch` (weekday poll) + `review-stall-on-merge` (live-repo `pr-merged` → scan Agent Review PRs for dirty).
