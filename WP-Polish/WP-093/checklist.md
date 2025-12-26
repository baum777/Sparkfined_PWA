# WP-093 Checklist — Wallet Monitoring

## Scope
- Monitored Wallet Address (with copy button)
- Enable Monitoring (toggle)
- Depends on WP-090

## Steps
- [x] Add checklist and docs placeholders
- [x] Implement Wallet Monitoring card UI + persistence
- [x] Add unit tests for monitoring toggle/copy behavior
- [x] Update docs and finalize checklist with verification results

## Acceptance Criteria
- [x] Address can be copied
- [x] Toggle persists in settings
- [x] UI clearly indicates enabled/disabled state

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
