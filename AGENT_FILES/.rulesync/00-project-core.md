---
mode: SYSTEM
id: "00-project-core"
priority: 1
version: "0.1.0"
last_review: "2025-11-12"
root: true
targets: ["cursor", "claudecode", "codex"]
globs: ["**/*"]
description: "Sparkfined PWA project vision, scope, domain map, and system index for all AI coding agents"
---

# 00 – Project Core

## 1. Project Vision & Narrative

**Sparkfined** ist eine Progressive Web Application, die Trading-Research, Journaling und Alert-Orchestration für Crypto-Trader in einem Offline-fähigen Browser-Tool vereint.

### Vision Statement

Sparkfined positioniert sich als **Offline-fähiges Trading Command Center** mit PWA-Installationsfähigkeit, Multi-Provider-AI und Solana-basiertem Access-Gating. Das Tool ermöglicht schnelle technische Analyse, KI-gestützte Einsichten, integriertes Journal, Push-Alerts und Replay-Modus – alles Browser-nativ ohne Desktop-Installation.

### Core Value Proposition

* **Offline-First:** Journal, Charts und KPI-Dashboard funktionieren ohne Internetverbindung
* **AI-Powered:** OpenAI + Grok für Market-Bullets, Social-Sentiment und Trade-Ideen
* **Self-Improvement:** Trading-Journal mit OCR, AI-Kondensation und Statistik-Modulen
* **Crypto-Native:** Solana-Wallet-Integration, DEX-Daten (Raydium, Orca, Jupiter), Meme-Coin-Strategien
* **PWA-Deployment:** Keine App-Store-Abhängigkeit, direkte Web-Installation

### Target Users

1. **Crypto Day-Traders** – Brauchen schnelle TA, Pattern-Erkennung, Alert-System
2. **Meme-Coin-Degen** – Fokus auf Wallet-Tracking, Community-Sentiment, Launch-Filtering
3. **Journaling-Enthusiasts** – Systematisches Trading-Tagebuch mit Reflection & AI-Insights
4. **DeFi-Power-User** – Multi-Chain-Portfolio, Solana-fokussiert, On-Chain-Daten

### Hero's Journey (Kurzform)

Der Trader startet als **Degen** (chaotisches Trading ohne System), durchläuft **Trials** (Verluste, fehlende Struktur), erhält **Tools** (Sparkfined: Journal, Analyze, Alerts), entwickelt **Mastery** (Edge, Consistency, Risk-Management) und wird zum **Sensei** (Community-Wissen teilen, Lessons veröffentlichen).

Für vollständige Hero's Journey und Lore → siehe `_planning-project-vision.md`.

---

## 2. Scope & Non-Goals

### In Scope

**Core Features (Production-Ready):**
- ✅ Advanced Charting (Canvas, 60fps, Multi-Timeframes, Indikatoren: SMA/EMA/RSI/Bollinger)
- ✅ Token-Analyse (OHLC via Moralis/DexPaprika, 25+ KPIs, Watchlist-Automation)
- ✅ Trading-Journal (Rich-Editor, OCR, AI-Kondensation, Offline-Sync)
- ✅ Alert-System (Visueller Rule-Editor, Server-Evaluation, Web-Push)
- ✅ Board Command Center (KPI-Dashboard, "Now Stream" Feed, Onboarding-Tours)
- ✅ PWA-Features (Offline-Fallback, Update-Banner, 66 precached Assets)

**Beta/Planned:**
- ⚠️ Access-Gating (Mock-Wallet aktiv, On-Chain-Integration geplant Q1 2025)
- 🔮 Signal-Orchestrator (Event-Sourcing, Learning-Architect, Lessons)
- 🔮 Moralis-Cortex-AI (Risk-Score, Sentiment-Analysis)
- 🔮 Social-Features (Community-Feed, Shared-Lessons, Leaderboards)

### Non-Goals (Explizit außerhalb)

* **Kein Broker-Integration** – Kein direkter Trade-Execution
* **Keine Multi-Chain-Wallet** – Fokus auf Solana, keine EVM-Chain-Unterstützung geplant
* **Keine Mobile-Native-App** – PWA-First, keine iOS/Android-Native-Entwicklung
* **Keine Backend-Heavy-Infra** – Serverless-Only (Vercel Edge Functions), kein eigener Server
* **Keine Custom-Blockchain** – Nutzung bestehender Chains (Solana), keine eigene L1/L2

---

## 3. Domain Map

Sparkfined ist in **7 Haupt-Domänen** organisiert:

| Domain | Scope | Key Components |
|--------|-------|----------------|
| **Board (Command Center)** | KPI-Dashboard, Feed, Quick-Actions, Onboarding | `src/pages/BoardPage.tsx`, `src/components/board/*` |
| **Analyze** | Token-Deep-Dive, OHLC-Fetch, KPI-Computation, AI-Bullets | `src/pages/AnalyzePage.tsx`, `src/lib/adapters/*` |
| **Chart** | Interactive Trading-Chart, Drawing-Tools, Replay-Integration | `src/pages/ChartPage.tsx`, `src/sections/chart/*` |
| **Journal** | Trading-Diary, Rich-Editor, OCR, AI-Condense, Server-Sync | `src/pages/JournalPage.tsx`, `src/lib/journal.ts` |
| **Signals** | Strategy-Signals, Rule-Editor, Server-Evaluation, Alert-Dispatch | `src/pages/SignalsPage.tsx`, `api/rules/*` |
| **Access** | Wallet-Connect, NFT-Gating, Permissions, Lock-Calculator | `src/pages/AccessPage.tsx`, `src/store/AccessProvider.tsx` |
| **PWA-Shell** | Offline-Sync, Service-Worker, Update-Flow, Telemetry | `src/main.tsx`, `vite.config.ts`, `public/push/sw.js` |

### Cross-Cutting Concerns

* **AI-Orchestrator:** `ai/orchestrator.ts` (OpenAI + Grok, Multi-Provider-Routing)
* **Data-Adapters:** `src/lib/adapters/*` (Moralis, DexPaprika, Fallback-Logic)
* **Telemetry:** `src/state/telemetry.tsx`, `api/telemetry.ts` (Performance, Crashes, AI-Kosten)
* **Offline-Sync:** `src/lib/offline-sync.ts`, `src/lib/db-board.ts` (IndexedDB via Dexie)

---

## 4. System-Index der SYSTEM-Dateien

**Dieser Index ist die Landkarte aller SYSTEM-Regeln. Bei Fragen zur Architektur, Springe zu der entsprechenden Datei.**

| ID | File | Scope | Priority | Targets |
|----|------|-------|----------|---------|
| 00 | `00-project-core.md` | Vision, Scope, Domain-Map, Index | 1 | cursor, claudecode, codex |
| 01 | `01-typescript.md` | TS strict-mode, Patterns, Type-Konventionen | 1 | cursor, claudecode |
| 02 | `02-frontend-arch.md` | 5-Layer-Architektur, Routing, File-Conventions | 1 | cursor, claudecode |
| 03 | `03-pwa-conventions.md` | Service-Worker, Caching, Offline-First | 2 | cursor, claudecode |
| 04 | `04-ui-ux-components.md` | Design-System, Component-Taxonomie, UX-States | 2 | cursor, claudecode |
| 05 | `05-api-integration.md` | Serverless-Patterns, Adapters, Retry-Logic | 2 | cursor, claudecode |
| 06 | `06-testing-strategy.md` | Vitest, Playwright, Coverage-Budgets | 3 | cursor, claudecode |
| 07 | `07-accessibility.md` | ARIA, Keyboard-Nav, jsx-a11y-Rules | 3 | cursor, claudecode |
| 08 | `08-performance.md` | Bundle-Budgets, Runtime-Optimization | 3 | cursor, claudecode |
| 09 | `09-security.md` | Secrets-Management, Auth, Secure-Defaults | 2 | cursor, claudecode, codex |
| 10 | `10-deployment.md` | Environments, Pipeline, Rollback-Strategy | 2 | cursor, claudecode, codex |
| 11 | `11-ai-integration.md` | OpenAI/Grok-Orchestration, Prompts, Fallbacks | 2 | cursor, claudecode, codex |

### ITERATIVE-Dateien (Kontext & Planung)

| Prefix | File | Scope |
|--------|------|-------|
| `_planning-` | `_planning-project-vision.md` | 33% Lore, 66% Tech-Vision, User-Journeys |
| `_planning-` | `_planning-features-roadmap.md` | Q1-Q4 2025 Roadmap, Feature-Matrix |
| `_planning-` | `_planning-architecture.md` | 5-Layer-Diagram, Data-Flows, Deployment |
| `_context-` | `_context-trading-domain.md` | KPIs, Indikatoren, Confluence-Regeln |
| `_context-` | `_context-nft-access-system.md` | Mock vs. Real Wallet, On-Chain-Plan |
| `_intentions-` | `_intentions-development-principles.md` | Code-Review-Checkliste, Team-Values |

---

## 5. Current Focus (Stand: 2025-11-12)

**Aktuelle Schwerpunkte für AI-Agents:**

1. **Rulesync-basiertes Multi-Tool-Prompt-System aufsetzen**
   - SYSTEM-Regeln 00-11 finalisieren
   - ITERATIVE-Kontexte mit Q&A erfassen
   - AGENTS.md für Codex generieren

2. **Trading-Domain-Wissen verankern**
   - Core-Indikator-Paket dokumentieren (RSI, MACD, BB, Fib, EMA, Volume)
   - Meme-Trading-Strategien (12 Signale, 6 Kombos, Top 8 Solana-Strategien)
   - KPI-Formeln transparent machen (Winrate, Expectancy, Max-Drawdown)

3. **PWA-Stabilität sichern**
   - Offline-First für Journal & Board garantieren
   - Service-Worker-Update-Flow verbessern (UpdateBanner)
   - Cache-Invalidation-Strategien bei Deployments

4. **Access-Gating von Mock zu Real migrieren**
   - Solana-Wallet-Adapter integrieren (Phantom, Solflare)
   - On-Chain-NFT-Verification implementieren
   - Grace-Period & Fallback-Mechanismen testen

5. **AI-Orchestrator optimieren**
   - Cost-Tracking verfeinern (AI_MAX_COST_USD Enforcement)
   - Social-Sentiment-Heuristiken tunen (Grok-Integration)
   - Template-Prompts versionieren (`ai/prompts/*.md`)

---

## 6. Tech-Stack-Übersicht

**Frontend:**
- React 18.3 (functional components, hooks)
- TypeScript 5.6 (strict mode)
- Vite 5.4 (esbuild, <30s builds)
- TailwindCSS 4.1 (utility-first)

**State & Persistence:**
- Zustand (global stores)
- React Context (Settings, Telemetry, AI, Access)
- Dexie (IndexedDB wrapper)
- localStorage/sessionStorage (UI-state)

**Backend:**
- Vercel Edge Functions (serverless, Node 20+)
- 34 API routes (`api/**/*.ts`)

**AI:**
- OpenAI GPT-4o-mini (Market-Bullets)
- xAI Grok (Social-Sentiment)
- Custom Orchestrator (`ai/orchestrator.ts`)

**Data Providers:**
- Moralis (Token-Data, NFT-Metadata)
- DexPaprika (OHLC, primary)
- Dexscreener (Fallback)
- Solana RPC (On-Chain-Reads)

**PWA:**
- vite-plugin-pwa + Workbox
- 66 precached Assets (~428KB gzipped)
- Web Push API (Notifications)

**Testing:**
- Vitest (Unit, Coverage)
- Playwright (E2E)
- @axe-core (A11y)

**Linting & Formatting:**
- ESLint 9 (flat config)
- Prettier 3 (implicit defaults)
- TypeScript strict compiler

---

## 7. Architecture-Quick-Ref (5-Layer-Modell)

```
┌─────────────────────────────────────────────────────┐
│ Layer 5: UI (Pages, Sections, Components)          │
│   src/pages/*, src/sections/*, src/components/*    │
├─────────────────────────────────────────────────────┤
│ Layer 4: State & Hooks                             │
│   Zustand stores, React Context, Custom Hooks      │
├─────────────────────────────────────────────────────┤
│ Layer 3: Persistence                               │
│   Dexie (IndexedDB), localStorage, sessionStorage  │
├─────────────────────────────────────────────────────┤
│ Layer 2: Backend (Serverless APIs)                 │
│   api/**, Vercel Edge Functions                    │
├─────────────────────────────────────────────────────┤
│ Layer 1: External Services                         │
│   Moralis, DexPaprika, Solana RPC, OpenAI, Grok    │
└─────────────────────────────────────────────────────┘
```

Für detaillierte Flows → siehe `02-frontend-arch.md` und `_planning-architecture.md`.

---

## 8. Key Principles (High-Level)

1. **Offline-First:** Journal, Board, Watchlist müssen ohne Internet funktionieren
2. **Progressive Enhancement:** Core-Features ohne AI/Wallet, Premium-Features mit Access-Gate
3. **No Silent Failures:** Jeder API-Error muss geloggt oder dem User kommuniziert werden
4. **DX & UX First:** Developer-Experience und User-Experience gleichwertig priorisieren
5. **Confluence > Single Signal:** Bei Trading-Entscheidungen mind. 2-3 bestätigende Indikatoren
6. **Secrets Server-Side:** API-Keys niemals im Client-Bundle exposen
7. **Bundle-Budget respektieren:** <400KB gzipped (aktuell 428KB, Ziel: 300KB)

Für vollständige Prinzipien → siehe `_intentions-development-principles.md`.

---

## 9. Getting Started (für neue Devs & AI-Agents)

**Empfohlene Lesereihenfolge:**

1. **Start hier:** `00-project-core.md` (dieses Dokument)
2. **Tech-Foundation:** `01-typescript.md` → `02-frontend-arch.md`
3. **Domain-Wissen:** `_context-trading-domain.md` (KPIs, Indikatoren, Strategien)
4. **Feature-Deep-Dive:** Wähle Domäne (Board/Analyze/Chart/Journal) → lese entsprechende `src/pages/*.tsx`
5. **Testing & Deployment:** `06-testing-strategy.md` → `10-deployment.md`

**Quick-Commands:**

```bash
pnpm dev              # Dev-Server (Port 5173)
pnpm build            # Production-Build + TS-Check
pnpm test             # Vitest Unit-Tests
pnpm test:e2e         # Playwright E2E
pnpm lint             # ESLint (bekannte Warnings)
pnpm sync:rules       # Rulesync regenerate (AGENTS.md, CLAUDE.md)
```

---

## 10. Glossary (Core-Begriffe)

| Begriff | Bedeutung |
|---------|-----------|
| **OHLC** | Open, High, Low, Close – Candlestick-Daten für Charts |
| **KPI** | Key Performance Indicator – Metriken wie Winrate, Max-Drawdown |
| **Confluence** | Mehrere Indikatoren bestätigen dasselbe Signal (reduziert Fakeouts) |
| **Meme-Coin** | Hype-getriebener Token ohne fundamentalen Wert (z.B. $BONK, $WIF) |
| **DEX** | Decentralized Exchange (z.B. Raydium, Orca auf Solana) |
| **Wallet-Gating** | Feature-Zugriff basierend auf NFT/Token-Holdings |
| **PWA** | Progressive Web App – installierbare Web-App mit Offline-Fähigkeiten |
| **Service-Worker (SW)** | Background-Script für Caching und Push-Notifications |
| **Precache** | Assets, die beim SW-Install sofort gecacht werden |
| **Adapter** | Abstraktionsschicht für externe APIs (z.B. `MoralisAdapter`) |
| **Orchestrator** | Multi-Provider-Logik (z.B. AI-Orchestrator für OpenAI/Grok) |

---

## Related

- `01-typescript.md` – Type-Regeln und Patterns
- `02-frontend-arch.md` – Architektur-Details
- `_planning-project-vision.md` – Vollständige Vision & Hero's Journey
- `_context-trading-domain.md` – Trading-Fachwissen
- `11-ai-integration.md` – AI-Provider-Routing

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 Batch 1 (Rulesync-Setup)
