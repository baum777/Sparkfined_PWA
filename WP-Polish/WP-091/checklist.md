# WP-091 Checklist — Appearance & General

## Current state snapshot (before changes)
- Settings page shows placeholder cards for profile/preferences and backups; no appearance controls mounted.
- Theme handling exists via `ThemeProvider`/`useTheme` using `settings.themeMode` with storage key `sparkfined.settings.v1` and legacy key `sparkfined.theme.v1`.
- No dedicated Appearance card; general controls (font size, cache) are absent.

## Steps
- [x] Step 1 — AppearanceCard UI scaffold (Added new Appearance card with theme options, font size stub, and cache action UI; files: src/features/settings/AppearanceCard.tsx, src/features/settings/SettingsPage.tsx, src/features/settings/settings.css)
- [x] Step 2 — Wire theme selection (Connected theme control to ThemeProvider with immediate/persisted updates; files: src/features/settings/AppearanceCard.tsx, src/features/settings/settings.css)
- [x] Step 3 — Cache clear stub (Added guarded cache clear flow with confirmation and status copy; files: src/features/settings/AppearanceCard.tsx, src/features/settings/settings.css)
- [x] Step 4 — Docs + checklist (Documented WP-091 in changelog/index and finalized checklist; files: docs/CHANGELOG.md, docs/index.md, WP-Polish/WP-091/checklist.md)

## Acceptance criteria mapping
- [x] Theme selection works (dark/light/system)
- [x] Basic general toggles exist (stubs ok)

## Verification log
- [x] pnpm typecheck
- [x] pnpm lint (warnings pre-existing; none introduced by WP-091)
- [x] pnpm vitest run --reporter=basic
- [x] pnpm build
- [x] pnpm run check:size
- [ ] pnpm test:e2e (blocked — browsers not available in environment)
