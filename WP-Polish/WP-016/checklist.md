# WP-016 — Quick Actions (FAB) Checklist

## Current state snapshot
- Bottom navigation uses `bottom-nav.css` with `--sf-bottom-nav-height` and `--sf-bottom-nav-safe-area` plus responsive canvas padding for safe-area spacing.
- Dashboard page already opens the Log Entry overlay via `LogEntryOverlayPanel` and `handleOpenLogEntryOverlay` (refreshes inbox before opening).
- Alerts creation uses `AlertCreateDialog` (RightSheet) controlled via local `isOpen` state on Alerts page; no global trigger yet on dashboard.
- No existing floating action button pattern; mobile actions currently rely on header buttons.

## File targets
- [x] `src/features/dashboard/FAB.tsx`
- [ ] `src/features/dashboard/FABMenu.tsx`
- [x] `src/features/dashboard/fab.css`
- [ ] `src/pages/DashboardPage.tsx`
- [ ] Documentation updates (`docs/CHANGELOG.md`, `docs/index.md`)

## Implementation steps
- [x] Step 1 — FAB base component (positioning + safe-area)
  - Added mobile-only FAB component with safe-area aware positioning and accessible button hit target. Files: `src/features/dashboard/FAB.tsx`, `src/features/dashboard/fab.css`.
- [x] Step 2 — FABMenu (open/close, outside click, ESC)
  - Implemented quick actions menu with outside click + ESC close handling and keyboard focus on open. Files: `src/features/dashboard/FABMenu.tsx`, `src/features/dashboard/fab.css`.
- [x] Step 3 — Wire actions (Log entry + Create alert)
  - Connected menu actions to log entry overlay and alert creation sheet, ensuring menu closes after selection. Files: `src/pages/DashboardPage.tsx`, `src/features/dashboard/FABMenu.tsx`.
- [x] Step 4 — Mount on Dashboard (mobile only)
  - Mounted FAB and menu on the dashboard with fixed positioning, mobile media query hiding, and pointer-event safeguards. Files: `src/pages/DashboardPage.tsx`, `src/features/dashboard/fab.css`.
- [x] Step 5 — Docs updates
  - Logged WP-016 delivery in changelog and docs index with file touchpoints and checklist reference. Files: `docs/CHANGELOG.md`, `docs/index.md`.
- [x] Step 6 — Finalize checklist
  - Recorded acceptance, verification, and token-only gradient adjustment alongside final notes. Files: `WP-Polish/WP-016/checklist.md`, `src/features/dashboard/fab.css`.

## Acceptance criteria
- [x] FAB visible on mobile
- [x] Menu opens/closes reliably
- [x] Actions wired (Log entry + Create alert)
- [x] Tokens only

## Verification
- [x] pnpm typecheck
  - Passed.
- [x] pnpm lint
  - Completed with existing warnings in unrelated files (unused vars, hardcoded colors) unchanged.
- [x] pnpm test / pnpm vitest run
  - `pnpm vitest run --reporter basic` completed; warnings from existing tests (router futures, mocked failures) observed.
- [ ] pnpm test:e2e (or document prerequisite)
  - Not run; Playwright binaries not installed in this environment.
