# WP-092 Checklist — Token Usage + TokenLock + Limits

## Steps
- [x] Add checklist and documentation placeholders
- [x] Implement token usage store with Europe/Berlin daily reset
- [x] Add TokenLock enforcement wrapper and tests
- [x] Gate AI actions behind TokenLock with demo-mode UX
- [x] Add Settings token usage card and limits display
- [x] Finalize docs and verification outputs

## Acceptance Criteria
- [x] Real API calls execute only after acquiring a TokenLock
- [x] apiCallsToday increments only after a successful lock and call
- [x] Without TokenLock, actions return demo/mock output without incrementing usage
- [x] Demo/mock paths never commit usage (covered by unit tests)
- [x] Daily reset occurs at 00:00 Europe/Berlin based on local day key
- [x] Per-request output token cap is enforced by clamping
- [x] Daily budgets block lock acquisition when exceeded; warning thresholds surface at 80% and 95%
- [x] Warning thresholds fixed at 80% and 95%; demo note is consistent
- [x] Settings show token usage card; no provider/model override UI exposed
- [x] Documentation updated for WP-092

## Verification
- [x] pnpm typecheck
- [x] pnpm lint
- [x] pnpm vitest run
- [x] pnpm build
- [x] pnpm check:size
- [ ] pnpm test:e2e *(only if Playwright available; otherwise mark BLOCKED with reason)*

## E2E Status
- [ ] Playwright available → tests executed
- [x] BLOCKED → Playwright browsers missing in container (`pnpm exec playwright install` required)
