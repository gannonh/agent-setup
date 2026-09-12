Here’s the product-crew map as it lives today. Skills under `/home/box/agent-data/workflows` are **shared** (any bot can run them); what differs is persona + which routines wake whom.

---

### Shared product skills (the ones that matter for this crew)
| Skill | When |
| --- | --- |
| [product-lifecycle](sand-workflow:product-lifecycle) | Rail + handoffs (Research→Plan→Build→Review→Verify→Ship; Program Ops beside it) |
| [live-product-roster](sand-workflow:live-product-roster) | Live vs paused = Linear project status; columns = phase |
| [dispatch-runtimes](sand-workflow:dispatch-runtimes) | Cursor / Codex / Claude + Linear labels (`runtime` / `model` / `model-effort` / `environment`) |
| [heavy-lift-cloud-agents](sand-workflow:heavy-lift-cloud-agents) | Don’t implement on the bot box; dispatch |
| [github-on-grok-bot](sand-workflow:github-on-grok-bot) | GitHub via connector only (no `gh` on the shared box) |
| [resolve-pr-reviews](sand-workflow:resolve-pr-reviews) | Agent Review ownership / thread close |
| [cut-a-stable-release](sand-workflow:cut-a-stable-release) | Stable gates + cut |
| [cheap-routines](sand-workflow:cheap-routines) | Cadence / quiet-when-nothing |
| Also present (less core): `design-grok-bot`, `ground-a-spec-in-data`, `make-bot-ui`, `last30days`, `unslop`, `writing-revision` |

---

### 1. Program Manager (me) — Product Operations
**One job:** Linear board + cycle picture. Spec/AC/status live on Linear; GitHub = code/PRs. Status filter for you; weekday 9am brief.

**Anti-jobs:** specs, coding dispatch, merge/CI babysit, release cuts, clone.

**Board hops it owns:** Start→In Progress + Eng OWN (skip Eng if `gannon-drive`); ready PR→Agent Review + PR Reviewer OWN; merge-ready→Human Review + your next ask; Merging→ping land; Done→Verifier.

**Routines (4):**
| Routine | Trigger |
| --- | --- |
| Weekday board briefing | Cron `0 9 * * 1-5` (9:00 AM PT weekdays) |
| Linear board status | Linear `statusChanged` (Kata-sh statuses + live projects) |
| Review stall watch | Cron `35 9-18/1 * * 1-5` (hourly weekdays 9:35–6:35 PM) |
| Review stall on merge | GitHub `pr-merged` on agentis / kata-code / devbox / open-pstack |

**Skills it leans on:** product-lifecycle, live-product-roster, dispatch-runtimes, github-on-grok-bot.

---

### 2. Eng Manager — Build
**One job:** After Program OWN-starts an In Progress ticket, launch **one** coding agent (Cursor cloud default; Codex/Claude via My Machines when labeled). Draft PR → ready → Agent Review. Spec/AC from Linear only.

**Anti-jobs:** write specs, merge, cut releases, start from Backlog/Todo alone, start `gannon-drive` tickets, implement itself.

**Routines:** none (wake = OWN from Program / you).

**Skills it leans on:** dispatch-runtimes, heavy-lift-cloud-agents, product-lifecycle, github-on-grok-bot.

---

### 3. Nightly Audit Engineer
**One job:** Nightly code-quality audit of `gannonh/agentis` + `gannonh/kata-code`; research → one cleanup Linear ticket per area.

**Note:** Standing order says this bot stays **paused until you say otherwise** (nightly tickets still land via other paths when you want them).

**Routines (1):**
| Routine | Trigger |
| --- | --- |
| Nightly code-quality audit | Cron `0 0 * * *` (midnight PT daily) — enabled on disk; treat as paused by your standing order |

**Skills:** product-lifecycle / live roster for filing tickets; github-on-grok-bot for research reads.

---

### 4. Release Manager — Ship
**One job:** Keep Nightly/Release green; cut stables only when you say. Always name the repo. Tell Program when a cut is in flight/shipped.

**Freeze posture (in routines):** open-pstack fully live; devbox + kata-code live again; agentis board/Build only (ask before release/tag); others quiet until lifted.

**Anti-jobs:** specs, feature kickoff, PR babysit, auto-stable without your say-so.

**Routines (2):**
| Routine | Trigger |
| --- | --- |
| Keep nightlies and releases green | GitHub `ci-failed`/`ci-passed` on `main` for open-pstack, agentis, agent-setup, devbox, kata-code (+ more in group) |
| Ping when main is ahead | GitHub `pr-merged` on those product repos (cut-candidate ping when nightly green + real unreleased work) |

**Skills it leans on:** cut-a-stable-release, github-on-grok-bot, product-lifecycle, live-product-roster.

---

### 5. Product Manager — Plan
**One job:** Write Linear specs + AC on Backlog; rank what gets a spec; prep for your approval (Backlog→Todo). Pull Research Assistant when evidence is needed.

**Anti-jobs:** Eng OWN / coding agents, merge/CI, cuts, board clerking, treating GH Issues as internal spec.

**Routines:** none (on-demand; tells Program when Plan is ready).

**Skills it leans on:** product-lifecycle, live-product-roster, ground-a-spec-in-data (when analytics matter), github-on-grok-bot.

---

### Not in your list (but on the same rail)
PR Reviewer (Review) and Verifier (Verify) sit between Eng and Release. Happy to dump those the same way if you’re cloning the full cycle into Cursor.

**Replication tip:** personas carry the seat; routines carry wakes; skills stay one shared library — don’t copy skills into each bot.