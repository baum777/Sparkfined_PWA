---
title: "Checklist — F-07 Notifications Center"
sources:
  - tickets/notifications-center-todo.md
  - src/pages/NotificationsPage.tsx
  - src/sections/notifications/useAlertRules.ts
  - api/push/subscribe.ts
  - api/push/unsubscribe.ts
  - api/push/test-send.ts
---

## Preflight
- [ ] `pnpm install`
- [ ] Configure web-push mock credentials for tests
- [ ] Ensure Notification & PushManager mocks registered (Vitest setup)

## Unit / Integration
- [ ] `pnpm vitest --run --testNamePattern="alert rule"`
- [ ] `pnpm vitest --run --testNamePattern="push subscribe"`
- [ ] `pnpm vitest --run --testNamePattern="push unsubscribe"`
- [ ] `pnpm vitest --run --testNamePattern="push test-send"`

## Component
- [ ] Mount Notifications page with mocked PushManager
- [ ] Assert subscribe success, deny, and error flows
- [ ] Assert telemetry events triggered on rule changes

## E2E
- [ ] Seed server mocks for rules/push endpoints
- [ ] `pnpm playwright test notifications`
- [ ] Capture screenshot of trigger history table

## Quality Gates
- [ ] `pnpm lint src/pages/NotificationsPage.tsx src/sections/notifications/useAlertRules.ts api/push`
- [ ] `pnpm typecheck --filter notifications`
- [ ] `pnpm build`
- [ ] Verify Playwright run attaches traces

## Artefacts
- [ ] Update docs with push configuration checklist (VAPID, server secrets) → see `docs/setup/push-notifications.md`
- [ ] Include mock subscription JSON in PR → see `tests/data/mock-push-subscription.json`

