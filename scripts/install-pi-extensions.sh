#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

pi install npm:pi-web-access
pi install npm:@juicesharp/rpiv-ask-user-question
pi install npm:@juicesharp/rpiv-todo
pi install npm:@kata-sh/pi-symphony-extension
pi install npm:pi-goal
pi install npm:@ff-labs/pi-fff
pi install npm:pi-cursor-sdk
pi install npm:pi-mcp-adapter
pi install npm:pi-anthropic-oauth
pi install npm:pi-subagents
pi install git:github.com/DietrichGebert/ponytail


