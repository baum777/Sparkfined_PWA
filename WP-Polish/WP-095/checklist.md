# WP-095 Checklist — Chart & App Preferences

## Scope
- PreferencesCard with basic chart/app preference toggles
- Persistence of selections
- Depends on WP-090

## Steps
- [x] Add checklist and docs placeholders
- [x] Implement preferences UI + persistence
- [x] Add unit tests for preference persistence
- [x] Update docs and finalize checklist with verification results

## Acceptance Criteria
- [x] Basic preferences toggle/radio UI exists and persists

## Verification
- [x] pnpm typecheck
- [x] pnpm lint
- [x] pnpm vitest run
- [x] pnpm build
- [ ] pnpm check:size
- [ ] pnpm test:e2e *(run if possible; otherwise mark BLOCKED with reason and include `pnpm exec playwright install chromium`)*

## E2E Status
- [ ] Playwright available → tests executed
- [x] BLOCKED → Playwright browsers missing in container (`pnpm exec playwright install chromium` required)
