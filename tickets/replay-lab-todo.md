---
title: "F-06 Replay Lab — Production Readiness"
sources:
  - src/pages/ReplayPage.tsx
  - src/lib/ReplayService.ts
  - tests/unit/replay.math.test.ts
  - tests/e2e/replay.spec.ts
  - src/components/ReplayPlayer.tsx
---

## Kontext
- Replay Lab mixes chart playback, bookmarks, pattern dashboard and integrations with journal entries.
- OHLC data currently mocked; Playwright suite entirely skipped; ReplayService lacking persistence tests.

## Blocker
1. Fetch layer `cacheOhlcData` uses TODO mocks → no live data path.
2. E2E tests disabled, so keyboard controls & bookmarks unverified.
3. Replay session persistence lacks tests (Dexie or local storage).

## Tasks
- [ ] Implement provider-backed OHLC fetch (reuse `marketOhlc` or share `priceAdapter`).
- [ ] Add Vitest tests for `ReplayService`:
  - [ ] `listSessions`, `getSession`, `updateSession`, `addBookmark`, `deleteBookmark`.
  - [ ] Cache invalidation after OHLC fetch.
- [ ] Enable Playwright suite:
  - [ ] Seed replay session fixture.
  - [ ] Cover open modal from journal, arrow scrubbing, shift scrubbing, zoom wheel.
- [ ] Add integration test for `JournalService` ↔ `ReplayService` link (ensures chart snapshot persists).
- [ ] Telemetry coverage: ensure bookmark actions emit `user.bookmark.add`.
- [ ] Document expected environment/config for replay dataset.

## Acceptance Criteria
- No `TODO` mock in `ReplayPage.tsx`.
- Replay unit tests cover persistence & math (existing math tests remain green).
- Playwright replay spec runs without `skip`.
- Replay actions emit telemetry events (asserted via spy).
- Documentation updated with seeding instructions.

## Validation
- `pnpm vitest --run --testNamePattern="replay"`
- `pnpm playwright test replay`
- `pnpm lint src/pages/ReplayPage.tsx src/lib/ReplayService.ts`
- `pnpm typecheck --filter replay`

