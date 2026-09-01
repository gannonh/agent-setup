#!/usr/bin/env bash
# Stay in the caller's cwd. `npx skills add` writes into the current project.
set -euo pipefail

# gannonh/skills
npx skills add gannonh/skills --skill thermo-run -y --copy --agent claude-code cursor codex
npx skills add gannonh/skills --skill readme -y --copy --agent claude-code cursor codex

# cursor plugin skills (for non-cursor agents)
npx skills add cursor/plugins --skill thermos -y --copy --agent claude-code cursor codex
npx skills add cursor/plugins --skill thermo-nuclear-code-quality-review -y --copy --agent claude-code cursor codex
npx skills add cursor/plugins --skill thermo-nuclear-review -y --copy --agent claude-code cursor codex
npx skills add cursor/plugins --skill unslop -y --copy --agent claude-code cursor codex

# misc
npx skills add anthropics/claude-plugins-community --skill eli5 -y --copy --agent claude-code cursor codex
npx skills add humanlayer/skills --skill show-me -y --copy --agent claude-code cursor codex
npx skills add warpdotdev/common-skills --skill skill-doctor -y --copy --agent claude-code cursor codex
