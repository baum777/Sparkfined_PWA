---
TAB: Chart
Allowed paths (strict):
- root/src/features/chart/*
- root/src/components/chart/*

Goal (conversion first):
Stabilize and polish Chart workspace to guide users through "Analyze → Mark → Alert → Journal" with clear tools guidance, working refresh, and adaptive next-action cues.

Do:
1) IF you find instability/a11y gaps blocking polish: fix obvious issues (labels, focus, roles, layout jank) where needed.
2) Apply these approved polish changes (minimal diff):
   - Add clear primary CTA near bottom panel: "Log this setup → Journal"
   - Add subtle one-time hint when chart auto-populates missing URL params (symbol/timeframe/address/network)
   - Make top bar "Refresh" button actually refresh chart data OR remove/replace it
   - Present tools with guided sequence: "Analyze → Mark → Alert" (backed by existing sections)
   - Add lightweight "next best action" cue adapting to state (e.g., no data: "Try 1h timeframe" / alerts empty: "Create first alert"), no new data fetching

Guardrails:
- Keep data-testid stable (never rename/remove) used by chart E2E
- Do not introduce URL/state infinite loops
- Do not add new timers/intervals or increase chart re-render frequency
- No global styling changes

Done when:
- Primary "Log this setup → Journal" CTA is visible and keyboard accessible
- URL-default hint appears once (dismissible or session-scoped), no repeated flashing
- "Refresh" has real effect (triggers data reload) or is removed
- Tools sequence is understandable at a glance
- Adaptive cue helps users progress without behavior regressions

Output:
- Touched files list + short change summary (no long explanation).
