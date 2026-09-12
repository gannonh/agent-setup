---
name: resolve-pr-reviews
description: >-
  use this when unanswered GitHub PR review comments (human or bot) need to be
  evaluated, fixed, and replied to
---
# Resolve PR reviews

Use this when a GitHub pull request has unanswered review comments (human or bot: CodeRabbit, Cursor Bugbot, Copilot, Codex, etc.) and they should be evaluated, fixed if real, and replied to.

On Gannon's board (Linear columns):

- **Agent Review** — PR Reviewer owns until threads are closed and required CI is green. Do not idle-watch. Author being `gannonh` does not skip ownership. False-positive bot findings get a reply stating why, then resolve.
- **Human Review** — **stand down.** Do not drive comments, dispatch landing agents, or kick CodeRabbit on that PR until Gannon moves it or explicitly resumes. See product-lifecycle.
- **Merging** — merge only from this column after Gannon's land signal.

When Agent Review gates pass, ping Program Manager to hop **Human Review**.

## Tool

Use `npx agent-reviews` (https://github.com/pbakaus/agent-reviews). Auth via `gh` or `GH_TOKEN` / `GITHUB_TOKEN`. In detached environments set `GH_REPO=owner/name`. Do not clone just to run this CLI.

On the Grok Bot computer, prefer the GitHub connector for replies when `gh` is unavailable; run `agent-reviews` on Mini or inside the landing cloud agent.

```bash
npx agent-reviews --pr <n> --unanswered --expanded --json
npx agent-reviews --pr <n> --detail <comment_id>
npx agent-reviews --pr <n> --reply <comment_id> "Fixed in <sha>. <why>"
npx agent-reviews --pr <n> --reply <comment_id> "Won't fix: <reason>" --resolve
```

## Workflow

1. If the Linear ticket is **Human Review**, stop. Stand down unless Gannon explicitly asked you to act.
2. List unanswered comments. If none, stop (and if CI is also green, report merge-ready / Human Review hop).
3. Skip comments the PR author already handled (their own replies/resolves).
4. For each remaining comment: true positive / actionable → fix; false positive → explain and `--resolve`; architectural/uncertain → ask the user, do not guess.
5. Code fixes go through a Cursor cloud agent on the existing PR branch. Do not clone the repo locally.
6. After a fix commit exists, reply with the hash. Leave threads open on fresh fixes so reviewers can verify. Use `--resolve` for false positives, already-addressed, and concluded discussion.
7. Do not enter a 10-minute watch poll from Grok Bot. Event listeners already fire on new comments.

## Report

Tell the user only when you actually fix, reply, or need a decision. Ping Program Manager when Agent Review gates clear.
