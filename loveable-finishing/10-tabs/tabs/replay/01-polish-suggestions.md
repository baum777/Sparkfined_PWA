## Replay — 01 Polish Suggestions (approved)

### Approved changes

1) **Add a clear “Start replay” path when no session is selected**
   - Provide an obvious entry path to start a replay by choosing symbol and time window (or a simple default), rather than only showing an empty state.

2) **Make playback controls accessible**
   - Ensure all controls have clear labels, keyboard access, and visible focus states; add keyboard shortcuts where appropriate.

3) **Add “Next step to mastery” CTA after replay**
   - After replay activity, guide the habit loop: “Log insights to Journal” with context prefilled from the replay asset/timeframe.

4) **Reduce UI noise**
   - Collapse “Session Info” by default (and/or tuck secondary info behind a disclosure) to keep attention on playback + decisions.

### Rationale (conversion/usability first)

- **(1)** Reduces dead-ends and increases “first successful replay” completion.
- **(2)** Improves control confidence and accessibility (especially for dense playback UIs).
- **(3)** Converts replay learning into journaling (degen → mastery loop).
- **(4)** Keeps cognitive load low and focuses on core actions.

### Risks

- **Performance**: avoid extra heavy renders of `AdvancedChart` when adding start flow UI.
- **Playback loop safety**: don’t add new timers/intervals beyond existing replay engine; avoid new render loops.
- **E2E alignment**: replay-related E2E references `replay-page` and `button-go-live`; keep those stable.

### Acceptance criteria (testable)

- **(1)** When there is no selected session, users see a clear “Start replay” path that leads to a playable replay view.
- **(2)** Playback controls are keyboard reachable; focus states are visible; main controls have accessible labels.
- **(3)** A “Log insights to Journal” CTA is available and pre-fills context (symbol/timeframe) without introducing new routes.
- **(4)** Session info is collapsed by default; users can expand it when needed.

### Affected paths (strict, from cluster map)

- root/src/pages/ReplayPage.tsx
- root/src/components/ | ReplayPlayer.tsx / ReplayModal.tsx
- root/src/lib/replay/ohlcReplayEngine.ts
- root/src/features/chart/replay.ts
- root/tests/e2e/replay.spec.ts (only if selectors/flows must change; prefer no changes)
