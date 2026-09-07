**Linear groom — Kata Code**

Workspace: `kata-sh` / team `Kata-sh`. Project: **Kata Code** (`https://linear.app/kata-sh/project/kata-code-f2107c018151`). Repo: `gannonh/kata-code`. Linear is the only internal tracker; GitHub is code/PRs only.

### Job
1. Walk every **open** issue in this project (exclude Done / Canceled / Duplicate).
2. Groom and clean.
3. Promote **Backlog → Todo** only when an issue is unblocked and ready to work.
4. Leave a short comment on each issue you change, and end with a digest of moves + open blockers.

### Column rules (do not invent status)
| Status | Your job |
| --- | --- |
| **Backlog** | Groom. Promote to **Todo** only if ready (below). |
| **Todo** | Ready queue. Keep tidy. Do **not** demote without a concrete reason (comment it). |
| **Start / In Progress / Agent Review / Human Review / Merging** | Live rail. **Do not move.** Comment only if you find a real board bug (wrong PR link, stale blocker). |
| **Done / Canceled / Duplicate** | Skip. |

Never drag to **Start** or **In Progress**. Start is Gannon-only. Never merge, open PRs, or dispatch eng.

### “Ready for Todo” checklist (all must pass)
- Spec + acceptance criteria on the Linear issue (not only a GitHub link).
- No open blockers (`blocked by` unresolved, or a comment that still needs an answer).
- Dependencies Done or not required for this ticket.
- Correct **project**, **parent/epic**, and **milestone/gate** when the work belongs to one.
- Clear next implementable unit (not a vague epic dump).
- Not waiting on Gannon unless labeled `needs-gannon` with an exact ask — those stay Backlog (or stay put) until the ask is answered.

If almost-ready: fix what you can (AC bullets, links, labels, blocker relations, milestone), leave it **Backlog**, comment what’s still missing.

### Cleanup you should do
- Fix missing/broken PR or GitHub links; one implementing PR ↔ one Linear id.
- Collapse duplicates (mark Duplicate, point at the survivor) — don’t delete.
- Split oversized tickets into Backlog children when AC covers multiple unrelated outcomes.
- Strip stale `needs-gannon` when the ask is answered; add it only for a live blocker with an **exact ask** on the issue.
- Prefer agents@ attribution for bot edits; don’t rewrite history for vanity.

### Do not
- Promote a whole stack “because Gate 0 is next” — only tickets that pass the checklist.
- Touch Nightly Audit tickets that already have an open PR mid-Review/Merging except to fix an obvious wrong status/link.
- Create work outside this project.
- Spam comments on healthy live tickets.

### Output (every run)
1. **Promoted to Todo:** `KAT-####` — one-line why.
2. **Groomed in place:** `KAT-####` — what you fixed.
3. **Still blocked / not ready:** `KAT-####` — blocker or missing AC.
4. **Suggested next Start (for Gannon):** at most **one** Todo item, with Linear URL. If Todo is empty, say so.

---

For another product, change only the project name, URL, and repo line. Same column rules.