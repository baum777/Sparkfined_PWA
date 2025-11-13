---
title: "Production Ready Features"
sources:
  - docs/pwa-audit/02_feature_catalog.md
  - src/state/telemetry.tsx
  - src/lib/TelemetryService.ts
  - tests/unit/telemetry.test.ts
  - public/manifest.webmanifest
  - public/offline.html
  - tests/e2e/pwa.spec.ts
  - src/main.tsx
---

| Feature ID | Name | Type | Key Capabilities | Tests | Observability | Status |
|------------|------|------|------------------|-------|---------------|--------|
| F-11 | Telemetry & Diagnostics | Agent flow | Opt-in telemetry buffer, budgets, settings toggles, CSV export | `tests/unit/telemetry.test.ts` | `/api/telemetry` beacon flush, settings toggles | ✅ Ready |
| F-12 | Offline Shell & PWA Core | Other | Service worker bootstrap, offline fallback, installability checks | `tests/e2e/pwa.spec.ts` | Update banner & SW poke in `src/main.tsx` | ✅ Ready |

## F-11 — Telemetry & Diagnostics
- **Scope:** `TelemetryProvider`, `TelemetryService`, settings toggles, beacon flush to `/api/telemetry`.
- **Readiness Notes:** Type-safe storage, sampling & consent respected, CSV export and budgets covered by unit tests.
- **Operational Hooks:** `TelemetryProvider` drains on visibility change; `SettingsPage` exposes toggles; `TelemetryService` budgets guard AI flows.
- **Validation Commands:**
  - `pnpm vitest --run --testNamePattern="Telemetry Service"`
  - `pnpm lint src/state/telemetry.tsx src/lib/TelemetryService.ts`
  - `pnpm typecheck --filter telemetry`
- **Deployment Considerations:** Ensure `/api/telemetry` remains server-side and logs only aggregated metrics; monitor beacon success rates.

## F-12 — Offline Shell & PWA Core
- **Scope:** Service worker registration in `src/main.tsx`, manifest + icons, offline fallback page, installability checks.
- **Readiness Notes:** Playwright suite validates offline reloads, manifest presence, caching strategy, install prompt heuristics.
- **Operational Hooks:** `UpdateBanner` prompts for SW updates; `SettingsPage` exposes cache clearing & SW poke; `public/offline.html` provides branded fallback.
- **Validation Commands:**
  - `pnpm playwright test pwa`
  - `pnpm build && pnpm preview` (manual verification of SW activation)
  - `pnpm lint src/main.tsx`
- **Deployment Considerations:** Keep icon set in sync with manifest, rotate cache keys when shipping breaking changes, ensure HTTPS for install prompts.

