---
name: live-product-roster
description: >-
  use this when deciding which products are live, pausing or resuming a product,
  briefing the crew, choosing which repos to watch, or answering where the
  source of truth lives
---
# Live product roster

Do not keep a second list in chat, memory, or a bot persona. Read Linear.

## Three layers

1. **Live vs paused:** Linear project status. In Progress is live. Backlog is paused. Canceled is off the roster. Roster: the workspace projects list.
2. **Phase of a unit of work:** Linear issue status (Backlog / Todo / Start / In Progress / Agent Review / Human Review / Merging / Done).
3. **Product gate / phase outcome:** Linear **project milestones** (`Gate N: …` or `Phase N: …`). Spec on issues; milestone groups the gate. See product-lifecycle skill and Linear Doc *Milestone use (Kata-sh)*.
4. **Spec and PR:** Linear holds the spec and AC. GitHub holds the PR and CI. Always name the GitHub repo when talking about work.

### Linear phase ownership (unit of work)

- **Backlog** — Research + Plan. Spec/AC on the issue. Do not implement.
- **Todo** — Approved (Backlog → Todo). Waiting for Start.
- **Start** — Gannon-only start signal. Program Manager → In Progress + Eng OWN start.
- **In Progress** — Build. Eng Manager / coding agent. Draft PRs stay here.
- **Agent Review** — PR Reviewer **owns** until required CI is green and all review threads are closed. Not idle watch. Feature agent finished ≠ done. Author `gannonh` does not exempt ownership. Full rules: product-lifecycle skill.
- **Human Review** — **Stand-down.** Gannon owns. Crew stops landing agents, CI fixes, and review drives on that PR until he moves it or gives an explicit resume.
- **Merging** — Gannon drag = merge permission. Program Manager pings PR Reviewer to land.
- **Done** — Merged. Then Verify (AC confirmation on the Linear issue).

Ship (release cut) is after Verify and is not a Linear column for the PR.

## Pause and resume

- Pause: move the Linear project to Backlog. Stop watching its repo until it returns.
- Resume: move the Linear project to In Progress. Then it is live again.
- Cancel: off the roster (e.g. superseded product). Do not Eng/PR/ship.
- Do not treat a Backlog or Canceled project as active because someone mentioned the repo.

## How the crew stays informed

- Stage-change pings go to Product Operations (Program Manager), with repo, Linear id, and the new phase.
- Gannon gets stuck items and the next human ask only. Lead with Linear id and URL. GitHub in parentheses.
- Weekday 9:00 AM PT briefing covers **In Progress projects only**. Stay quiet if nothing changed and nothing is stuck.
- Do not fan out a daily digest to every bot. Ping a seat only when that stage has work.
- Do not add GitHub listeners unless asked.

## What not to do

- Do not maintain a hardcoded product list in a skill, routine, or persona as the source of truth. Linear can change. Re-read projects when the roster matters.
- Do not use GitHub stars, local checkouts, or chat recap as the live set.
- Do not treat GitHub Issues as the internal spec.
- Product Operations owns the board picture. Other seats do their stage. They do not re-broadcast the full roster.
