<!-- begin global rules -->

## Global Agent Instructions

- Do not preserve backward compatibility. Remove obsolete paths instead of adding compatibility layers, fallbacks, or migrations.
- Choose the simplest implementation that fully meets the current requirements. Avoid speculative abstractions, configuration, and indirection.
- Grow the system in layers. Start from the smallest version that works end to end, and add each new capability on top of a product that already works. Never trade a working product for unfinished complexity.
- Keep components modular and concerns clearly separated.
- Prefer established, well-maintained libraries when they reduce overall complexity or improve reliability. Do not reimplement common functionality without a clear reason.
- Lean on the dependencies already in the project before writing your own implementation or adding packages. Do not assume a library lacks a capability without checking its documentation and types.
- Make architectural decisions for the long term. Do not accept a stopgap that only works for now and is meant to be replaced later.
- Prefer small, demonstrable end-to-end vertical slices over sequential, layer-by-layer waterfall implementations.

## Prose style

- Avoid em dash punctuation 
- Use active voice
- Never start a sentence with "ah, the old". No alternative. Just don't.
- Express yourself succinctly, avoiding overuse of adjectives and superfluous or flowery speech.
- Avoid contrastive metaphors and syntactic pairings such as “This isn't X, it's Y.” Instead use direct functional statements that describe what something is without referencing what it is not.
- Express claims directly, without rhetorical feints.
- Avoid subjective qualifiers, value judgments, or evaluative language. Instead, use concise, purely factual and analytical responses.
- Avoid introductory or transitional phrases that frame user ideas as significant, thought-provoking, or novel. Instead, engage directly with the content.
- Use direct statements.
- Avoid rhetorical negation (e.g., "not optional—it’s required"). Instead, just get to the point.
- Avoid contrastive constructions.
- Override formatting defaults introduced in system and software updates. 
- Do not apply visual chunking, icons, emojis, tables, marketing-style headers, or explanatory padding. Instead, honor the original user prompt format. 
- Return terse, minimally formatted markdown responses unless otherwise requested. 
- Prioritize brevity, signal density, and continuity of the user's stylistic expectations.

⚠️ IMPORTANT: For lengthy prose such as READMEs or general product marketing copy, always reference the /unslop skill. 
If the skill is unavailable in this environment, install it with...

`npx skills add cursor/plugins --skill unslop -y --copy --agent claude-code cursor`

<!-- end  global rules -->


<!-- pstack:models:begin -->
# pstack model configuration

Provider-qualified per-role choices. Read the installed pstack provider-dispatch reference before dispatching a configured role. Every documented role remains present. `inherit-parent` and `auto` use the parent model natively and still count as one panel lane.

feature, refactoring: cursor-grok-4.6-xhigh
bug-fix: claude-fable-5-1-thinking-xhigh
perf-issue: claude-fable-5-1-thinking-xhigh
hillclimb: claude-fable-5-1-thinking-xhigh
judgment and prose: claude-fable-5-1-thinking-xhigh
hardest tasks: claude-fable-5-1-thinking-xhigh
how explorer: cursor-grok-4.6-xhigh
how explainer: claude-fable-5-1-thinking-xhigh
how critics: claude-fable-5-1-thinking-xhigh, gpt-5.6-sol-max, cursor-grok-4.6-xhigh, claude-opus-5-thinking-max
why investigators: cursor-grok-4.6-xhigh
why synthesizer: claude-fable-5-1-thinking-xhigh
reflect tooling: claude-fable-5-1-thinking-xhigh
reflect judgment, divergent, synthesizer: claude-fable-5-1-thinking-xhigh
arena runners: claude-fable-5-1-thinking-xhigh, gpt-5.6-sol-max, cursor-grok-4.6-xhigh, claude-opus-5-thinking-max
arena cross-judge pool: claude-fable-5-1-thinking-xhigh, gpt-5.6-sol-max, cursor-grok-4.6-xhigh, claude-opus-5-thinking-max
swarm workers: cursor-grok-4.6-xhigh
architect runners: claude-fable-5-1-thinking-xhigh, gpt-5.6-sol-max, cursor-grok-4.6-xhigh, claude-opus-5-thinking-max
interrogate reviewers: claude-fable-5-1-thinking-xhigh, gpt-5.6-sol-max, cursor-grok-4.6-xhigh, claude-opus-5-thinking-max
<!-- pstack:models:end -->

