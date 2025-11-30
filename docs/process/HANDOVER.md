# 📋 HANDOVER DOCUMENT — Sparkfined PWA

**Projekt:** Sparkfined PWA — Trading Command Center
**Version:** V2 (Current Production)
**Datum:** 2025-11-30
**Status:** ✅ Production-Ready (mit bekannten Gaps)
**Branch:** `claude/visualize-ui-architecture-01PjVvvs5TDv4C2kDjkPHTdo`

---

## 1. Executive Summary

Sparkfined PWA ist ein **offline-fähiges Trading Command Center** für Crypto-Trader. Die App kombiniert systematisches Trade-Journaling, AI-gestützte Insights (OpenAI + Grok), Live-Watchlists und Pattern-Analysis in einer mobil-optimierten Progressive Web App.

### Key Metrics

- **Screens:** 6 primäre Pages (Dashboard, Journal, Watchlist, Analysis, Alerts, Chart)
- **Tech-Stack:** React 18.3, TypeScript 5.6, Vite 5.4, Zustand, Dexie (IndexedDB)
- **AI-Integration:** Dual-Provider (OpenAI für Kosten, Grok für Crypto-Reasoning)
- **Offline-First:** PWA mit Service Worker, IndexedDB-Persistence
- **Deployment:** Vercel (Production), Auto-Deploy via GitHub Actions

### Current State (Ampel-System)

**🟢 Production-Ready:**
- Journal V2 (Entries, AI-Insights, Journey-Tracking)
- Watchlist V2 (Token-Tracking, Live-Prices, Sessions)
- Analysis V2 (Overview-Tab mit AI-Bias, Social-Trends)
- Dashboard V2 (Layout steht, KPIs sind Dummy-Daten)

**🟡 Partial Implementation:**
- Alerts V2 (List/Detail funktioniert, Actions fehlen)
- Chart V2 (existiert, Details unklar)
- Replay (existiert, Details unklar)

**🔴 Planned / Missing:**
- Analysis: Flow & Playbook Tabs
- Dashboard: Echte KPI-Berechnung
- Alert-Management: Snooze/Edit/Delete-Handlers
- Push-Notifications für Alerts

---

## 2. Project Overview

### Vision

**Für wen?** Crypto-Trader, die systematisch arbeiten wollen (nicht FOMO-driven)

**Core-Problem gelöst:**
1. **Journaling:** Trades dokumentieren, Muster erkennen, AI-Coach nutzen
2. **Market-Tracking:** Watchlists mit Live-Prices, Session-Filter (London/NY/Asia)
3. **AI-Insights:** Pattern-Detection aus Journal-Entries, Social-Sentiment-Analysis
4. **Offline-First:** Arbeiten auch ohne Internet (PWA, IndexedDB)

### User-Journey (Typischer Tag eines Traders)

```
Morgen (7:00 UTC):
  → Öffnet Dashboard → sieht P&L, Win-Rate, Streak
  → Öffnet Watchlist → filtert "London Session" → checkt SOL, BTC
  → Klickt SOL → öffnet Chart → analysiert Setup

Trade-Execution (10:00 UTC):
  → Trade wird ausgeführt (extern)
  → Öffnet Journal → "+ New Entry" → dokumentiert Trade
  → Notiert: Entry-Reason, Emotion, Thesis

Abend (20:00 UTC):
  → Öffnet Journal → "Generate Insights" → AI scannt letzte 20 Trades
  → Liest Insights: "Risk-Management: Du oversized 3x bei FOMO-Setups"
  → Reflektiert, plant für morgen

Wochenende:
  → Öffnet Analysis → checkt AI-Bias (Bullish/Bearish)
  → Liest Social-Trends (Grok)
  → Plant Trades für kommende Woche
```

---

## 3. Architecture Overview

### High-Level Architecture (3 Layers)

```
┌─────────────────────────────────────────────────────────┐
│  UI LAYER (React Pages)                                 │
│  Dashboard, Journal, Watchlist, Analysis, Alerts, Chart │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├─ reads/writes ─┐
                 ▼                 ▼
┌─────────────────────────────┐  ┌──────────────────────┐
│  STATE LAYER (Zustand)      │  │  PERSISTENCE         │
│  - journalStore             │←─┤  - Dexie (IndexedDB) │
│  - watchlistStore           │  │  - LocalStorage      │
│  - alertsStore              │  │  - Service Worker    │
│  - chartUiStore             │  └──────────────────────┘
│  - liveDataStore            │
└────────────────┬────────────┘
                 │
                 ├─ calls ─┐
                 ▼          ▼
┌─────────────────────────────┐  ┌──────────────────────┐
│  SERVICES & ADAPTERS        │  │  EXTERNAL APIs       │
│  - JournalService (CRUD)    │──┤  - Moralis (Prices)  │
│  - aiClient (OpenAI/Grok)   │  │  - DexPaprika (OHLC) │
│  - grokPulse (Social)       │  │  - OpenAI (Insights) │
│  - moralisAdapter           │  │  - Grok (Sentiment)  │
└─────────────────────────────┘  └──────────────────────┘
```

### Key Tech Decisions (ADRs)

| Decision | Why | Status |
|----------|-----|--------|
| Zustand (not Redux) | Minimal boilerplate, TypeScript-first | ✅ Confirmed |
| Dexie (IndexedDB) | Offline-First, structured queries, no 5MB limit | ✅ Confirmed |
| Dual-AI (OpenAI + Grok) | OpenAI cheap, Grok crypto-native | ✅ Confirmed |
| Dark-Mode-First | Trading apps are dark, reduces eye-strain | ✅ Confirmed |
| V2-Routes (not V1) | Full refactor in 2024-Q4, V1 deprecated | ✅ Confirmed |

---

## 4. Screen Inventory & Feature Status

### 4.1 Route & Screen Map

```
/                         → Redirect nach /dashboard-v2

PRIMARY SCREENS (Core User Workflow):
├─ /dashboard-v2          – Dashboard (KPI-Tiles, Quick-Actions, Insight-Teaser, Journal-Snapshot)
├─ /journal-v2            – Trading Journal (Entry-List, Detail-Panel, AI-Insights, Journey-Banner)
├─ /watchlist-v2          – Watchlist (Token-Table, Detail-Panel, Session-Filter, Live-Badges)
├─ /analysis-v2           – Analysis (Tabs: Overview/Flow/Playbook, AI-Insights, Social-Trends)
├─ /alerts-v2             – Alerts (Alert-List, Detail-Panel, Status/Type-Filter)
└─ /chart-v2              – Chart (Interactive Chart, Drawing-Tools, Indicators)

SECONDARY SCREENS (Support & Config):
├─ /settings-v2           – Settings (AI-Provider, Theme, Preferences)
├─ /replay                – Replay (Time-Travel-Mode für Charts)
├─ /signals               – Signals (Signal-Discovery, Pattern-Matching) [PLANNED]
├─ /lessons               – Lessons (Trading-Education) [PLANNED]
├─ /notifications         – Notifications (Push-Notification-Center)
└─ /landing               – Landing Page (Onboarding, Marketing)

UTILITY:
└─ /icons                 – Icon Showcase (Design-System-Demo)
```

### 4.2 Primary Screens Details

#### `/dashboard-v2` — Dashboard

**Purpose:** Zentrale Übersicht (KPIs, Quick-Actions, Teasers)

**Status:** 🟡 Partial (Layout steht, KPIs sind Dummy-Daten)

**Features:**
- ✅ KPI-Strip (P&L, Win-Rate, Alerts, Streak) — DUMMY-DATEN
- ✅ Quick-Actions (Header)
- ✅ Insight-Teaser (SOL Daily Bias, Summary)
- ✅ Journal-Snapshot (letzte 3 Entries)
- ❌ Echte KPI-Berechnung aus Journal/Alerts [FEHLT]

**User-Actions:**
- Klick auf Journal-Entry → navigiert zu `/journal-v2?entry=<id>`

---

#### `/journal-v2` — Trading Journal

**Purpose:** Trades dokumentieren, AI-Insights generieren, Journey tracken

**Status:** 🟢 Production-Ready

**Features:**
- ✅ Entry-List (filterable: All/Long/Short)
- ✅ Entry-Detail-Panel (Title, Date, Direction, P&L, Notes, Tags)
- ✅ "+ New Entry" Dialog (Title, Notes)
- ✅ AI-Insights-Panel (Generate/Regenerate, Insight-Cards, Social-Preview)
- ✅ Journey-Banner (Phase, XP, Streak)
- ✅ Dexie-Persistence (Entries, Insights)
- 🟡 Entry-Editing (Notes) — PARTIAL (UI da, Handler evtl. unvollständig)

**User-Actions:**
1. Klick "+ New Entry" → Modal öffnet → Create Entry
2. Klick Entry-Row → selektiert Entry → Detail-Panel zeigt Metadata
3. Klick "Generate Insights" → AI scannt letzte 20 Trades → zeigt Insight-Cards
4. Klick "Regenerate Insights" → AI generiert neu

**Data-Flow (AI-Insights):**
```
User → "Generate Insights"
  → JournalInsightsPanel
    → getJournalInsightsForEntries(entries)
      → aiClient (OpenAI/Grok)
        → POST /api/openai/chat
      ← Insights (JSON)
    → saveInsightsForAnalysisKey(dexie)
    → sendJournalInsightsGeneratedEvent(telemetry)
  ← UI renders Insight-Cards
```

---

#### `/watchlist-v2` — Watchlist

**Purpose:** Token-Tracking mit Live-Prices, Session-Filter

**Status:** 🟢 Production-Ready

**Features:**
- ✅ Token-Table (Symbol, Price, 24h-Change, Session)
- ✅ Detail-Panel (Token-Info, Trend-Info, Actions)
- ✅ Session-Filter (All, London, NY, Asia)
- ✅ Sort-Toggle (Default, Top-Movers)
- ✅ Live-Badge (zeigt Live-Status)
- ✅ Actions: "Open Chart", "Open Replay"
- ✅ Grok-Integration (Social-Trends in Detail-Panel)

**User-Actions:**
1. Klick Session-Filter → filtert Rows
2. Klick Sort-Toggle → sortiert nach abs. Change
3. Klick Token-Row → selektiert Token → Detail-Panel zeigt Info
4. Klick "Open Chart" → navigiert zu `/chart-v2?address=<addr>`
5. Klick "Open Replay" → navigiert zu `/replay?address=<addr>&from=<time>`

---

#### `/analysis-v2` — Analysis

**Purpose:** AI-basierte Markt-Analysen (Bias, Flow, Playbook)

**Status:** 🟡 Partial (Overview funktioniert, Flow/Playbook sind Placeholder)

**Features:**
- ✅ Tabs: Overview, Flow, Playbook
- ✅ Overview-Tab:
  - Stats-Grid (Bias, Confidence, Timeframe, Last-Price, 24h-Change)
  - Social-Trend-Card (Tweet-Snippet, Sentiment, Hype, CTA)
  - Advanced-Insight-Card (expandable Sections)
- ❌ Flow-Tab: "Coming Soon" Placeholder
- ❌ Playbook-Tab: "Coming Soon" Placeholder

**User-Actions:**
1. Tabs wechseln (Overview/Flow/Playbook)
2. Klick "View Tweet" (Social-Trend-Card) → öffnet Tweet-URL
3. Flow/Playbook: NOCH NICHT IMPLEMENTIERT

---

#### `/alerts-v2` — Alerts

**Purpose:** Price/Volume/Trend-Alerts mit Grok-Integration

**Status:** 🟡 Partial (List/Detail funktioniert, Actions fehlen)

**Features:**
- ✅ Alert-List (filterable: Status, Type)
- ✅ Detail-Panel (Symbol, Condition, Type, Timeframe, Metadata)
- ✅ Status-Filter (All, Armed, Triggered, Snoozed)
- ✅ Type-Filter (All, Price, Volume, Volatility, Trend)
- ❌ Actions (Snooze, Edit, Delete) — UI da, Handler fehlen
- ❌ "+ New Alert" (Create-Flow) — FEHLT

**User-Actions:**
1. Klick Status-Filter → filtert Alerts
2. Klick Alert-Row → selektiert Alert → Detail-Panel zeigt Info
3. [FEHLT] Klick "Snooze" → Alert-Status → "Snoozed"
4. [FEHLT] Klick "Edit" → Modal → Edit Condition
5. [FEHLT] Klick "Delete" → Confirm → Alert löschen

---

#### `/chart-v2` — Chart

**Purpose:** Interactive Charts mit Drawing-Tools, Indicators

**Status:** 🟡 Partial (existiert, Details unklar)

**Features:**
- ✅ Chart-Component (AdvancedChart.tsx)
- ✅ ChartHeaderActions (Timeframe-Switch, Indicator-Toggle?)
- ❓ Drawing-Tools (Lines, Fibonacci, etc.) — UNKLAR
- ❓ Save-Chart-State — UNKLAR

**EMPFEHLUNG:** Deep-Dive in `ChartPageV2.tsx` & `AdvancedChart.tsx`

---

## 5. Technical Health & Known Issues

### 5.1 Known Gaps (Feature-Completeness)

| Feature | Status | Impact | Priority |
|---------|--------|--------|----------|
| Alert-Management-Actions (Snooze/Edit/Delete) | ❌ UI da, Handler fehlen | 🔴 High | P0 |
| Dashboard-KPIs (Echte Berechnung) | ❌ Dummy-Daten | 🟡 Medium | P0 |
| Analysis: Flow/Playbook-Tabs | ❌ Placeholder | 🟡 Medium | P1 |
| Journal-Entry-Editing (Notes) | 🟡 Partial | 🟢 Low | P1 |
| Chart-Drawing-Tools | ❓ Unklar | 🟡 Medium | P1 |
| Push-Notifications | ❓ Unklar | 🟢 Low | P2 |

### 5.2 Technical Debt

#### Code-Duplikate

**V2-Routen vs. Legacy:**
- Alle Legacy-Routes (`/journal`, `/watchlist`, etc.) redirecten zu `-v2`
- **Problem:** Legacy-Pages evtl. noch im Code (tote Code-Pfade)
- **Action:** Cleanup in Q1 2025

**BottomNav vs. Sidebar:**
- BottomNav (Mobile): nur 4 Links (Dashboard, Analyze, Journal, Settings)
- Watchlist & Alerts fehlen → User muss über Dashboard navigieren
- **Action:** Watchlist/Alerts zu BottomNav hinzufügen ODER bewusst weglassen (Design-Entscheidung?)

#### Performance-Risiken

**AI-Insights-Caching:**
- ✅ Gut: Insights werden in Dexie gecacht
- ❌ Problem: Cache-Invalidierung bei neuen Entries unklar → evtl. stale Insights
- **Action:** Cache-Key sollte Entry-IDs oder Hash einbeziehen

**Live-Price-Polling:**
- ✅ Gut: PricePollingService existiert
- ❌ Problem: Polling-Intervall & Stop-Condition unklar → Batterie-Drain?
- **Action:** Polling-Intervall dokumentieren, Stop bei Inactivity

**Zustand-Store-Persistenz:**
- ❌ Problem: Stores sind in-memory, keine `zustand/persist`-Middleware
- Store-State geht bei Reload verloren → muss manuell rehydriert werden
- **Action:** Zustand-Middleware `persist` einbauen (Journal, Watchlist, Alerts)

### 5.3 Security & Secrets

**✅ Gut:**
- Secrets (API-Keys) sind server-side (Vercel Environment Variables)
- Client calls `/api/moralis/*` Proxies (keine Keys im Bundle)

**⚠️ Risiko:**
- VITE-Prefixed Vars (`VITE_*`) werden im Bundle exposed
- **Action:** Audit `env.ts` & `.env*`-Files → sicherstellen, dass keine `VITE_*` Secrets existieren

---

## 6. Prelaunch Plan

### 🚀 Strategie-Übersicht

- **Ziel:** Minimales, aber vollständiges Release mit 5 Core-Features
- **Zeitrahmen:** 3 Sprints à 1-2 Wochen (6-8 Wochen total)
- **Kritischer Pfad:** Journal → Dashboard → Alerts (diese 3 Features hängen zusammen)

### Sprint-Planung (Bottom-Up-Approach)

#### **Sprint 1 — Foundation & Infrastructure (Woche 1-2)**

**Ziel:** Basis-Infrastruktur + Cross-Cutting-Concerns fertig stellen

**Why First?** Alle anderen Features brauchen solide Loading/Error-States, Settings, PWA-Basis

**Tasks (6):**

1. ✅ **Settings: AI-Provider-Auswahl (OpenAI/Grok)**
   - Aufwand: 0.5 Tage
   - Blocker: Keine

2. ✅ **Settings: Theme-Toggle (Light/Dark/System)**
   - Aufwand: 0.5 Tage
   - Blocker: Keine

3. ✅ **Cross-Cutting: Loading/Error-States vereinheitlichen**
   - Aufwand: 1 Tag
   - Blocker: Keine
   - Action: Pattern-Library erstellen (`<LoadingState />`, `<ErrorState />`, `<EmptyState />`)

4. ✅ **PWA: Service Worker + Asset-Caching prüfen**
   - Aufwand: 0.5 Tage
   - Blocker: Keine

5. ✅ **PWA: Offline-Hinweise (Watchlist/Charts)**
   - Aufwand: 0.5 Tage
   - Blocker: Keine

6. ✅ **Chart v2: Symbol-Param-Handling + Error-State**
   - Aufwand: 1 Tag
   - Blocker: Keine
   - Action: Testen: `/chart-v2` ohne Param → Hinweis "Symbol fehlt"

**Sprint 1 Total:** ~4 Tage

---

#### **Sprint 2 — Core Features: Journal + Watchlist (Woche 3-4)**

**Ziel:** Die beiden wichtigsten User-Flows (Journal, Watchlist) vollständig funktionsfähig

**Why First?** Journal ist "Heart of the App", Watchlist ist Daily-Use-Case

**Tasks (9):**

**Journal (5):**

7. ✅ **Journal CRUD: Create/Read/Update/Delete**
   - Aufwand: 2 Tage
   - Blocker: Keine
   - Action:
     - Create: ✅ existiert (JournalNewEntryDialog)
     - Read: ✅ existiert
     - Update: Notes-Editing verdrahten
     - Delete: Delete-Button + Confirm-Dialog

8. ✅ **Journal Detail-Panel: Notes editierbar + Dexie**
   - Aufwand: 1.5 Tage
   - Blocker: Task #7
   - Action: `updateEntryNotes()` in `JournalService.ts` + State-Update in `journalStore`

9. ✅ **Journal Empty State: Onboarding**
   - Aufwand: 0.5 Tage
   - Blocker: Keine
   - Action: Wenn `entries.length === 0` → "Starte mit deinem ersten Trade"-Banner

10. ✅ **Journal AI-Insights: Error/Loading-States polieren**
    - Aufwand: 1 Tag
    - Blocker: Keine
    - Action: Cache-Strategie prüfen (siehe Handover: Cache-Invalidierung)

**Watchlist (4):**

11. ✅ **Watchlist: Sortierung (Top Movers / Alphabetisch)**
    - Aufwand: 0.5 Tage
    - Blocker: Keine
    - Action: Sort-Toggle erweitern (aktuell nur "Default" vs. "Top Movers")

12. ✅ **Watchlist Detail-Panel: 'Open Chart' verdrahten**
    - Aufwand: 0.5 Tage
    - Blocker: Task #6 (Chart Error-Handling)
    - Action: Button existiert, muss nur getestet werden

13. ✅ **Chart v2: Timeframe-Switch + Pan/Zoom testen**
    - Aufwand: 1 Tag
    - Blocker: Task #6
    - Action: Manueller Test-Flow: Symbol wählen → Timeframe wechseln → Pan/Zoom

**Sprint 2 Total:** ~7 Tage

---

#### **Sprint 3 — Core Features: Dashboard + Alerts + Analysis (Woche 5-6)**

**Ziel:** Dashboard mit echten KPIs, Alerts mit Trigger-Engine, Analysis-Overview finalisiert

**Why Now?** Dashboard braucht Journal-Daten (Sprint 2), Alerts sind eigenständig

**Tasks (9):**

**Dashboard (3):**

14. ✅ **Dashboard: Echte KPIs (P&L, Win Rate aus Journal)**
    - Aufwand: 2 Tage
    - Blocker: Task #7 (Journal CRUD muss funktionieren)
    - Action:
      - `calculateNetPnL(entries)` → aggregiere `pnl`-Felder
      - `calculateWinRate(entries, last30Days)` → zähle wins/losses

15. ✅ **Dashboard: Alerts-Snapshot**
    - Aufwand: 1 Tag
    - Blocker: Tasks #16-18 (Alerts CRUD)
    - Action: "X armed, Y triggered"-Widget + Link zu `/alerts-v2`

16. ✅ **Dashboard: Quick Actions verdrahten**
    - Aufwand: 0.5 Tage
    - Blocker: Keine
    - Action: Buttons zu Journal/Watchlist/Analysis/Alerts

**Alerts (3):**

17. ✅ **Alerts: Create-Dialog**
    - Aufwand: 2 Tage
    - Blocker: Keine
    - Action: Modal: Symbol, Type (Price/Volume), Condition, Threshold, Timeframe

18. ✅ **Alerts: Edit/Delete-Handler**
    - Aufwand: 1.5 Tage
    - Blocker: Task #17
    - Action: Edit-Modal (wie Create), Delete + Confirm-Dialog

19. ✅ **Alerts: Trigger-Engine MVP (Polling)**
    - Aufwand: 3 Tage
    - Blocker: Task #17
    - Action:
      - Polling-Service (alle 30s? 1min?)
      - Fetch Prices/Volumes für armed Alerts
      - Check Conditions → setze Status `Triggered`
      - Optional: Browser-Notification

**Analysis (2):**

20. ✅ **Analysis Overview-Tab: Stats-Grid + AI-Insight-Card finalisieren**
    - Aufwand: 1.5 Tage
    - Blocker: Keine
    - Action: Polieren: Error-Handling, Loading-States, Mock-Daten entfernen (oder clearly labeln)

21. ✅ **Analysis Flow/Playbook-Tabs: 'Coming Soon' Placeholder**
    - Aufwand: 0.5 Tage
    - Blocker: Keine
    - Action: Bereits existiert, nur sicherstellen, dass klar ist (Badge, Text)

**Sprint 3 Total:** ~12 Tage

---

#### **Sprint 4 — Onboarding + QA + Polish (Woche 7-8)**

**Ziel:** First-Run-Experience, Prelaunch-QA, P0/P1-Bugs fixen

**Tasks (3):**

22. ✅ **Onboarding: First-Run-Experience**
    - Aufwand: 2 Tage
    - Blocker: Alle Core-Features müssen fertig sein
    - Action: 3-Step-Wizard: "1. Journal → 2. Watchlist → 3. Alerts"

23. ✅ **Prelaunch-QA: Kernflows testen**
    - Aufwand: 2 Tage
    - Blocker: Tasks #1-21
    - Action:
      - Manuelles Testen aller Flows (Journal, Watchlist, Analysis, Alerts, Dashboard)
      - Playwright E2E-Tests für kritische Flows

24. ✅ **Prelaunch-QA: P0/P1-Bugs fixen**
    - Aufwand: 3 Tage (Buffer)
    - Blocker: Task #23
    - Action: Bug-Triage, Prioritäts-Review, Fix-Sprint

**Sprint 4 Total:** ~7 Tage

---

### Gesamt-Timeline

| Sprint | Dauer | Fokus | Aufwand (Tage) |
|--------|-------|-------|----------------|
| Sprint 1 | Woche 1-2 | Foundation & Infrastructure | 4 Tage |
| Sprint 2 | Woche 3-4 | Journal + Watchlist | 7 Tage |
| Sprint 3 | Woche 5-6 | Dashboard + Alerts + Analysis | 12 Tage |
| Sprint 4 | Woche 7-8 | Onboarding + QA + Polish | 7 Tage |
| **TOTAL** | | | **30 Tage (~6 Wochen)** |

- **Bei 1 Full-Time Developer:** ~6-8 Wochen
- **Bei 2 Developers (parallel):** ~4-5 Wochen

---

### Kritischer Pfad (Must-Have-Sequenz)

```
Foundation (Sprint 1)
    ↓
Journal CRUD (Sprint 2)
    ↓
Dashboard KPIs (Sprint 3) ← benötigt Journal-Daten
    ↓
Alerts Create/Trigger (Sprint 3)
    ↓
Dashboard Alerts-Snapshot (Sprint 3) ← benötigt Alerts
    ↓
QA + Bugfixes (Sprint 4)
```

**Parallel möglich:**
- Watchlist (Sprint 2) parallel zu Journal
- Analysis (Sprint 3) parallel zu Alerts
- Settings/PWA (Sprint 1) parallel zu allem

---

### Risiken & Mitigation

#### **Risiko 1: Alerts-Trigger-Engine zu komplex**

**Problem:** Polling-basierte Trigger-Engine (Task #19) könnte 3+ Tage dauern

**Mitigation:**
- MVP: Nur Price-Alerts (keine Volume/Volatility)
- Polling-Intervall: 1min (nicht Echtzeit)
- Fallback: Manueller Trigger-Button ("Check Now") statt automatisch

#### **Risiko 2: Dashboard-KPI-Berechnung inkonsistent**

**Problem:** P&L/Win-Rate aus Journal-Entries könnte ungenaue Ergebnisse liefern (z.B. fehlende `pnl`-Felder)

**Mitigation:**
- Validation: Journal-Create-Dialog muss `pnl` abfragen (nicht optional)
- Fallback: Bei fehlenden Daten → "N/A" statt falscher Zahl

#### **Risiko 3: Onboarding zu lang/komplex**

**Problem:** First-Run-Experience (Task #22) könnte User überfordern

**Mitigation:**
- Keep it short: Max. 3 Screens, jeweils 1 Satz
- Skippable: "Skip Tour"-Button
- Re-trigger: In Settings → "Restart Tutorial"

---

### Dependencies-Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| #7 Journal CRUD | - | #8, #14 |
| #8 Notes Edit | #7 | - |
| #14 Dashboard KPIs | #7 | #15 |
| #15 Dashboard Alerts | #17 | - |
| #17 Alerts Create | - | #18, #19 |
| #19 Alerts Trigger | #17 | #15 |
| #22 Onboarding | #1-21 | - |
| #23 QA | #1-22 | #24 |

---

### Feature-Completeness-Checklist (vor QA)

Vor Sprint 4 (QA) muss gelten:

#### **Journal ✅**
- [ ] Create Entry (Title, Notes, Direction, P&L)
- [ ] Read Entries (List, Detail-Panel)
- [ ] Update Entry (Notes editierbar)
- [ ] Delete Entry (+ Confirm-Dialog)
- [ ] Empty State (First-Entry-Onboarding)
- [ ] AI-Insights (Generate, Cache, Error-Handling)

#### **Watchlist ✅**
- [ ] Table (Symbol, Price, 24h%)
- [ ] Sortierung (Top Movers, Alphabetisch)
- [ ] Session-Filter (All, London, NY, Asia)
- [ ] Detail-Panel (Token-Info, Trend)
- [ ] "Open Chart" → `/chart-v2?symbol=X` funktioniert
- [ ] "Open Replay" (als Beta-Stub)

#### **Dashboard ✅**
- [ ] KPIs: Net P&L (aus Journal)
- [ ] KPIs: Win Rate (aus Journal)
- [ ] Alerts-Snapshot (X armed, Y triggered)
- [ ] Journal-Snapshot (letzte 3 Entries)
- [ ] Quick Actions (zu Journal/Watchlist/Analysis/Alerts)

#### **Alerts ✅**
- [ ] List (Status-Filter, Type-Filter)
- [ ] Detail-Panel (Symbol, Condition, Metadata)
- [ ] Create-Dialog (Symbol, Type, Condition, Threshold, TF)
- [ ] Edit-Handler (Modal, Update in Store)
- [ ] Delete-Handler (Confirm-Dialog)
- [ ] Trigger-Engine (Polling-MVP, setzt Status → `Triggered`)

#### **Analysis ✅**
- [ ] Overview-Tab (Stats-Grid, AI-Insight-Card)
- [ ] Flow/Playbook-Tabs (Coming Soon Placeholder)

#### **Chart ✅**
- [ ] Symbol-Param-Handling (Error wenn fehlt)
- [ ] Timeframe-Switch funktioniert
- [ ] Pan/Zoom funktioniert

#### **Settings ✅**
- [ ] AI-Provider-Auswahl (OpenAI/Grok)
- [ ] Theme-Toggle (Light/Dark/System)

#### **PWA ✅**
- [ ] Service Worker registriert
- [ ] Assets gecached (JS, CSS, Fonts)
- [ ] Offline-Hinweise (Watchlist, Charts)

#### **Onboarding ✅**
- [ ] First-Run-Experience (3 Steps)
- [ ] Skippable
- [ ] Re-trigger in Settings

---

## 7. Resources & Documentation

### 7.1 Key Files (Entry-Points)

| File | Purpose |
|------|---------|
| `src/App.tsx` | App-Root, Provider-Wrapper, Layout (Sidebar, BottomNav) |
| `src/routes/RoutesRoot.tsx` | Router-Config (alle Routes) |
| `src/pages/JournalPageV2.tsx` | Journal-Page (Core-Feature) |
| `src/pages/WatchlistPageV2.tsx` | Watchlist-Page |
| `src/pages/AnalysisPageV2.tsx` | Analysis-Page |
| `src/store/journalStore.ts` | Zustand-Store (Journal) |
| `src/lib/journal/ai/` | AI-Insights-Logic |
| `.rulesync/` | Project-Docs (ADRs, Planning, Context) |
| `CLAUDE.md` | Claude Code Rules (Auto-Generated) |

### 7.2 Documentation

| Doc | Location | Purpose |
|-----|----------|---------|
| Project-Core | `.rulesync/00-project-core.md` | Vision, Tech-Stack, Domain-Map |
| Frontend-Arch | `.rulesync/02-frontend-arch.md` | React-Architecture, 5-Layer-Model |
| PWA-Conventions | `.rulesync/03-pwa-conventions.md` | Offline-First, Service-Worker |
| Testing-Strategy | `.rulesync/06-testing-strategy.md` | Test-Pyramid, Vitest, Playwright |
| AI-Integration | `.rulesync/11-ai-integration.md` | Dual-AI, Prompt-Design, Cost-Management |
| ADRs | `.rulesync/_intentions.md` | 11 Design-Decisions dokumentiert |
| Roadmap | `.rulesync/_planning.md` | Q1 2025 Roadmap, Active-Sprint |

### 7.3 External Services & APIs

| Service | Purpose | Docs |
|---------|---------|------|
| Moralis | Token-Metadata, Live-Prices | https://docs.moralis.io/ |
| DexPaprika | OHLC-Charts, Volume | https://dexpaprika.com/api |
| OpenAI | AI-Insights, Journal-Coach | https://platform.openai.com/docs |
| Grok (xAI) | Social-Trends, Sentiment | https://x.ai/api |
| Vercel | Deployment, Edge-Functions | https://vercel.com/docs |

---

## 8. Contact & Knowledge Transfer

### 8.1 Git & Deployment

- **Current Branch:** `claude/visualize-ui-architecture-01PjVvvs5TDv4C2kDjkPHTdo`
- **Main Branch:** (nicht angegeben in Git-Status, vermutlich `main` oder `master`)
- **Deployment:** Vercel (Auto-Deploy bei Push zu Main)

**Git-Workflow:**
```bash
# Development
git checkout -b feature/alert-management
git commit -m "feat: Add Snooze/Edit/Delete handlers for Alerts"
git push -u origin feature/alert-management

# Create PR → Merge to Main → Auto-Deploy
```

### 8.2 Knowledge Transfer (Next Steps)

**Für neuen Developer:**

1. **Read This:** `CLAUDE.md` (Project-Rules), `.rulesync/00-project-core.md` (Vision)
2. **Setup:** `pnpm install` → `pnpm dev` → Open http://localhost:5173
3. **Explore:** Öffne `/journal-v2`, `/watchlist-v2`, `/analysis-v2` → verstehe Flows
4. **Deep-Dive:** Pick P0-Task (z.B. Alert-Management) → implementiere Handler
5. **Test:** `pnpm test` → `pnpm run typecheck` → `pnpm run lint`
6. **Deploy:** Push to Branch → Create PR → Merge to Main

### 8.3 Open Questions (für Handover-Call)

1. **BottomNav-Design:** Warum fehlen Watchlist/Alerts? Bewusste Entscheidung oder TODO?
2. **Signals/Lessons-Pages:** Aktiv oder deprecated? In Roadmap?
3. **Chart-Features:** Welche Drawing-Tools sind bereits implementiert?
4. **Push-Notifications:** Geplant für Q1 2025? Oder Backlog?
5. **Replay-Mode:** Wer nutzt das? User-Feedback?

---

## 9. Checklist für Übergabe

### Pre-Handover (vor dem Call)

- [x] UI-/Feature-Architektur dokumentiert
- [x] Handover-Document erstellt
- [ ] Code-Walkthrough vorbereitet (Journal, Watchlist, Analysis)
- [ ] Demo-Video aufgenommen (5-10 Min, User-Flow)
- [ ] Environment-Variables dokumentiert (`.env.example`)
- [ ] P0-Tasks priorisiert (Alert-Management, Dashboard-KPIs)

### During Handover (im Call)

- [ ] Projekt-Vision & User-Journey erklären
- [ ] Live-Demo: Journal-Flow, AI-Insights, Watchlist
- [ ] Code-Walkthrough: `journalStore`, `JournalInsightsPanel`, AI-Client
- [ ] Gaps zeigen: Alert-Actions, Dashboard-KPIs, Analysis-Tabs
- [ ] Q&A: Open Questions klären

### Post-Handover (nach dem Call)

- [ ] Handover-Doc an Team verschicken
- [ ] P0-Tasks als GitHub-Issues anlegen
- [ ] Follow-up-Call planen (2 Wochen später)
- [ ] Erreichbarkeit für Fragen klären (Slack, Email)

---

## 10. Final Notes

### Was gut läuft:

- ✅ Solide Architektur (5-Layer-Model, Zustand, Dexie)
- ✅ Offline-First-PWA (Service Worker, IndexedDB)
- ✅ AI-Integration funktioniert (OpenAI + Grok)
- ✅ Mobile-First-UX (BottomNav, Responsive)

### Was aufgeräumt werden muss:

- ⚠️ Alert-Management (Actions fehlen)
- ⚠️ Dashboard-KPIs (Dummy-Daten)
- ⚠️ Analysis-Tabs (Flow/Playbook)
- ⚠️ Technical Debt (Legacy-Routes, Zustand-Persist)

### Nächste Schritte:

1. **P0-Tasks abarbeiten** (Alert-Actions, Dashboard-KPIs)
2. **Deep-Dive in Chart/Replay**
3. **Analysis-Tabs implementieren**
4. **Technical-Debt-Cleanup** (Q1 2025)

---

**Viel Erfolg mit dem Projekt! 🚀**

Bei Fragen: Claude Code ist dein Freund (siehe `CLAUDE.md`).

---

**Ende des Handover-Documents**
