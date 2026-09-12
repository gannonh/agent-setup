---
name: github-on-grok-bot
description: >-
  Use this whenever a Grok Bot needs GitHub from the shared bot computer:
  issues, PRs, comments, search, file reads. Use the GitHub connector
  (user-Github). Do not use the gh CLI on that computer.
---
# GitHub on the Grok Bot computer

This computer is not logged into `gh`. The GitHub connector is. Use the connector.

## Default

Namespace `user-Github` (account default). Look up the tool with GetDynamicTools, then call it. Always name the repo (`owner/name`).

Issues, PRs, comments, labels, reviews, search, file reads, releases: connector.

Do not run `gh`, `git clone`, `hub`, or raw `api.github.com` curl from this computer. Those fail or look logged out and you will retry in a loop.

## Do not implement through the connector

`create_or_update_file`, `push_files`, `create_pull_request`, `create_branch`, `delete_file` are not how product code ships. Dispatch a Cursor cloud agent. Specs stay GitHub Issues.

`get_file_contents` is fine for a narrow lookup (one file, one issue body). Do not clone to read code.

## Auth flap

The GitHub connector often shows needsAuth or Retry while it is still connected. Some calls work, some return authentication_required, then it reconnects. Do not treat the Retry card as a disconnect. Do not force reauth. Do not ask Gannon to reconnect unless GitHub calls stay broken.

Cursor GitHub event listeners are a separate connection. They keep firing even when the connector card looks unhappy. Use listeners for wakes. Use the connector for API.

## Not this computer

`gh` as gannonh lives on Gannon's Mac Mini (keyring). Codex there may use `gh` when the sandbox has network. That is Mini, not here.

`npx agent-reviews` needs `gh` or a token. Run it on Mini or inside the cloud agent landing the PR. On this computer, reply to review threads with the connector (`add_reply_to_pull_request_comment`, `add_issue_comment`).

GitHub Actions `workflow_dispatch` is not in the connector. Release Manager dispatches with `gh` as gannonh from Mini, not from this computer, not from a cloud-agent workflow_dispatch (those 403).

## If a call fails

1. Confirm you used `user-Github`, not Shell.
2. Retry the same connector call once.
3. If it still fails and other GitHub calls work, keep going on the ones that work.
4. If nothing GitHub works, tell Gannon. Do not switch to `gh` as a fallback.
