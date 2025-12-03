---
title: "Future Concepts & Opportunities"
summary: "Follow-up ideas derived from audit gaps."
sources:
  - docs/pwa-audit/02_feature_catalog.md
  - docs/pwa-audit/04_offline_sync_model.md
  - docs/pwa-audit/05_security_privacy.md
  - src/pages/AnalyzePage.tsx
  - src/store/AccessProvider.tsx
  - src/sections/ai/useAssist.ts
---


2. **Offline Journal Merge**
   - Introduce conflict markers when server version diverges from cached draft.
   - Add background sync queue with retry/backoff for `/api/journal` operations.

3. **Replay Session Sharing**
   - Generate shareable replay tokens using existing `shortlink` encoder, enforce expiry.
   - Pair with watermark overlays for security.

4. **Push Action Deep Links**
   - Extend `/push/sw.js` to handle action buttons (e.g., "Open Journal", "Snooze Alert").
   - Ensure analytics track notification interactions.

5. **Observability Dashboard**
   - Surface telemetry opt-in rate, AI token consumption, and sync latency inside Settings.
   - Hook into `TelemetryService` metrics for admin view.

6. **Privacy Safeguards**
   - Encrypt sensitive cached fields (wallet address, trade notes) via Web Crypto before storing locally.
   - Add consent gating for crash report uploads.

