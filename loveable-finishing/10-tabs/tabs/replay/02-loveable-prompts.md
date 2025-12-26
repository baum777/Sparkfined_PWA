## Replay — 02 Loveable Prompts

### Prompt V0 (1:1 existing UI)

**Tab scope**: Replay  
**Component scope**: Replay page + player controls + existing chart integration (no behavior changes)

**Allowed paths (strict)**:
- root/src/pages/ReplayPage.tsx
- root/src/components/ | ReplayPlayer.tsx / ReplayModal.tsx
- root/src/lib/replay/ohlcReplayEngine.ts
- root/src/features/chart/replay.ts

**Task (atomic)**:
Reproduce and stabilize the existing Replay UI without changing behavior. Fix only obvious a11y/consistency issues (labels, focus, semantics) and avoid unrelated diffs.

**UI atoms / patterns to use**:
- Existing `DashboardShell`, `StateView`, `Button`, chart patterns already used in Replay
- Keep existing `data-testid` stable (`replay-page`, `button-go-live`).

**Guardrails**:
- No new timers/intervals beyond existing replay engine behavior.
- No new heavy renders; avoid re-mounting the chart unnecessarily.
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Replay renders and behaves the same as before.
- Keyboard focus is visible on the primary controls.

---

### Prompt V1 (polish — implement approved changes with minimal diff)

**Tab scope**: Replay  
**Component scope**: Empty state entry path + player control a11y + post-replay journaling CTA + session info density

**Allowed paths (strict)**:
- root/src/pages/ReplayPage.tsx
- root/src/components/ReplayPlayer.tsx

**Task (atomic)**:
Implement the approved Replay polish changes:
1) When no session is selected, add a clear “Start replay” path (symbol/time window or a safe default) that leads to a playable replay.
2) Improve playback control accessibility (labels, focus states, keyboard shortcuts where appropriate).
3) Add a “Next step to mastery” CTA after replay activity: “Log insights to Journal” with prefilled context (symbol/timeframe).
4) Reduce UI noise by collapsing Session Info by default.

**UI atoms / patterns to use**:
- Existing cards/panels and buttons already used in Replay
- Existing “empty state” pattern (`StateView`) for the start entry path

**Guardrails**:
- No edits outside Allowed paths.
- Do not add new polling/timers.
- Keep existing `data-testid` stable; avoid breaking replay E2E flows.
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Users can start replay from a clear entry path without a pre-existing session.
- Playback controls are accessible and keyboard-friendly.
- A “Log insights to Journal” CTA exists and pre-fills context.
- Session Info is collapsed by default and expandable.

---

### Prompt V2 (polish + micro-upgrade — still incremental)

**Tab scope**: Replay  
**Component scope**: Same as V1, plus one small usability micro-upgrade

**Allowed paths (strict)**:
- root/src/pages/ReplayPage.tsx
- root/src/components/ReplayPlayer.tsx

**Task (atomic)**:
Apply V1 improvements, then add one micro-upgrade:
- Add a lightweight “replay progress” cue that helps users know what’s left (e.g., “Frame X/Y • bookmarks N”) without adding new data sources.

**UI atoms / patterns to use**:
- Existing meta text styles used in `ReplayPlayer` header

**Guardrails**:
- Exactly one new cue element; no clutter.
- No new timers/intervals.
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Progress cue is visible and helpful, without changing core behavior.
