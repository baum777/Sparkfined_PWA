# WP-094 Checklist — Data Export & Import (JSON/Markdown/Backup)

## Scope
- Data Export card (JSON/Markdown/Backup stub)
- Data Import card (validation + errors)
- Depends on WP-090

## Steps
- [x] Add checklist and docs placeholders
- [x] Implement export/import cards per WP scope
- [x] Add unit tests for export/import validation flows
- [x] Update docs and finalize checklist with verification results

## Acceptance Criteria
- [x] Export all produces a downloadable file (or stub with documented output)
- [x] Import validates and shows errors

## Verification
- [ ] pnpm typecheck
- [ ] pnpm lint
- [ ] pnpm vitest run
- [ ] pnpm build
- [ ] pnpm check:size
- [ ] pnpm test:e2e *(run if possible; otherwise mark BLOCKED with reason and include `pnpm exec playwright install chromium`)*

## E2E Status
- [ ] Playwright available → tests executed
- [ ] BLOCKED → Playwright browsers missing in container (`pnpm exec playwright install chromium` required)
