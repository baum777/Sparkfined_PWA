---
title: "Produktüberblick & Architektur"
summary: "Zusammenfassung der Projektvision, Feature-Reife und Layer-Architektur der Sparkfined PWA."
sources:
  - docs/archive/raw/2025-11-12/PROJEKT_ÜBERSICHT.md
  - docs/archive/raw/2025-11-12/REPO_STRUKTURPLAN_2025.md
  - src/pages/BoardPage.tsx
  - src/pages/AnalyzePage.tsx
  - src/pages/JournalPage.tsx
  - src/lib/offline-sync.ts
  - src/lib/db-board.ts
---

<!-- merged_from: docs/archive/raw/2025-11-12/PROJEKT_ÜBERSICHT.md; docs/archive/raw/2025-11-12/REPO_STRUKTURPLAN_2025.md -->

## Vision & Positionierung
- Sparkfined positioniert sich als **Offline-fähiges Trading Command Center** mit PWA-Installationsfähigkeit, Multi-Provider-AI und Solana-basiertem Access Gating.
- Kernnutzen: schnelle technische Analyse, KI-gestützte Einsichten, integriertes Journal, Push-Alerts und Replay-Modus — alles Browser-nativ.
- Wettbewerbsvergleich betont PWA-Deployment, Offline-Modus und hybride Kostensteuerung gegenüber klassischen SaaS-Tools.

## Feature-Reife (IST)
| Bereich | Status | Highlights |
| --- | --- | --- |
| Advanced Charting | ✅ | Canvas-Renderer (60fps), Multi-Timeframes, Indikatoren (SMA, EMA, RSI, Bollinger), Replay & Export. |
| Token-Analyse | ✅ | OHLC via Moralis/Dexpaprika, 25+ KPIs, Heatmaps, AI-Bullets, Watchlist-Automation. |
| Trading Journal | ✅ | Rich-Editor, OCR, AI-Kondensation, Offline-first Sync (IndexedDB + API), Statistikmodule. |
| Alerts & Notifications | ✅ | Visueller Rule-Editor, serverseitige Evaluation, Push (Web Push API), Historie. |
| Board Command Center | ✅ | KPI-Zone, Now Stream, Quick Actions, Onboarding-Modals (Driver.js Tour). |
| Access Gating | ⚠️ | Mock-Wallet + API-Status abrufbar; On-Chain-Integration noch offen. |
| PWA & Offline | ✅ | 35 precached Assets, Offline-Fallback, Update-Banner, Push Worker. |

## Architektur-Layer
1. **UI (Layer 5)** — Pages, Sections, Komponenten in React/Tailwind.
2. **State & Hooks (Layer 4)** — Zustand für Access, AI, Journal, Replay; Custom Hooks wie `useJournal`, `useAssist`.
3. **Persistence (Layer 3)** — Dexie-Datenbanken (`BoardDatabase`, Journal DB) für Charts, Alerts, Feed, KPIs.
4. **Serverless Backend (Layer 2)** — Vercel Edge Functions (`/api/ai/assist`, `/api/access/status`, `/api/data/ohlc`, etc.).
5. **External Services (Layer 1)** — Moralis, Dexpaprika, Solana RPC, OpenAI/Anthropic, Web Push.

## Rollout & Kennzahlen
- Launch-Status "Production Ready" mit Lighthouse >90, Bundle 428 KB precached, Build ~1.6 s.
- KPI-Ziele: MAU ≥500 (Phase 1), Retention D7 ≥35 %, AI-Adoption ≥20 %, AI-Kosten <0.05 USD je Anfrage.
- Roadmap sieht Erweiterungen für Moralis Cortex, Signal Orchestrator und Social Features vor.

## Onboarding & Experience
- Progressive Persona-Auswahl, Quick Tours und Keyboard-Shortcut-Modals steuern den Erstkontakt.
- Board-Page orchestriert Welcome Modal, Checklisten und Hints; Onboarding-Status persistiert lokal.

## Sicherheit & Betrieb
- Access-Cache 5 min + 24h Grace verhindert Lockout, aber verschlüsselte Speicherung empfohlen.
- Offline-Sync nutzt `syncKPIsToCache`/`syncFeedToCache` und `fetchWithSWR`; Update-Banner kontrolliert SW-Rollouts.

