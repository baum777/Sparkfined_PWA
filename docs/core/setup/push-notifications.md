# Push Notifications (VAPID) Setup

This guide documents the minimum configuration required to make the Notifications Center push flows work locally and in production.
It covers the VAPID key pairs, admin secret, and how to validate the wiring without touching real devices.

## Environment variables

| Variable | Scope | Required | Purpose |
| --- | --- | --- | --- |
| `VITE_VAPID_PUBLIC_KEY` | Client | Optional, required to show push UI | Public VAPID key exposed to the browser; must match `VAPID_PUBLIC_KEY`. |
| `VAPID_PUBLIC_KEY` | Server | ✅ for sending pushes | Public key for signing payloads with Web Push. |
| `VAPID_PRIVATE_KEY` | Server | ✅ for sending pushes | Private key for signing payloads (never exposed to the client). |
| `VAPID_SUBJECT` or `VAPID_CONTACT` | Server | Recommended | Contact email passed to the Web Push library. |
| `ALERTS_ADMIN_SECRET` | Server | Recommended | Bearer token required by `/api/push/test-send` to guard test sends in production. |

> Tip: `VITE_VAPID_PUBLIC_KEY` can be omitted in non-push builds. The Notifications page will surface a warning when it is missing.

## Generating keys

Run once to generate a VAPID key pair:

```bash
npx web-push generate-vapid-keys
```

Capture the output and set both keys in your environment:

```bash
VAPID_PUBLIC_KEY=<copy_public_key>
VAPID_PRIVATE_KEY=<copy_private_key>
VITE_VAPID_PUBLIC_KEY=<copy_public_key>
VAPID_SUBJECT=mailto:alerts@sparkfined.com
ALERTS_ADMIN_SECRET=<strong_random_token>
```

- **Local dev:** You may reuse the same pair and secret in `.env.local`. The `/api/push/test-send` handler allows requests without `ALERTS_ADMIN_SECRET` in non-production environments but setting it avoids surprises in CI.
- **Production:** Store `VAPID_PRIVATE_KEY` and `ALERTS_ADMIN_SECRET` in a server-only secret store. Never expose the private key to the client bundle.

## Mocking and verification

1) **Mock subscription** — Use `tests/data/mock-push-subscription.json` in tests or manual calls to avoid real device registrations.
2) **Smoke tests** — With env vars set, run:
   - `pnpm vitest --run --testNamePattern="push"`
   - `pnpm lint api/push src/pages/NotificationsPage.tsx`
3) **Manual probe** — Trigger a guarded send using curl:

```bash
curl -X POST http://localhost:3000/api/push/test-send \
  -H "Authorization: Bearer $ALERTS_ADMIN_SECRET" \
  -H "content-type: application/json" \
  -d @tests/data/mock-push-subscription.json
```

You should receive `{ "ok": true }` when the keys and secret are wired correctly.
