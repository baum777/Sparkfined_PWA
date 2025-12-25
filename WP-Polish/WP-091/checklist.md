# WP-091 Checklist — Appearance Settings

## Scope & Goals
- Deliver a Settings Appearance card that surfaces theme selection (System/Dark/Light) using existing WP-002 tokens.
- Persist the selected theme locally so it survives reloads and reuses the shared settings/theme store.
- Apply the selected theme to CSS vars/data attributes without introducing a new theming engine.
- Capture docs, verification, and rollout notes for the appearance polish.

## Task Steps
- [x] Step 1 — Create checklist + docs placeholders
- [x] Step 2 — Implement AppearanceCard with persisted theme selection
- [x] Step 3 — Mount AppearanceCard in Settings + tokenized styling
- [x] Step 4 — Add theme persistence/apply unit coverage
- [x] Step 5 — Finalize docs, checklist, and verification notes

## Acceptance Criteria
- Theme selection surfaces System/Dark/Light choices with clear state.
- Selection persists locally and re-applies on reload via existing theme logic.
- Theme application uses existing WP-002 tokens / CSS variables (no new engine).
- Provider/AI settings UIs remain unchanged.

## Verification Plan
- pnpm typecheck
- pnpm lint
- pnpm test
- pnpm test:e2e (document if blocked by missing browsers)

## Verification Results
- ✅ `pnpm typecheck`
- ⚠️ `pnpm lint` — existing warnings in legacy files (unused vars, hardcoded colors); no new errors introduced.
- ✅ `pnpm test -- --reporter=basic`
- ❌ `pnpm test:e2e` — fails because Playwright browsers are not installed in the container (`pnpm exec playwright install` required).

## Step Log
- Step 1: Added checklist and documentation placeholders for WP-091 appearance polish.
- Step 2: Implemented AppearanceCard with System/Dark/Light options wired to the shared theme store and persisted storage helpers.
- Step 3: Mounted the AppearanceCard on SettingsPage with tokenized styling and removed the placeholder row.
- Step 4: Added unit tests covering theme resolution, DOM application, and persistence helpers.
- Step 5: Updated docs/index and docs/CHANGELOG with WP-091 notes; ran verification commands and recorded outcomes.

## Notes
- Reuse the shared theme/settings store; avoid introducing additional theme contexts.
