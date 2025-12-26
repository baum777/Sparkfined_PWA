awaiting user confirmation

## Watchlist — 02 Loveable Prompts

### Prompt V0 (1:1 existing UI)

**Tab scope**: Watchlist  
**Component scope**: Watchlist page layout + table + detail panel (no behavior changes)

**Allowed paths (strict)**:
- root/src/pages/ | WatchlistPage.tsx
- root/src/components/watchlist/*
- root/src/store/watchlistStore.ts

**Task (atomic)**:
Reproduce and stabilize the existing Watchlist UI without changing behavior. Fix only obvious a11y/consistency issues (focus states, button labels, semantics) and avoid any performance regressions.

**UI atoms / patterns to use**:
- Existing `DashboardShell`, `StateView`, `Card`, `ResponsiveTable`
- Keep `data-testid` selectors intact (`watchlist-*`, `button-open-chart`, `button-open-replay-from-watchlist`)

**Guardrails**:
- No unrelated diffs; no refactors.
- No changes to quote fetching behavior.
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Watchlist renders and behaves the same as before.
- Keyboard focus is visible on filters, sort, and row selection.
- All existing E2E selectors remain valid.

---

### Prompt V1 (polish — implement approved changes with minimal diff)

**Tab scope**: Watchlist  
**Component scope**: Detail panel CTA hierarchy + trend indicator + URL selection sync + empty state copy

**Allowed paths (strict)**:
- root/src/pages/ | WatchlistPage.tsx
- root/src/components/watchlist/ | WatchlistTable.tsx / WatchlistDetailPanel.tsx

**Task (atomic)**:
Implement the approved Watchlist polish changes:
1) Make “Analyze in Chart” the primary CTA in the detail panel; keep Replay secondary.
2) Replace/augment the trend dot with a compact “Trend” pill and include relevance % when available.
3) Persist selected symbol in the URL query params and preselect on load.
4) Improve empty state guidance to “Discover → Add → Track” (degen → mastery activation).

**UI atoms / patterns to use**:
- Existing button styles (`btn btn-outline btn-sm`) and card layout
- Existing `StateView` for empty states

**Guardrails**:
- No edits outside Allowed paths.
- Do not rename existing `data-testid` attributes.
- Avoid URL/state infinite loops; update query params only when selection changes.
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Detail panel has one obvious primary CTA (“Analyze in Chart”), and Replay remains available.
- Trend rows show a compact, readable indicator and relevance % when present.
- URL sync works:
  - selecting a row updates a query param
  - loading with that param preselects the row.
- Empty state copy clearly points to Discover/Add and remains compact.

---

### Prompt V2 (polish + micro-upgrade — still incremental)

**Tab scope**: Watchlist  
**Component scope**: Same as V1, plus one small conversion micro-upgrade

**Allowed paths (strict)**:
- root/src/pages/ | WatchlistPage.tsx
- root/src/components/watchlist/*

**Task (atomic)**:
Apply V1 improvements, then add one micro-upgrade that increases conversion without scope creep:
- Add a small “Next step to mastery” line in the detail panel that nudges the user after selecting an asset (e.g., “Open Chart → Mark levels → Log in Journal”), without adding new actions or routes.

**UI atoms / patterns to use**:
- Existing subtitle/meta text styles already used in the detail panel

**Guardrails**:
- Exactly one new cue line; keep the detail panel uncluttered.
- No new network calls or timers.
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Adds one small cue line that improves clarity without adding clutter.
- Existing flows and selectors remain intact.
