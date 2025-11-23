---
title: "F-07 Notifications Center — Production Readiness"
sources:
  - src/pages/NotificationsPage.tsx
  - src/sections/notifications/useAlertRules.ts
  - api/push.ts
  - src/server/push/handlers.ts
  - api/rules/index.ts
---

## Kontext
- Notifications Center manages local alert presets, server rule sync, and push subscription flows (VAPID).
- Push handler endpoints exist but lack automated coverage; PushManager interactions not mocked.
- Server rule upload/export flows rely on optimistic fetch without retries or validation.

## Blocker
1. No tests for `useAlertRules` store (create/update/remove flows).
2. `/api/push?action=*` endpoints untested; VAPID key path unverified.
3. PushManager + subscription error handling lacks coverage; UI surfaces manual alerts only.

## Tasks
- [ ] Add Vitest store tests for `useAlertRules`:
  - [ ] Create rule persists to local storage
  - [ ] Manual trigger appended to history
  - [ ] Clear triggers empties buffer
- [ ] Write contract tests for push endpoints with mocked Web Push:
  - [ ] `/api/push?action=subscribe` storing subscription
  - [ ] `/api/push?action=unsubscribe` cleanup path
  - [ ] `/api/push?action=test-send` handles success/error
- [ ] Mock `PushManager` + `Notification` for component tests:
  - [ ] Subscribe button success → telemetry event
  - [ ] Permission denied path surfaces error banner
- [ ] Add Playwright smoke:
  - [ ] Toggle rule enabled state
  - [ ] Upload local rules to server (mock)
  - [ ] Trigger evaluation -> toast or log
- [ ] Document required env vars (`VITE_VAPID_PUBLIC_KEY`, server secrets) with fallback instructions.

## Acceptance Criteria
- `useAlertRules` unit tests green without touching real storage (mock localStorage).
- Push endpoint tests cover happy & failure paths.
- Component tests assert UI state after subscribe/unsubscribe, including error messaging.
- Playwright scenario verifies push flow using mocks.
- README or docs updated with push config steps.

## Validation
- `pnpm vitest --run --testNamePattern="alert rule"`
- `pnpm vitest --run --testNamePattern="push"`
- `pnpm playwright test notifications`
- `pnpm lint src/pages/NotificationsPage.tsx api/push`
- `pnpm typecheck --filter notifications`

