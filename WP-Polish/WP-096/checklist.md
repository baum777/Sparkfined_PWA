# WP-096 Checklist — Danger Zone (Accordion)

## Scope
- Danger Zone accordion with destructive actions grouped
- Default collapsed with confirmation step
- Depends on WP-090

## Steps
- [x] Add checklist and docs placeholders
- [x] Implement Danger Zone accordion with confirmation
- [x] Add unit tests for accordion + confirmations
- [x] Update docs and finalize checklist with verification results

## Acceptance Criteria
- [x] Collapsed by default
- [x] Expands to show destructive actions
- [x] Requires confirmation step for destructive actions

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
