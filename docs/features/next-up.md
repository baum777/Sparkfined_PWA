---
title: "Next-Up Features"
sources:
  - docs/pwa-audit/02_feature_catalog.md
  - src/pages/AnalyzePage.tsx
  - tests/cases/analyze-bullets-ai/ABA-UNIT-001.test.ts
  - api/market/ohlc.ts
  - src/pages/JournalPage.tsx
  - tests/cases/journal-condense-ai/JCA-UNIT-001.test.ts
  - src/pages/SignalsPage.tsx
  - src/lib/signalDb.ts
  - src/pages/ReplayPage.tsx
  - tests/unit/replay.math.test.ts
  - src/pages/NotificationsPage.tsx
  - src/sections/notifications/useAlertRules.ts
---

| Rank | Feature ID | Name | Impact | Risk | Effort | Key Gaps | Immediate Actions |
|------|------------|------|--------|------|--------|----------|-------------------|
| 1 | F-02 | Market Analyze | ⭐⭐⭐ High | ⚠️ Medium | ⏳ M | Idea packet flow depends on draft APIs, fallback tests skipped | Wire live data mocks, add contract tests for `/api/rules` + `/api/ideas`, harden AI guardrails |
| 2 | F-04 | Journal Workspace | ⭐⭐⭐ High | ⚠️ Medium | ⏳ M | Local CRUD lacks running tests, server sync unverified | Unskip journal CRUD tests, add API handler contract tests, cover AI attach flow |
| 3 | F-05 | Signal Matrix | ⭐⭐ Medium | ⚠️ High | ⏳ M | IndexedDB orchestration lacks persistence & tests | Seed signal DB fixtures, add Dexie integration tests, connect to rule evaluator |
| 4 | F-06 | Replay Lab | ⭐⭐ Medium | ⚠️ Medium | ⏳ M | OHLC fetch mocked, E2E suite skipped | Replace mock OHLC with provider call, unskip Playwright replay cases, add chart hook tests |
| 5 | F-07 | Notifications Center | ⭐⭐ Medium | ⚠️ High | ⏳ M | Push flows manual, server rules upload untested | Mock PushManager in tests, add `/api/push` contract tests, seed VAPID configuration docs |

## Iteration Workflow
1. **Pick Feature Ticket:** Open corresponding `tickets/<feature>-todo.md` and confirm scope with the team.
2. **Draft Changes:** Generate targeted patches under `patches/` (tests first, then implementation) without touching production code directly.
3. **Validate Locally:** Run checklist in `tests/checklists/<feature>.md` (unit → integration → e2e/lint/typecheck).
4. **Review Loop:** Share patches + test output. Iterate on feedback until checklist is green.
5. **PR Preparation:** Use `PR_TEMPLATE.md`, attach checklists, include telemetry/observability notes.

