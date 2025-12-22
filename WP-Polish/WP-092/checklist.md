# WP-092 Checklist — Token Usage (Cluster F)

## Current state snapshot (before coding)
- Settings page shows the newer SettingsPage with Appearance and TokenUsage cards plus placeholder cards.
- Legacy `SettingsContent` still includes AI Provider, model override, and token usage stats UI.
- Daily token usage helper exists but requires guardrails to avoid non-real increments.
- Telemetry was incrementing usage counters on `api.*` events instead of relying on real-call commits.

## Steps
- [x] Step 1 — Usage helper with Berlin reset (token-usage.ts + tests) — files: src/features/settings/token-usage.ts; tests/lib/token-usage.test.ts
- [x] Step 2 — TokenUsageCard UI — files: src/features/settings/TokenUsageCard.tsx; src/features/settings/settings.css
- [x] Step 3 — Mount TokenUsageCard and remove legacy AI provider UI — files: src/features/settings/SettingsPage.tsx; src/pages/SettingsContent.tsx
- [x] Step 4 — Lock-guarded usage commits after real calls — files: src/lib/ai/withTokenLockOrMock.ts; src/lib/aiClient.ts
- [x] Step 5 — Docs updates — files: docs/CHANGELOG.md; docs/index.md
- [x] Finalize checklist — files: WP-Polish/WP-092/checklist.md

## Acceptance Criteria mapping
- [x] Token usage section shows “Tokens today” + “API calls today” (SettingsPage mounts TokenUsageCard displaying token and API call counts with budgets).
- [x] Resets at 00:00 local time (Europe/Berlin) (token-usage helper stores dateKey via Europe/Berlin formatter and resets on load/increments).
- [x] No other AI provider settings shown (provider/model override/max tokens/cost removed/hidden) (legacy AI provider UI wrapped behind disabled flag).
- [x] Usage increments only after TokenLock real-call commits; demo paths never increment (withTokenLockOrMock + unit tests).
- [x] 80/95% thresholds surface inline warnings in TokenUsageCard (visual banner, budget context rendered).

## Verification
- [x] pnpm typecheck
- [x] pnpm lint (pre-existing warnings only)
- [x] pnpm vitest run --reporter=basic
- [x] pnpm build
- [x] pnpm run check:size
- [ ] pnpm test:e2e (BLOCKED: Playwright browsers not installed; run `pnpm exec playwright install chromium`)
- [x] Manual reset rollover check (covered by unit test in token-usage.test.ts)
