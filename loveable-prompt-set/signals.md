---
TAB: Signals
Allowed paths (strict):
- root/src/pages/SignalsPage.tsx
- root/src/components/signals/*
- root/src/hooks/useSignals.ts

Goal (conversion first):
Stabilize and polish Signals to guide users from review → action → mastery tracking with visible feedback, chart integration, and shareable filter state.

Do:
1) IF you find instability/a11y gaps blocking polish: fix obvious issues (modal semantics, focus, button labels) where needed.
2) Apply these approved polish changes (minimal diff):
   - Replace console-only Accept/Reject with visible UI feedback (badge state + toast/inline message)
   - Add primary "Open in Chart" CTA in Signal Details
   - Add confidence preset buttons (60/75/90%) near slider for quick filtering
   - After Accept, show "Next step to mastery: Log outcome in Journal"
   - Persist last-used filter state (pattern + confidence) in URL query params for sharing and return, no new stores

Guardrails:
- Keep keyboard/focus behavior correct (new CTA and feedback)
- Avoid URL/state infinite loops (only update params when values change)
- No new network calls, no new timers, no new global state stores
- Keep changes local

Done when:
- Accept/Reject shows visible feedback (not console-only)
- "Open in Chart" CTA navigates consistently and is visually primary
- Preset buttons set slider value and update list counts immediately
- After Accept, mastery nudge appears
- Filters reflected in URL and respected on reload

Output:
- Touched files list + short change summary (no long explanation).
