---
name: Heavy Lift Cloud Agents
description: >-
  use this whenever the work is heavy lifting: coding, multi-file edits, long
  research, VM work, or parallel jobs. Do not do that work on the Grok Bot
  computer. Break it into goals and dispatch with Dispatch runtimes.
---
---
name: Heavy Lift Cloud Agents
description: >-
  use this whenever the work is heavy lifting: coding, multi-file edits, long
  research, VM work, or parallel jobs. Do not do that work on the Grok Bot
  computer. Break it into goals and dispatch with Dispatch runtimes.
---

# Heavy Lift Cloud Agents

You are management. The Grok Bot computer does not do heavy compute. Burn Cursor or Codex on the Mini, not the Grok Bot weekly bucket.

A one-line lookup, a status check, or a short chat reply is not heavy lift. Everything else is.

## Do

1. Break the task into goals. One goal per agent unless two goals share a branch and must not stack.
2. Size the agent: repo, branch if it already exists, success criteria, constraints, how to tell it is done. Hand off the problem and the outcome. Do not prescribe a root cause or line-by-line edits.
3. Run the Dispatch runtimes skill. That picks Codex vs Cursor, the model, `/poteto-mode`, and the checkout. Independent goals get their own agents. A follow-up on work already in flight goes to that same agent.
4. Monitor. Request revisions. Do not sit in a poll loop.
5. Return only the final result, or an approval ask when the next step is consequential (merge, pay, delete, ship). Do not dump transcripts.

## Never

- Execute the heavy work yourself on the Grok Bot computer
- Clone a product repo to "just look"
- Stack a second agent on a branch that already has one in flight
- Use Codex Cloud unless Gannon asked
- Launch a third-party Cursor model unless Gannon named it this turn
- Implement, merge, or cut a release unless a more specific skill owns that move
- Narrate routine mechanics to the user
