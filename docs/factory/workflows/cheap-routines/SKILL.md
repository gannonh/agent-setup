---
name: Cheap routines
description: >-
  Use when creating or changing a Grok Bot routine, auditing bot token usage, or
  deciding whether recurring work belongs on a long chat or a fresh bot.
---
# Cheap routines

Every scheduled wake burns tokens. Pick the coarsest cadence that still delivers the result.

## Cadence

Do not schedule every 15 minutes. That is about 96 runs a day.

Default to hourly, or a few times a day, inside weekday waking hours. Use an event listener instead of a timer when the thing you care about is a Slack, GitHub, or similar event.

Stay quiet when nothing changed. Filler like "(no change.)" still costs a wake.

## Fresh bot for recurring work

A long chat makes every routine more expensive. The model rereads the thread.

Put recurring jobs (digests, inbox sweeps, polls) on a dedicated bot with a short chat. Keep talking to the main bot. That bot does not own the standing timer.

## When you create a bot

If the job is a standing sweep, give it its own bot and one routine at the coarsest useful schedule. Do not hang that routine on a bot whose chat is already long.

Quiet-when-nothing-changed is part of the job, not a courtesy.
