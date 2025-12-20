# WP-071 — Alert Card Design & Actions

## Current state snapshot (pre-work)
- Alerts page uses feature scaffold (`src/features/alerts/AlertsPage.tsx`) with placeholder list rows.
- Alerts list uses typed mock-backed API (`src/api/alerts.ts`) with loading/empty/error states.
- Alerts styling lives in `src/features/alerts/alerts.css` with tokens-only layout and list row styles.

## File targets
- CREATE `src/features/alerts/AlertCard.tsx`
- MODIFY `src/features/alerts/AlertsPage.tsx`
- MODIFY `src/api/alerts.ts`
- MODIFY `src/features/alerts/alerts.css`
- MODIFY `docs/CHANGELOG.md`
- MODIFY `docs/index.md`
- CREATE `WP-Polish/WP-071/checklist.md`

## Steps
- [x] Step 1 — AlertCard UI skeleton (symbol, condition, status pill, actions area)
  - Change note: added AlertCard component structure with metadata and action buttons.
  - Files touched: `src/features/alerts/AlertCard.tsx`, `WP-Polish/WP-071/checklist.md`
- [x] Step 2 — Wire AlertCard into AlertsPage list rendering
  - Change note: wired AlertCard into alerts list rendering with stable test ids.
  - Files touched: `src/features/alerts/AlertsPage.tsx`
- [x] Step 3 — Optimistic actions + API hooks (pause/resume, delete, rollback)
  - Change note: added optimistic status/delete handling with rollback messaging, mock API action endpoints, and alert card coverage.
  - Files touched: `src/features/alerts/AlertsPage.tsx`, `src/api/alerts.ts`, `tests/components/alerts/AlertCard.test.tsx`
- [x] Step 4 — Tokens-only styling, focus-visible, 44px touch targets
  - Change note: styled alert cards, status pills, and action buttons with tokenized colors and touch sizing.
  - Files touched: `src/features/alerts/alerts.css`
- [x] Step 5 — Docs + finalize checklist
  - Change note: documented WP-071 in docs index/changelog and finalized checklist.
  - Files touched: `docs/CHANGELOG.md`, `docs/index.md`, `WP-Polish/WP-071/checklist.md`

## Acceptance criteria mapping
- [x] Card shows symbol, condition, status, actions (pause/delete)
- [x] Optimistic UI with rollback on failure (mock ok)

## Verification
- [x] `pnpm typecheck`
- [x] `pnpm lint`
- [x] `pnpm vitest run --reporter=basic`
- [x] `pnpm build`
- [x] `pnpm run check:size`
- [ ] `pnpm test:e2e` (only if stable)

Notes:
- `pnpm test:e2e` failed because Playwright browsers are not installed (`pnpm exec playwright install`). First failing spec: `tests/e2e/alerts/alerts.flows.spec.ts:22:3`.
