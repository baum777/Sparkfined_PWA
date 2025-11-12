---
title: "Tests & Observability Gaps"
summary: "Snapshot of automated coverage and monitoring posture."
sources:
  - package.json
  - tests/README.md
  - tests/event-test-matrix.md
  - src/lib/TelemetryService.ts
  - src/diagnostics/crash-report.ts
  - telemetry/README.md
---

### Existing Coverage
- **Unit / Component:** `vitest` suites under `tests/unit` and `tests/integration` exercise chart utilities, state stores, onboarding flows.
- **E2E:** Playwright specs in `tests/e2e` with accessibility (`@axe-core/playwright`) hooks; covers landing, board navigation, journal CRUD smoke.
- **Event Matrix:** `tests/event-test-matrix.md` outlines expected events vs. test cases.
- **Scripts:** `pnpm test`, `pnpm test:e2e`, `pnpm lint`, `pnpm typecheck`, `pnpm analyze` documented in README.

### Observability
- `TelemetryService` queues metrics locally, flushes via `/api/telemetry`; respects opt-in toggle stored in settings state.
- Crash report module captures console logs, device data, SW status, and posts to `/api/diagnostics` (endpoint placeholder).
- Token usage tracked via `aiContext` for cost awareness (UI overlay + settings panel).

### Gaps & Recommendations
1. **Offline Mode Testing** — no automated coverage for IndexedDB sync paths (`offline-sync.ts`). Add Playwright offline scenarios validating board/journal caches.
2. **Push Notifications** — worker logic (`public/push/sw.js`) lacks integration tests; add service worker unit tests or mocked push events.
3. **Security Regression** — Access gating + wallet mock untested. Introduce contract tests for `/access` API responses and gating fallback.
4. **Telemetry Consent** — ensure opt-out disables network posts; add tests verifying no `fetch` when disabled.
5. **AI Cost Guardrails** — add assertions for `maxOutputTokens` and `maxCostUsd` propagation within `/api/ai/assist` proxy.

