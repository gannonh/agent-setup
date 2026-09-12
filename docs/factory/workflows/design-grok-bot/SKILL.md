---
name: design-grok-bot
description: >-
  Use this when designing or creating a new Grok Bot. Ask a few preference
  questions, write a tight persona, CreateAgent, then verify against the live
  profile. Coding bots use pstack / poteto-mode as the quality bar. On a fresh
  install, run setup-pstack first.
---
# Design a Grok Bot

Create the bot. Do not ship a shareable template unless the user asked for a template.

## Data shape

A bot is four fields, in this order:

1. **One job.** One sentence. What it does every time it wakes.
2. **Anti-jobs.** What it never does, even if asked. Adjacent work goes to a different bot.
3. **Voice.** A few words. Match the user, or a named character. Not a generic assistant.
4. **Wake.** On-demand chat, a standing routine, or both. Quiet when there is nothing to report.

Name is short. Description carries all four. Do not pad with leftover tools, model essays, or "I can also help with..."

`CreateAgent` takes `name` and `description` only. That description is the whole persona. After create, prove it by reading `/home/box/agent-data/agents/<id>/profile.json`. Do not trust the tool ack alone.

There is no delete tool. Only create when the job is real.

## Fresh install

On first run after import, or when pstack is newly installed and `~/.cursor/rules/pstack-models.mdc` is missing, run pstack's setup-pstack skill (`/setup-pstack`) for this user before designing a coding bot. That writes their per-role models. Skip if the rule already exists. Do not ask permission to run it. Re-running setup-pstack updates the rule.

Then run `/create-verification-skill` when a real repo is present and no `verify-*` skill exists. Skip create-verification-skill on an empty machine.

If this user has no coding bots, skip setup-pstack and create-verification-skill. Pstack lives in Cursor cloud agents. Grok Bots only need to know what poteto-mode is and inject `/poteto-mode` on cloud dispatch.

## Intake

Ask only preference questions no experiment can settle. Typical set, skip any already answered:

- the one job
- voice and name, if they care
- standing routine vs on-demand
- who it talks to (this user, other bots, an outside channel)

Do not ask for tools, plugins, or model if you can copy a working sibling. Do not ask "should I create it?" after the job is clear. Create it.

If the ask is reversible detail (color, a nickname), pick it and say what you picked.

## Coding bots

Bar is pstack. Read pstack's poteto-mode (and boteto-mode on Grok Bot) when writing the persona. pstack is the coding-agent workflow pack: one job, unslopped prose, verified work, CloudAgent for repo work.

Bake into the description:

- one job and anti-jobs
- unslopped, short replies
- repo work goes to a CloudAgent, not a local clone
- slash-skills are live files, not app commands, if this user uses them
- copy the current model rule from an existing coding bot unless the user names one
- point at pstack / poteto-mode as situational, not standing

Do not paste the full pstack playbook into the description.

If pstack is not installed on Grok Bot, keep the same tightness anyway. Dispatch with `/poteto-mode`. Do not install pstack locally unless the user asks.

## Non-coding bots

Same tightness, different job. Scout, shopkeep, life-admin, dispatcher, writer.

Bake into the description:

- ONLY job, named in the first sentence
- stay quiet when there is nothing to report
- never do the adjacent verb (a mentions scout does not post, a drafter does not send)
- the concrete how (which API, which inbox, which channel), not "use whatever tools you have"
- self-improve: fix local obvious drift, dead watches, stale skills, and broken connectors; tell the user; ask first on seam changes, plugin install/remove, or new durable watches

No coding instructions unless the job is hybrid and the split is explicit (coordinate vs write code).

## After create

Read the live profile back. Tell the user the name and the one-job line. Mention they delete from the sidebar (right-click, Delete) if they hate it.

If a first routine belongs to the job, create it on that bot by sending it the instruction, or say you cannot write another bot's routines from here and do that setup in its chat.

House grooming (personas, watches, skills, plugins, auth blockers) lives on the designer bot's weekly pass. Do not hang a second weekly eval on the new bot unless the job is itself a standing sweep.
