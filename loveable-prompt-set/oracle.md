---
TAB: Oracle
Allowed paths (strict):
- root/src/pages/OraclePage.tsx
- root/src/components/oracle/*
- root/src/store/oracleStore.ts

Goal (conversion first):
Stabilize and polish Oracle to guide users through daily insights with calm reward messaging, clear mark-read rewards explanation, actionable takeaways, and mastery progression links.

Do:
1) IF you find instability/a11y gaps blocking polish: fix obvious issues (labels, focus states) where needed.
2) Apply these approved polish changes (minimal diff):
   - Replace reward banner copy with calmer "degen → mastery" wording and add "View auto-journal entry" link/CTA
   - Add short pre-click explanation near "Mark as read" describing rewards (XP/streak/auto-journal)
   - Add compact "Today's takeaway" summary block above full report `<pre>`
   - Improve theme filter discoverability by labeling "All themes" and showing count
   - Add small "Next step to mastery" link row connecting Oracle → Chart → Journal (e.g., "Open Chart for context" and "Open Journal entry"), no new data fetching

Guardrails:
- Keep existing `data-testid` stable (Oracle E2E relies on them): `oracle-page`, `oracle-refresh-button`, `oracle-mark-read-button`, `oracle-pre`
- Do not introduce new routes; if "View auto-journal entry" must navigate, use existing route and keep optional
- No new timers/intervals beyond existing reward timeout behavior

Done when:
- Reward banner is calm and includes actionable "View auto-journal entry" affordance
- Users see "what happens" before clicking "Mark as read"
- "Today's takeaway" is visible above full report text
- Theme filter labeling and counts improve discoverability
- Mastery link row improves actionability without changing core behaviors

Output:
- Touched files list + short change summary (no long explanation).
