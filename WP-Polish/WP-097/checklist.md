# WP-097 Checklist — Mobile Settings (Accordion + Responsive)

## Scope
- Responsive settings layout with mobile-friendly stacking
- Accordions usable with touch targets ≥44×44px
- Depends on WP-090..WP-096

## Steps
- [x] Add checklist and docs placeholders
- [x] Implement mobile-responsive settings layout/accordions
- [x] Add unit or visual tests for responsive behavior (where feasible)
- [x] Update docs and finalize checklist with verification results

## Acceptance Criteria
- [x] Cards stack and are readable on mobile
- [x] Accordions usable with touch targets ≥44×44px

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
