# UI Redesign Plan (All Pages) — Sparkfined

## Goal
Redesign the entire UI into a cohesive "Sparkfined Terminal / Pro-Trader" system:
- consistent layout, spacing, typography
- compact, scannable lists (no empty debug tables)
- right-side "Action Sheet" pattern (420px) instead of broken overlays
- safe confirm flows for destructive actions
- user-friendly loading/empty/error states (no raw JSON parse errors)

## Constraints
- No new UI libraries unless already present.
- Prefer re-using existing sf-* shell styles/components.
- Keep business logic intact; refactor UI composition only.
- Do not remove existing features (export, monitoring, AI budget, etc).

## Phase 0: Route & Page Inventory (must-do)
Codex must:
1) Locate router definitions (e.g. src/router*, routes array, AppShell nav config).
2) Produce a list of all routes/pages.
3) For each page, mark target module file below (Dashboard, Chart, Journal, Alerts, Settings, plus any extra pages).
4) Ensure every discovered page is either:
   - covered by an existing module task, or
   - gets a mini-subtask inside 08-A11Y-POLISH.md under "Additional Pages".

## Definition of Done (global)
- Visual: pages use the new layout primitives (Container/Card/SectionHeader/ListRow).
- UX: overlays use Right Sheet or Modal (no stacking overlap).
- A11y: keyboard navigation, focus states, aria for dialogs/sheets.
- Error handling: no raw `Unexpected token '<'` rendered; show friendly panel + details toggle.
- Tests: pnpm typecheck, pnpm lint, unit tests relevant to touched components.

## Execution order
1) 01-FOUNDATION
2) 02-APP-SHELL
3) 03-DASHBOARD
4) 04-CHART
5) 05-JOURNAL
6) 06-ALERTS
7) 07-SETTINGS
8) 08-A11Y-POLISH

## Phase 0 — Route Inventory (done)
- App Shell routes: dashboard (/dashboard), chart (/chart, /analysis, /analyze), journal (/journal), alerts (/alerts), settings (/settings)
- Additional routes to align in Phase 08: landing (/landing), watchlist (/watchlist), replay (/replay, /replay/:sessionId), notifications (/notifications), signals (/signals), lessons (/lessons), oracle (/oracle), icons (/icons), dev showcases (/styles, /ux)
- Redirects: /board, /dashboard-v2, /watchlist-v2, /analysis-v2, /journal-v2, /alerts-v2, /chart-v2, /settings-v2 → canonical paths
