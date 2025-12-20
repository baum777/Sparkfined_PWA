# WP-072 — New Alert Modal/Sheet (Autocomplete + Conditions)

## Current state snapshot (pre-work)
- Alerts page renders the desktop list scaffold with alert cards, filters, and mock-backed loading/empty/error states.
- Alert creation exists elsewhere via `AlertCreateDialog`, but the alerts page has no dedicated new alert sheet.
- Alerts API supports list + status/delete actions via deterministic mock data.

## File targets
- CREATE `src/features/alerts/NewAlertSheet.tsx`
- CREATE `src/features/alerts/SymbolAutocomplete.tsx`
- MODIFY `src/features/alerts/AlertsPage.tsx`
- MODIFY `src/api/alerts.ts`
- MODIFY `src/features/alerts/alerts.css`
- MODIFY `docs/CHANGELOG.md`
- MODIFY `docs/index.md`
- CREATE `WP-Polish/WP-072/checklist.md`

## Steps
- [x] Step 1 — Symbol autocomplete (keyboard + touch friendly)
  - Change note: added deterministic symbol autocomplete input with listbox navigation and tests.
  - Files touched: `src/features/alerts/SymbolAutocomplete.tsx`, `tests/components/alerts/SymbolAutocomplete.test.tsx`, `WP-Polish/WP-072/checklist.md`
- [x] Step 2 — NewAlertSheet scaffold (form fields + validation)
  - Change note: added alert creation sheet with condition builder, validation, and unit coverage.
  - Files touched: `src/features/alerts/NewAlertSheet.tsx`, `tests/components/alerts/NewAlertSheet.test.tsx`
- [x] Step 3 — createAlert mock API + optimistic add
  - Change note: added create alert mock endpoint with validation and wired sheet submit flow for optimistic creation.
  - Files touched: `src/api/alerts.ts`, `src/features/alerts/NewAlertSheet.tsx`, `tests/components/alerts/NewAlertSheet.test.tsx`
- [x] Step 4 — AlertsPage entry point + sheet wiring
  - Change note: added alerts page CTA, sheet mount, and optimistic list insertion for new alerts.
  - Files touched: `src/features/alerts/AlertsPage.tsx`
- [x] Step 5 — Tokenized styling + a11y pass
  - Change note: added tokenized sheet/autocomplete styles and accessibility labels for select fields.
  - Files touched: `src/features/alerts/alerts.css`, `src/features/alerts/NewAlertSheet.tsx`
- [x] Step 6 — Docs + finalize checklist
  - Change note: updated docs index/changelog and refreshed checklist status.
  - Files touched: `docs/CHANGELOG.md`, `docs/index.md`, `WP-Polish/WP-072/checklist.md`

## Acceptance criteria mapping
- [x] Opens from FAB/menu and Alerts page
- [x] Validates required fields
- [x] Saves via mock API

## Verification
- [x] `pnpm typecheck`
- [x] `pnpm lint`
- [x] `pnpm vitest run --reporter=basic`
- [x] `pnpm build`
- [x] `pnpm run check:size`
- [ ] `pnpm test:e2e` (only if stable)

Notes:
- `pnpm test:e2e` failed because Playwright browsers are not installed. First failing spec: `tests/e2e/alerts/alerts.flows.spec.ts:22:3` with `browserType.launch: Executable doesn't exist at /root/.cache/ms-playwright/chromium_headless_shell-1194/chrome-linux/headless_shell`.
