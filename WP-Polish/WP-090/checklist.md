# WP-090 Checklist — Settings Structure + PWA Update

## Scope & Goals
- Restructure SettingsPage with a dedicated header (title/subtitle/actions) and card-stack layout.
- Ship an in-app PWA update control with clear status states (Idle → Checking → Available → Updating → Updated/Error).
- Ensure `/settings` is wired in the router and navigation surfaces the entry.
- Capture documentation + verification outcomes for the refresh.

## Task Steps
- [x] Step 1 — Create checklist + docs placeholders
- [x] Step 2 — Implement SettingsPage structure and card stack
- [x] Step 3 — Add PWA in-app update helper + card
- [x] Step 4 — Wire /settings route + navigation entrypoint
- [x] Step 5 — Finalize docs, checklist, and verification notes

## Acceptance Criteria
- Settings page renders header/subheader/actions and stacks tokenized cards. ✅
- PWA update card shows Idle/Checking/Available/Updating/Updated/Error states and can trigger skipWaiting + reload. ✅
- `/settings` route is reachable via router + navigation entry. ✅

## Verification Plan
- pnpm typecheck
- pnpm lint
- pnpm vitest run --reporter=basic
- pnpm build
- pnpm run check:size
- pnpm test:e2e (if browsers installed; note if blocked)

## Verification Results
- ✅ `pnpm typecheck`
- ⚠️ `pnpm lint` — exits with existing warnings in legacy files (unused vars, token usage).
- ✅ `pnpm vitest run --reporter=basic`
- ✅ `pnpm build`
- ⚠️ `pnpm run check:size` — budgets pass but bundle warns about missing optional chunk patterns.
- ❌ `pnpm test:e2e` — fails because Playwright browsers are not installed in the container (`pnpm exec playwright install` required).

## Step Log
- Step 1: Added checklist + docs placeholders to track the WP-090 refresh (`WP-Polish/WP-090/checklist.md`, `docs/index.md`, `docs/CHANGELOG.md`).
- Step 2: Restructured SettingsPage with hero header, pill metadata row, and tokenized card stack for workspace/data safety sections (`src/features/settings/SettingsPage.tsx`, `src/features/settings/settings.css`).
- Step 3: Moved the PWA update helper to `src/lib/pwa/update.ts` and refreshed the PwaUpdateCard status copy + last-checked hint (`src/features/settings/PwaUpdateCard.tsx`).
- Step 4: Surfaced the Settings entry in the mobile bottom navigation for direct access to `/settings` (`src/features/shell/BottomNavBar.tsx`).

## Notes
- Keep existing styling tokenized; avoid new global config changes.
