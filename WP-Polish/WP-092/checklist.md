# WP-092 Checklist — Token Usage + TokenLock Governance

## Steps
- [x] Align checklist with governance hard rules and daily reset contract
- [x] Harden TokenLock wrapper + tests so usage commits only on real calls after lock
- [x] Finalize Token Usage card (budgets, caps, warnings, reset messaging)
- [x] Update docs and record verification outcomes

## Acceptance Criteria
- [x] Real API calls execute only after acquiring a TokenLock
- [x] Usage (tokens + apiCalls) increments **once** after a successful lock + real call completion; failures do not commit
- [x] Demo/mock paths (including lock denials) return "Example/Demo result (no API call counted)" and never change usage
- [x] Daily budgets include token + optional API-call caps; warning thresholds fixed at 80% and 95%
- [x] Per-request output token cap is clamped/enforced for real calls
- [x] Daily reset occurs at 00:00 Europe/Berlin with reset messaging in UI
- [x] Settings Token Usage card shows totals, budgets, cap detail, and 80%/95% banners; no provider/model/cost UI is visible
- [x] Governance hard rules upheld (telemetry and demo paths do not mutate usage; only `withTokenLockOrMock` commits usage)
- [x] Documentation updated with hard rule reminder and E2E install note

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
