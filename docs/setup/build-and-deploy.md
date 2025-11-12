---
title: "Build & Deployment Leitfaden"
summary: "Scripts, Checks und Deploy-Schritte für Sparkfined."
sources:
  - docs/archive/raw/2025-11-12/BUILD_SCRIPTS_EXPLAINED.md
  - docs/archive/raw/2025-11-12/DEPLOY_GUIDE.md
  - docs/archive/raw/2025-11-12/DEPLOY_CHECKLIST.md
  - verify-deployment.sh
  - package.json
---

<!-- merged_from: docs/archive/raw/2025-11-12/BUILD_SCRIPTS_EXPLAINED.md; docs/archive/raw/2025-11-12/DEPLOY_GUIDE.md; docs/archive/raw/2025-11-12/DEPLOY_CHECKLIST.md -->

## Build Scripts
| Script | Zweck |
| --- | --- |
| `pnpm build` | TypeScript Build (`tsc -b`) + Vite Production Bundle. |
| `pnpm build:local` | Build + Bundle-Größe prüfen (`scripts/check-bundle-size.mjs`). |
| `pnpm build:ci` | Build lokal + Playwright E2E Smoke. |
| `pnpm analyze` | Bundle-Visualizer. |
| `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` | Qualitätssicherung. |

## Pre-Deploy Checkliste
1. `pnpm lint && pnpm typecheck`.
2. `pnpm test` (Vitest) + `pnpm test:e2e` (Playwright, falls CI verfügbar).
3. `pnpm build:local` → sicherstellen, dass Bundle-Size Warnung < Budget.
4. `node verify-deployment.sh` (Smoke für envs & endpoints).
5. README/Changelog aktualisieren falls relevant.

## Deployment Pfade
- **Vercel (empfohlen):** Git Push → CI → `pnpm build:ci`. Secrets via Vercel Dashboard.
- **Self-Hosted:** `pnpm build` → `dist/` auf CDN/S3. Service Worker scope `/*` sicherstellen.
- **Preview:** `pnpm preview` lokal mit `vite preview` (port 4173) + optional Lighthouse Audit (`pnpm lighthouse`).

## Post-Deploy Validierung
- Lighthouse (Performance, PWA ≥ 90).
- Service Worker Status (DevTools Application → Update Cycle).
- Push-Worker `/push/sw.js` registriert? (falls aktiviert).
- Access API `/api/access/status` mit Mock-Wallet testen.

