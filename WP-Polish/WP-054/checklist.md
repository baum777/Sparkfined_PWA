# WP-054 Checklist — Replay & Controls (Speed, Export)

## Current state snapshot (pre-check)
- Spec location: `tasks/WP-polish/UI_&_UX_polish.md` (Cluster D, WP-054).
- Chart top bar state: `src/features/chart/ChartTopBar.tsx` has timeframe buttons + Refresh/Replay/Export buttons with no state.
- URL sync model: `src/features/chart/ChartLayout.tsx` syncs `timeframe` via `useSearchParams` and updates `timeframe/address/symbol/network` on change.
- Existing replay/export utilities:
  - Replay page + engine: `src/pages/ReplayPage.tsx`, `src/lib/replay/ohlcReplayEngine` (replay domain).
  - Snapshot/export helpers: `src/db/chartSnapshots.ts` (`exportChartSnapshotsJSON`), `src/lib/export/*` (journal/app data export).

## Steps
- [x] Step 1 — Replay state helpers (create `src/features/chart/replay.ts` types/helpers).
- [x] Step 2 — TopBar replay UI (toggle, speed control, “Replay: On” indicator).
- [x] Step 3 — Export action (interaction-lazy import, loading + feedback, document output).
- [x] Step 4 — Docs + checklist finalization (`docs/CHANGELOG.md`, `docs/index.md`).

## Acceptance criteria mapping
- [x] Replay toggle + speed controls present.
- [x] Export action produces a file or stub output (documented).

## Verification
- [x] `pnpm typecheck`
- [x] `pnpm lint` (warnings pre-existing in repo)
- [x] `pnpm vitest run --reporter=basic`
- [x] `pnpm build` (no MORALIS_API_KEY warning)
- [x] `pnpm run check:size`
- [ ] `pnpm test:e2e` (blocked: Playwright browsers missing)

## Change log
- Step 1 notes: Added replay state types/helpers + tests. Files: `src/features/chart/replay.ts`, `tests/lib/replay.test.ts`.
- Step 2 notes: Added replay toggle/speed UI and indicator in top bar. Files: `src/features/chart/ChartTopBar.tsx`, `src/features/chart/chart.css`.
- Step 3 notes: Added dynamic export (JSON stub with symbol/timeframe/replay state) + tests. Files: `src/features/chart/ChartTopBar.tsx`, `src/features/chart/chartExport.ts`, `src/features/chart/chart.css`, `tests/lib/chartExport.test.ts`.
- Step 4 notes: Updated docs index/changelog, finalized checklist, and adjusted check-env env loading/verbosity to avoid local MORALIS warnings. Files: `docs/CHANGELOG.md`, `docs/index.md`, `WP-Polish/WP-054/checklist.md`, `scripts/check-env.js`.
