---
TAB: Replay
Allowed paths (strict):
- root/src/pages/ReplayPage.tsx
- root/src/components/ReplayPlayer.tsx
- root/src/components/ReplayModal.tsx
- root/src/lib/replay/ohlcReplayEngine.ts
- root/src/features/chart/replay.ts

Goal (conversion first):
Stabilize and polish Replay to guide users from discovery → playback → journaling with clear entry path, accessible controls, and progress tracking.

Do:
1) IF you find instability/a11y gaps blocking polish: fix obvious issues (labels, focus, semantics) where needed.
2) Apply these approved polish changes (minimal diff):
   - When no session selected, add clear "Start replay" path (symbol/time window or safe default) leading to playable replay
   - Improve playback control accessibility (labels, focus states, keyboard shortcuts where appropriate)
   - Add "Next step to mastery" CTA after replay activity: "Log insights to Journal" with prefilled context (symbol/timeframe)
   - Reduce UI noise by collapsing Session Info by default
   - Add lightweight "replay progress" cue showing what's left (e.g., "Frame X/Y • bookmarks N"), no new data sources

Guardrails:
- Keep existing `data-testid` stable: `replay-page`, `button-go-live`
- Do not add new polling/timers beyond existing replay engine behavior
- No new heavy renders; avoid re-mounting chart unnecessarily
- Avoid breaking replay E2E flows

Done when:
- Users can start replay from clear entry path without pre-existing session
- Playback controls are accessible and keyboard-friendly
- "Log insights to Journal" CTA exists and pre-fills context
- Session Info is collapsed by default and expandable
- Progress cue is visible and helpful

Output:
- Touched files list + short change summary (no long explanation).
