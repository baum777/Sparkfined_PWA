# WP-076 — Integrations (Chart → Alert, Browser Notifications)

## Current state snapshot (pre-implementation)
- Chart toolbar Alerts section includes a "Create alert" button that opens the legacy `AlertCreateDialog` (no chart → alerts prefill path).
- Alerts page (`/alerts`) opens `NewAlertSheet` only via the "New alert" button; no query/state prefill handling.
- `NewAlertSheet` has no external prefill support.
- No browser notification permission UI or push API stub exists.

## Step checklist

### Step 1 — Chart → Alerts prefill contract
- [x] Implement chart toolbar "Create alert" navigation with prefilled fields.
  - Change note: Added URL-param prefill builder and wired chart toolbar to navigate into /alerts with symbol/timeframe defaults.
  - Files touched: src/features/chart/toolbar-sections.tsx, src/features/alerts/prefill.ts

### Step 2 — Alerts page consumes prefill and opens sheet
- [x] Read prefill state, open `NewAlertSheet`, and clear one-shot params.
  - Change note: Alerts page now parses alert prefill query params, auto-opens the creation sheet, and strips one-shot params after opening.
  - Files touched: src/features/alerts/AlertsPage.tsx

### Step 3 — NewAlertSheet supports external prefill
- [x] Accept optional initial values and merge without clobbering edits.
  - Change note: NewAlertSheet now accepts optional prefill values, applies them once on open when the form is untouched, and includes unit coverage.
  - Files touched: src/features/alerts/NewAlertSheet.tsx, src/features/alerts/AlertsPage.tsx, tests/components/alerts/NewAlertSheet.test.tsx

### Step 4 — Browser notification permission flow + API stub
- [x] Add `src/api/push.ts` stub + notification permission UI.
  - Change note: Added push permission helpers + settings UI for browser notification enablement, plus unit coverage for the API stub.
  - Files touched: src/api/push.ts, src/pages/SettingsContent.tsx, tests/lib/push.test.ts

### Step 5 — Docs + checklist
- [x] Update docs and finalize checklist with verification results.
  - Change note: Documented WP-076 in changelog/index and captured verification outcomes.
  - Files touched: docs/CHANGELOG.md, docs/index.md, WP-Polish/WP-076/checklist.md

## Acceptance criteria mapping
- [x] “Create alert from chart” path exists
- [x] Browser notification permission flow documented/implemented

## Verification
- [x] pnpm typecheck
- [x] pnpm lint (existing warnings emitted)
- [x] pnpm test (CI=1)
- [x] pnpm vitest run --reporter=basic
- [ ] pnpm test:e2e (failed: Playwright browsers missing; run `pnpm exec playwright install`)
- [x] pnpm build
- [x] pnpm run check:size (warnings for optional chunks/budget checks)
