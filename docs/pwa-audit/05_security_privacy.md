---
title: "Security & Privacy Notes"
summary: "Current safeguards, tokens, and PII considerations."
sources:
  - src/store/AccessProvider.tsx
  - src/lib/aiClient.ts
  - src/state/ai.tsx
  - src/lib/log-error.ts
  - src/lib/TelemetryService.ts
  - src/diagnostics/crash-report.ts
  - src/lib/push.ts
  - src/lib/offline-sync.ts
  - docs/setup/environment-and-providers.md
  - public/manifest.webmanifest
---

### Authentication & Access Control
- Wallet-based gating currently mocked with static address. Real implementation should use Solana wallet adapter with secure signature checks.
- Access status fetched over HTTPS from `${ACCESS_CONFIG.API_BASE}`. Response cached in `localStorage` (potentially sensitive rank/token balance). Consider encrypting or scoping to session storage.
- No JWT/local session tokens found; relies on upstream API session handling.

### API Keys & Secrets
- Client references environment variables via `import.meta.env`. Sensitive keys must remain server-side; docs highlight required `.env` entries (see `ENVIRONMENT_VARIABLES.md`).
- AI requests proxy through `/api/ai/assist`; prevents direct exposure of provider secrets.

### Data Handling
- Journal entries, ideas, rules may contain PII/trade data; stored in IndexedDB and synced to backend. No encryption at rest.
- Crash reports (`src/diagnostics/crash-report.ts`) gather device info, console logs, service worker status. Ensure user consent before uploading.
- Telemetry service batches events locally, respects opt-in toggles in settings.

### Push & Notifications
- `src/lib/push.ts` registers dedicated worker `/push/sw.js`. Subscription likely handled server-side; ensure VAPID keys not shipped in bundle.
- Push payloads displayed directly; sanitize text to avoid XSS inside notifications (currently uses template strings without escaping).

### Service Worker & Cache Safety
- Update pipeline uses manual `applyUpdate` to avoid uncontrolled reloads.
- Offline caches store KPI/feed data with minimal metadata; ensure no secrets cached inadvertently.

### Privacy Flags
- Need explicit consent for AI usage analytics (token counting). Currently auto-tracks tokens and stores locally.
- Provide user-facing copy for crash report submission (where data is sent).

