---
title: "F-02 Market Analyze — Production Readiness"
sources:
  - src/pages/AnalyzePage.tsx
  - api/market/ohlc.ts
  - tests/unit/priceAdapter.fallback.test.ts
  - tests/cases/analyze-bullets-ai/ABA-UNIT-001.test.ts
  - tests/cases/analyze-bullets-ai/ABA-SMOKE-020.test.tsx
  - tests/e2e/board-a11y.spec.ts
---

## Kontext
- Analyze dashboard orchestrates OHLC fetch, KPI cards, AI bullet generation, and idea packet automation.
- Data pipeline depends on `/api/market/ohlc`, `/api/rules`, `/api/ideas`, `/api/journal`.
- Current gaps: idea packet flow lacks tests, fallback Playwright specs are skipped, no contract coverage for rule/idea APIs, AI cost guards rely on environment without enforcement tests.

## Blocker
1. Missing integration tests for `/api/rules` and `/api/ideas` to guarantee payload normalization.
2. Playwright coverage for Analyze page skipped outside CI seed.
3. AI guardrails (`maxCostUsd`, secret handling) untested at proxy layer.

## Tasks
- [ ] Restore & extend ABA integration suite:
  - [ ] Add msw or vi-fetch mocks for `/api/rules`, `/api/ideas`, `/api/journal`.
  - [ ] Re-enable `ABA-INTEG-010`, `ABA-PERF-050`, `ABA-SEC-060` with deterministic fixtures.
- [ ] Add contract tests for backend endpoints:
  - [ ] `/api/rules` POST (create/update/delete) with validation assertions.
  - [ ] `/api/ideas` POST (create + link updates).
  - [ ] `/api/journal` AI attach flow (ensures sanitization + compute metrics).
- [ ] Introduce service tests for `ai/assist` proxy covering:
  - [ ] Cost-cap rejection
  - [ ] Cache hit path
  - [ ] Secret enforcement (401/503 branches)
- [ ] Add Analyze page Playwright smoke (seeded or mocked) verifying:
  - [ ] KPI cards show live data from mocked API
  - [ ] One-click idea packet writes rule + journal + idea
  - [ ] Observability event enqueued (`user.idea.packet`)
- [ ] Document environment requirements (`AI_PROXY_SECRET`, `MORALIS_API_KEY`, `DATA_PROXY_SECRET`) in `.env.example` comments referencing this feature.

## Acceptance Criteria
- All Vitest suites under `tests/cases/analyze-bullets-ai` pass without `skip`.
- New backend contract tests pass and run as part of `pnpm test`.
- Analyze Playwright smoke scenario runs green in CI with mocks.
- No regressions in `priceAdapter` fallback tests.
- Observability coverage: telemetry event recorded during idea packet creation.

## Validation
- `pnpm vitest --run --testNamePattern="ABA"`
- `pnpm vitest --run --testNamePattern="api rules|api ideas"`
- `pnpm playwright test analyze`
- `pnpm lint src/pages/AnalyzePage.tsx api/market/ohlc.ts`
- `pnpm typecheck --filter analyze`

