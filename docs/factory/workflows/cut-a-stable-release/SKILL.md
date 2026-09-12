---
name: Cut a stable release
description: >-
  use this when the user asks to cut, ship, or promote a stable release after
  nightlies, including watching the run and fixing failures
---
# Cut a stable release

Use when the user asks to cut, ship, or promote a stable. Nightlies for these products already run on a schedule. Do not dispatch a nightly unless they explicitly asked for an extra one this round.

## Gates

Both must pass. If either fails, say so and stop. Do not cut "just in case."

1. **Nightly is healthy.** Latest scheduled nightly for this repo succeeded, including its smoke or equivalent checks. If it failed, watch that run, fix, and wait for a green nightly. Do not promote a red nightly.
2. **Enough meaningful change.** Compare default-branch tip to the latest non-prerelease GitHub release. Ignore release-bot version bumps; those are the last cut, not unreleased work. Nightly prerelease tags do not count as a stable. Docs-only, lockfile-only, or chore-only is not enough unless they said to ship it anyway. Summarize what would go out in a few lines so they can see the judgment.

If they already said "cut it," still apply the gates. Only skip a gate when they override it in so many words.

## How to cut

1. Look up this repo's stable path. Typical: a `workflow_dispatch` Release workflow on the default branch. Leave version empty so the workflow resolves it from the current nightly or package metadata. Do not hand-edit versions, tags, or changelog unless the repo has no automation.
2. Dispatch it. Do not dry-run unless they asked. Do not clone the repo to cut.
3. Watch the run. On failure, fix via a cloud agent on that repo (investigate, don't assume a cause), land the fix, re-dispatch.
4. Confirm it landed: GitHub release URL, and whatever the product publishes (npm `latest`, desktop assets, etc.).

## Extra nightly

Only if they explicitly asked to cut a nightly this round: dispatch the Nightly workflow with publish enabled, version empty, watch and fix. Then apply the stable gates before promoting. Scheduled nightlies are the default; do not stack extras.

## Never

- Invent a semver
- Auto-cut because main moved
- Treat "main is ahead" as a reason to ship without the two gates
- Skip watching a run you started
