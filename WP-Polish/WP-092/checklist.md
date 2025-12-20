# WP-092 Checklist — Token Usage (Cluster F)

## Current state snapshot (before coding)
- Settings page currently shows Appearance card plus placeholder cards (no token usage card yet).
- Legacy `SettingsContent` still includes AI Provider, model override, and token usage stats UI.
- No dedicated daily token usage helper or storage key for API call counts.
- Telemetry state exists at `src/state/telemetry.tsx` but does not track token/API usage totals.

## Steps
- [x] Step 1 — Usage helper with Berlin reset (token-usage.ts + tests) — files: src/features/settings/token-usage.ts; tests/lib/token-usage.test.ts
- [x] Step 2 — TokenUsageCard UI — files: src/features/settings/TokenUsageCard.tsx; src/features/settings/settings.css
- [x] Step 3 — Mount TokenUsageCard and remove legacy AI provider UI — files: src/features/settings/SettingsPage.tsx; src/pages/SettingsContent.tsx
- [x] Step 4 — Wire daily usage counters into usage tracking — files: src/state/telemetry.tsx
- [x] Step 5 — Docs updates — files: docs/CHANGELOG.md; docs/index.md
- [x] Finalize checklist — files: WP-Polish/WP-092/checklist.md

## Acceptance Criteria mapping
- [x] Token usage section shows “Tokens today” + “API calls today” (SettingsPage mounts TokenUsageCard displaying token and API call counts).
- [x] Resets at 00:00 local time (Europe/Berlin) (token-usage helper stores dateKey via Europe/Berlin formatter and resets on load/increments).
- [x] No other AI provider settings shown (provider/model override/max tokens/cost removed/hidden) (legacy AI provider UI wrapped behind disabled flag).

## Verification
- [x] pnpm typecheck
- [x] pnpm lint (pre-existing warnings only)
- [x] pnpm vitest run --reporter=basic
- [x] pnpm build
- [x] pnpm run check:size
- [ ] pnpm test:e2e (BLOCKED: Playwright browsers not installed in environment)
- [x] Manual reset rollover check (covered by unit test in token-usage.test.ts)
