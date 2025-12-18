# WP-012 — Daily Bias / Market Intel Card

## Current state snapshot
- Dashboard uses `DashboardShell` with KPIBar strip and grid/stack layout classes from `src/features/dashboard/dashboard.css`; cards share the `dashboard-card sf-card` styling.
- `DashboardPage` currently renders an `InsightTeaser` plus holdings/trades, journal snapshot, and alerts snapshot with loading/error/empty states handled inline.
- There is no existing `src/api` directory; `src/lib/config.ts` exposes `apiBaseUrl`, but no shared HTTP client is wired for dashboard intelligence.
- Shared dashboard styling relies on tokens and utilities in `dashboard.css`/`kpi.css` with CSS variables (e.g., `--sf-bg-*`, `--sf-text-*`).

## File targets
- [x] src/api/marketIntelligence.ts
- [x] src/features/dashboard/BiasTag.tsx
- [x] src/features/dashboard/DailyBiasCard.tsx
- [x] src/pages/DashboardPage.tsx
- [x] WP-Polish/WP-012/checklist.md
- [x] docs/CHANGELOG.md
- [x] docs/index.md

## Implementation steps
- [x] Step 1 — API DTO + mock fallback (required)  
  Change note: Added typed DailyBias DTO contract with sanitized fetch attempt using the shared `apiBaseUrl`, plus deterministic mock fallback payload.  
  Files: src/api/marketIntelligence.ts, WP-Polish/WP-012/checklist.md
- [x] Step 2 — BiasTag component  
  Change note: Built reusable BiasTag pill with sentiment-specific styling, scoped classes, and accessible labeling backed by dashboard token CSS.  
  Files: src/features/dashboard/BiasTag.tsx, src/features/dashboard/daily-bias.css, WP-Polish/WP-012/checklist.md
- [x] Step 3 — DailyBiasCard UI (states + actions)  
  Change note: Added DailyBiasCard with loading/error/empty handling, refreshable fetch cycle, timestamp display, and styled insights list using tokenized dashboard CSS.  
  Files: src/features/dashboard/DailyBiasCard.tsx, src/features/dashboard/daily-bias.css, WP-Polish/WP-012/checklist.md
- [x] Step 4 — Wire into DashboardPage  
  Change note: Integrated DailyBiasCard into DashboardPage across loading/error/empty paths using existing dashboard stack layout for full-width placement.  
  Files: src/pages/DashboardPage.tsx, WP-Polish/WP-012/checklist.md
- [x] Step 5 — Docs  
  Change note: Recorded WP-012 delivery in the changelog and docs index, noting API mock, BiasTag/DailyBiasCard UI, dashboard wiring, and checklist path.  
  Files: docs/CHANGELOG.md, docs/index.md, WP-Polish/WP-012/checklist.md
- [x] Step 6 — Finalize checklist  
  Change note: Recorded acceptance coverage, captured verification outcomes (lint warnings pre-existing; Playwright browsers missing), and noted final bias card refinements.  
  Files: WP-Polish/WP-012/checklist.md, src/features/dashboard/DailyBiasCard.tsx, src/features/dashboard/daily-bias.css

## Acceptance criteria
- [x] Bias tag visible and styled — BiasTag pill renders in DailyBiasCard summary with scoped `.sf-bias-tag` styles. Files: src/features/dashboard/BiasTag.tsx, src/features/dashboard/daily-bias.css
- [x] Refresh shows loading state and updates timestamp — Refresh button triggers loading skeleton and updates timestamp label/state. Files: src/features/dashboard/DailyBiasCard.tsx, src/features/dashboard/daily-bias.css
- [x] Works without backend (mock fallback) — getDailyBias provides deterministic mock payload when backend unavailable. Files: src/api/marketIntelligence.ts
- [x] Tokens only — Card and tag styling use tokenized CSS vars and dashboard utilities. Files: src/features/dashboard/daily-bias.css

## Verification
- [x] pnpm typecheck — Passed (`tsc --noEmit`). Command: pnpm typecheck
- [x] pnpm lint — Completed with existing repository warnings (unused vars, hardcoded colors) unchanged. Command: pnpm lint
- [x] pnpm test — Vitest suite passed. Command: pnpm test
- [ ] pnpm test:e2e (note prereq: pnpm exec playwright install chromium) — Fails locally because Playwright browsers are not installed; install via `pnpm exec playwright install chromium` then rerun.
