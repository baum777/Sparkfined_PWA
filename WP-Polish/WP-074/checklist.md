# WP-074 — Preset Templates & Import

## Current state snapshot (pre-coding)
- New alert creation relies on `FormState` with `symbol`, `type`, `condition`, `threshold`, and `timeframe` in `src/features/alerts/NewAlertSheet.tsx`.
- No alert template model or UI exists; alert creation is entirely manual.
- Alerts stylesheet (`src/features/alerts/alerts.css`) contains builder/autocomplete styles only.

## Plan & step log
- [x] Step 1 — Define template model + defaults
  - Notes: Added alert template preset type and default presets for common alert scenarios.
  - Files touched: `src/features/alerts/AlertTemplates.tsx`
- [x] Step 2 — AlertTemplates UI
  - Notes: Built templates grid UI with apply actions and stubbed import affordance.
  - Files touched: `src/features/alerts/AlertTemplates.tsx`, `src/features/alerts/alerts.css`
- [x] Step 3 — Wire templates into NewAlertSheet
  - Notes: Added template section with overwrite confirmation and unit coverage for applying presets.
  - Files touched: `src/features/alerts/NewAlertSheet.tsx`, `tests/components/alerts/NewAlertSheet.test.tsx`
- [x] Step 4 — Docs + checklist
  - Notes: Updated docs index/changelog and captured verification + AC mapping.
  - Files touched: `docs/CHANGELOG.md`, `docs/index.md`, `WP-Polish/WP-074/checklist.md`

## Acceptance criteria mapping
- [x] Apply a template to prefill new alert.

## Verification
- [x] `pnpm typecheck`
- [x] `pnpm lint` (warnings present in existing files)
- [ ] `pnpm test` (vitest watch mode; cancelled after initial run)
- [x] `pnpm vitest run --reporter=basic`
- [x] `pnpm build`
- [x] `pnpm run check:size`
- [ ] `pnpm test:e2e` (Playwright browsers missing in environment)
