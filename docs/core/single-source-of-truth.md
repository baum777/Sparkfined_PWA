# SPARKFINED PWA — SINGLE SOURCE OF TRUTH

**Project:** Sparkfined PWA — Trading Command Center
**File Purpose:** Canonical product & architecture snapshot (Product + UX + Tech + Plan)
**Status:** ✅ Beta- / Prelaunch-ready (mit bekannten Gaps)
**Last Updated:** 2025-11-30
**Owner:** You / Future You (Product Owner & Lead Dev)

---

## 0. How to Use This File

- Dies ist **dein zentrales Referenz-Dokument** im Repo.
- Zielgruppe:
  - Du in 3+ Monaten
  - Neue Devs (Codex), Reviewer (Claude)
- Fokus:
  - **Was** Sparkfined ist (Produkt & Screens)
  - **Wie** es aufgebaut ist (Architektur)
  - **Was** schon fertig ist vs. was noch fehlt (Status & Plan)
  - **Was** als Nächstes passieren soll (Prelaunch-Scope & Sprints)

**Companion Documents:**
- `HANDOVER.md` — Detailliertes Handover-Dokument (UI-Visualisierung, Sprint-Plan)
- `.rulesync/` — Technische Dokumentation (ADRs, Planning, Context)

---

## 1. Executive Summary

**Sparkfined PWA** ist ein **offline-fähiges Trading Command Center** für Crypto-Trader, die **systematisch** arbeiten wollen – keine reinen Degen-Gambler.

Die App kombiniert:

- **Journaling:** Trades dokumentieren, Muster erkennen, mit einem AI-Coach reflektieren.
- **Market-Tracking:** Watchlists mit Live-Preisen, Session-Filtern (London/NY/Asia).
- **AI-Insights:** Pattern-Detection aus Journal-Entries und Social-Sentiment-Analysis.
- **Offline-First:** Arbeiten auch ohne Internet dank PWA & IndexedDB.

**Tech Snapshot**

- UI: React 18, TypeScript 5, Vite
- State: Zustand Stores + React Context
- Persistence: Dexie (IndexedDB), LocalStorage, Service Worker Cache
- AI: OpenAI + Grok (xAI) via Serverless-Proxy
- Deployment: Vercel (Auto-Deploy bei Merge auf Main)

**Current State (Ampel)**

- 🟢 **Production-Ready / Stable**
  - Journal v2 (Entries, Detail, Journey-Banner, AI-Insights, Dexie)
  - Watchlist v2 (Token-Table, Sessions, Detail, Chart/Replay-Links, Offline-Banner)
  - Analysis v2 – Overview (Bias/Confidence, Social-Trends, Advanced Insight)
  - Settings v2 (Theme, AI-Provider)
  - PWA-Basis (Service Worker, Offline-Hinweise, Asset-Caching)
  - Chart v2 (Offline-Banner, Default-Asset-Fallback)

- 🟡 **Partial / Needs Work**
  - Dashboard v2 (Layout & UI stehen, KPIs sind Dummy)
  - Alerts v2 (UI komplett, Actions und Trigger-Engine teilweise/unverdrahtet)
  - Replay (funktional, aber ohne aktuellen Deep-Dive)

- 🔴 **Planned / Missing**
  - Analysis Flow & Playbook Tabs (nur Platzhalter)
  - Dashboard echte KPI-Berechnung
  - Vollständiges Alert-Management (Snooze/Edit/Delete + Trigger-Engine)
  - Push Notifications & Nice-to-haves

---

## 2. Product Vision & User Journey

### 2.1 Vision

**Core-Persona:** Trader, die:

- Trades **strukturiert** festhalten wollen,
- wiederkehrende Muster & Fehler erkennen möchten,
- Entscheidungen mit **AI-Unterstützung** reflektieren,
- und auch **offline** an ihrem System arbeiten wollen.

**Core-Probleme:**

1. Trades sind über Exchanges/Notizen verstreut → Sparkfined bündelt alles in einem Journal.
2. Emotionale & wiederholte Fehler sind schwer zu erkennen → AI-Coach fasst Muster zusammen.
3. Markt & Social-Sentiment zu verfolgen kostet Fokus → Analysis + Watchlist bündeln Signale.
4. Unterwegs/ohne Netz geht nichts → PWA & IndexedDB sichern Workflow.

---

### 2.2 Typische Tagesreise eines Users

**Morgens**

1. Öffnet `/dashboard-v2`:
   - Sieht KPI-Strip (Net P&L, Win Rate, Alerts, Journey-Streak).
   - Sieht Insight-Teaser („SOL Daily Bias: Bullish, High Confidence").
   - Sieht Journal-Snapshot mit letzten Entries.

2. Geht zu `/watchlist-v2`:
   - Filtert z. B. auf „London Session".
   - Checkt SOL, BTC, ggf. weitere Tokens.

3. Öffnet `/chart-v2?symbol=SOL`:
   - Analysiert die Setups, Timeframe-Switch, Pan/Zoom.

**Während des Tages (Trade-Execution)**

1. Trade wird extern (Exchange) ausgeführt.
2. User öffnet `/journal-v2`:
   - Klickt auf `+ New Entry`.
   - Trägt Entry-Reason, Emotion, Thesis ein.
3. Später (wenn Trade abgeschlossen):
   - Aktualisiert PnL & Result im Journal.

**Abends**

1. Wieder auf `/journal-v2`:
   - Klickt `Generate Insights`.
   - AI analysiert letzte N Trades und zeigt Muster:
     - z. B. „Du oversizest 3× bei FOMO-Breakout-Setups."
2. User reflektiert, passt Setup/Regeln an.

**Wochenende**

1. Öffnet `/analysis-v2`:
   - Sieht Overview mit Bias, Confidence, Social-Trends.
2. Plant Setups & mögliche Alerts für kommende Woche:
   - Legt Alerts an (Price-/Volume-Alerts).
   - Pflegt Watchlist.

---

## 3. Screens & Routes

### 3.1 Route & Screen Map

```text
/                         → Redirect nach /dashboard-v2

PRIMARY SCREENS (Core User Workflow)
├─ /dashboard-v2          – KPI-Strip, Insight-Teaser, Journal Snapshot, Quick-Actions
├─ /journal-v2            – Trading Journal (Entries, Detail, AI-Insights, Journey-Banner)
├─ /watchlist-v2          – Watchlist (Token-Table, Session-Filter, Detail-Panel)
├─ /analysis-v2           – Analysis (Tabs: Overview / Flow / Playbook)
├─ /alerts-v2             – Alerts (Alert-List, Status-/Type-Filter, Detail-Panel)
└─ /chart-v2              – Chart (Interactive Chart, Timeframes, Replay-Entry-Point)

SECONDARY / SUPPORT
├─ /settings-v2           – Settings (AI-Provider, Theme)
├─ /replay                – Replay-Mode (Time-Travel)
├─ /notifications         – Notification-Center (Alerts, System-Messages)
├─ /landing               – Landing / Onboarding
├─ /signals               – Signals (Pattern Discovery) [PLANNED]
└─ /lessons               – Lessons (Education) [PLANNED]

UTILITY
└─ /icons                 – Icon Showcase (Design-System)
```

### 3.2 Navigation Pattern

- **Desktop:**
  - Sidebar-Navigation + `DashboardShell` als Frame (Titel, Description, Actions).
- **Mobile:**
  - BottomNav mit Fokus auf:
    - Dashboard, Analysis, Journal, Settings
  - **Watchlist & Alerts fehlen aktuell in der BottomNav** → bewusstes Design oder TODO (siehe Open Questions).

---

## 4. Screen Blueprints & Current Status

### 4.1 `/journal-v2` — Trading Journal (🟢 Stable, Herzstück)

**Ziel:** Das tägliche Trading-Ritual – dokumentieren, reflektieren, Muster erkennen.

**Layout (Top → Bottom):**

1. `DashboardShell` Header
   - Titel: „Journal"
   - Description: „N recent entries · Focus on clarity & reflection."
   - Action: `+ New Entry` (öffnet New Entry Dialog)

2. Intro-Block („Mentor Voice")
   - Label: `DAILY PRACTICE`
   - Kurze, ruhige Copy: erklärt Ritual-Charakter des Journals.
   - Info-Zeile: Status (z. B. Dexie geladen, Offline, Fehler).

3. Journey-Banner („Hero's Journey")
   - Phase: `DEGEN / SEEKER / WARRIOR / MASTER / SAGE`
   - XP Total, Streak
   - Tonalität Mentor-Coach (kein reines Stats-Dump).

4. AI Insights Panel
   - Label: `AI Insights`
   - Button: `Generate Insights` / `Regenerate Insights`
   - States:
     - Loading: „Generating insights…"
     - Error: klare Differenzierung:
       - Transport-Fehler vs. „keine Patterns gefunden"
     - Empty: „No meaningful patterns detected yet…"
   - Insight Cards (Grid):
     - Severity-Badge (Info / Warning / Critical)
     - Category-Badge (Behavior Loop, Timing, Risk Management, …)
     - Confidence %
     - Summary + Recommendation-Box
   - Social Preview:
     - Aggregierte Counts pro Category/Severity → Meta-Blick.

5. Journal Layout (2-Spalten)
   - Links: Entry-List mit Filter (z. B. All / Long / Short).
   - Rechts: Detail-Panel:
     - Metadaten (Symbol, Direction, Size, PnL, Tags)
     - Notes / Reflection (editierbar, Dexie-persistiert).

6. New Entry Dialog (Modal)
   - Inputs:
     - Title
     - Symbol / Direction / Size / Price / PnL
     - Notes (Textarea)
   - Buttons: `Cancel` / `Create`

**Status**

- CRUD: Create/Read/Update/Delete vorhanden (Notes Editing verdrahtet).
- Dexie: Entries + Insights gecacht, Limits konfiguriert.
- AI: Insights mit Caching & Telemetry (Token-Limits beachtet).
- Gaps: nur Feintuning (Copy, UX, kleinere States).

---

### 4.2 `/watchlist-v2` — Watchlist (🟢 Stable)

**Ziel:** Kuratierte Tokenliste + schnelle Orientierung über Sessions & Moves.

**Layout:**

- Intro-Section:
  - Label: `WATCHLIST`
  - Headline + Helper-Text
  - Live/Offline-Info (Poll-Status, Cache)

- Offline-Banner:
  - Zeigt „You're offline. Showing last cached prices." wenn disconnected
  - Nutzt `StateView` Component (compact mode)

- Controls:
  - Session Pills: `All / London / NY / Asia`
  - Sort-Toggle: z. B. `Top Movers` / `Alphabetical`
  - Live-Badge (z. B. „LIVE" oder „PAUSED")

- Table:
  - Columns: Symbol, Name, Price, 24h % Change (+ ggf. Volume/Trend)
  - Row-Click → setzt Active Token.

- Right Detail-Panel:
  - Token-Basisinfos (Name, Symbol, Market-Infos)
  - Hype/Sentiment-Teaser
  - Actions:
    - `Open Chart` → `/chart-v2?symbol=...`
    - `Open Replay` → `/replay?symbol=...` (darf Beta/Stub sein)

**Status**

- Sessions & Sortierung verdrahtet.
- Detail-Panel + Chart/Replay-Links aktiv.
- Polling & Offline-Hinweise implementiert (Sprint 1).
- Offline-Banner mit `StateView` Component.

---

### 4.3 `/analysis-v2` — Market & Setup Analysis (🟢 Overview, 🟡 Flow/Playbook)

**Ziel:** AI-gestützte Markt-Analyse, Fokus zunächst auf **Overview**.

**Tabs:**

1. `Overview` (fertig)
2. `Flow` (planned)
3. `Playbook` (planned)

**Overview Layout:**

- Current AI Insight Block:
  - Bias: Bullish / Bearish / Neutral
  - Confidence
  - Timeframe
  - Price + 24h %

- Social Trend Card:
  - Tweet/Feed-Snippet
  - Sentiment
  - Hype-Level
  - Link zur Quelle

- Advanced Insight Card:
  - Zusammenfassung + ausführliche Analyse
  - Collapsible / Expandable

**Flow & Playbook:**

- Aktuell: „Coming Soon" Blöcke, als solche klar gekennzeichnet.

**Status**

- Overview produktionsreif.
- Flow/Playbook bewusst offen gelassen als eigene Iteration.

---

### 4.4 `/alerts-v2` — Alerts (🟡 Partial)

**Ziel:** Price/Volume/Trend-Alerts verwalten & mittelfristig triggern (inkl. Grok-Integration).

**Layout:**

- Filter-Pills:
  - Status: `All / Armed / Triggered / Snoozed`
  - Type: `All / Price / Volume / Volatility / Trend`

- Alert-Liste (links):
  - Key-Daten: Symbol, Type, Condition, Status.

- Detail-Panel (rechts):
  - Vollständige Alert-Details
  - Actions:
    - `Snooze`
    - `Edit`
    - `Delete`

**Status**

- UI vollständig.
- Alerts-Store & Dexie-Tabelle existieren.
- Actions `Snooze/Edit/Delete` teilweise oder nur visuell verdrahtet.
- Trigger-Engine als Polling-MVP geplant (siehe Prelaunch-Plan).

---

### 4.5 `/dashboard-v2` — Dashboard (🟡 Partial)

**Ziel:** Schnell-Überblick über System-Health & tägliche Fokuspunkte.

**Layout:**

- KPI-Strip:
  - Net P&L
  - Win Rate
  - Alerts (armed/triggered)
  - Streak (Journey)

- Left Column:
  - AI Insight Teaser (z. B. aktuelles Bias/Setup)

- Right Column:
  - Journal Snapshot (letzte 3 Entries, klickbar → `/journal-v2?entry=...`)

- Quick Actions:
  - Buttons zu: Journal, Watchlist, Analysis, Alerts

**Status**

- UI etabliert, responsive.
- KPIs derzeit auf Dummy-Daten.
- Snapshot & Quick Actions teilweise verdrahtet.

---

### 4.6 `/chart-v2` & `/replay` — Chart & Replay (🟢 Chart Basics, 🟡 Replay)

**Ziel:** Chart-Ansicht mit Basisfunktionen + Replay-Modus für vergangene Sessions.

**Chart v2:**

- Aufruf: `/chart-v2?symbol=XYZ`
- Features:
  - Timeframe-Switch (z. B. 1m, 5m, 1h, 4h)
  - Pan & Zoom
  - Error-Handling:
    - Fehlender Symbol-Param → Info-Banner „Showing default (SOL/USDT)"
    - Link zu Watchlist zum Auswählen anderer Tokens
  - Offline-Banner: Zeigt „Showing last cached chart data" wenn disconnected

**Replay:**

- Route: `/replay`
- Time-Travel / Playback von Daten.
- Noch nicht vollständig dokumentiert; benötigt eigenen Deep-Dive.

**Status (Sprint 1 Complete):**

- ✅ Offline-Banner implementiert (`useOnlineStatus` + `StateView`)
- ✅ Default-Asset-Fallback mit Info-Banner
- ✅ Symbol-Param-Handling robust

---

### 4.7 `/settings-v2`, `/landing`, `/notifications`, `/signals`, `/lessons`

- **Settings v2 (🟢):**
  - AI-Provider Selection (OpenAI / Anthropic / Grok)
  - Theme (Light / Dark / System)
  - Optional: Re-trigger Onboarding („Restart Tutorial")

- **Landing / Onboarding (🟢 für MVP):**
  - First-Run-Experience (3 Steps, skippable)
  - Erklärt kurz Journal → Watchlist → Alerts

- **Notifications (🟡/🔴):**
  - UI-Struktur für Notification-Center vorhanden; Integration von Push/Alerts noch offen.

- **Signals & Lessons (🔴 Planned/Unclear):**
  - Routen &/oder Stubs vorhanden.
  - Status: [PLANNED] oder [DEPRECATED] – muss produktseitig entschieden werden.

---

## 5. Architecture Overview (UI → Stores → Services → Persistence)

### 5.1 Layer-Modell

```text
[ USER INTERFACE (PAGES) ]
  DashboardPageV2
  JournalPageV2
  WatchlistPageV2
  AnalysisPageV2
  AlertsPageV2
  ChartPageV2
  SettingsPageV2
  ReplayPage
  NotificationsPage
         |
         v
[ STATE MANAGEMENT (ZUSTAND STORES + CONTEXT) ]
  journalStore
  watchlistStore
  alertsStore
  chartUiStore
  liveDataStore
  walletStore
  onboardingStore

  SettingsProvider (Theme, AI-Provider)
  AIProviderState  (OpenAI/Grok)
  TelemetryProvider

         |
         v
[ SERVICES & DOMAIN LOGIC ]
  JournalService        (CRUD, Dexie)
  TelemetryService      (Events → /api/telemetry)
  ReplayService         (Replay Sessions)
  ExportService         (CSV/JSON Export)
  AI Services:
    aiClient (OpenAI/Grok)
    journal/ai (Journal-Insights)
    buildAdvancedInsight (Analysis)
    grokPulse/engine (Social-Trends)

  Data Adapters:
    moralisAdapter      (Token-Metadata, Prices)
    dexpaprikaAdapter   (OHLC, Volume)
    dexscreenerAdapter  (Token-Trends)
    pumpfunAdapter      (Meme-Coins)

         |
         v
[ PERSISTENCE & EXTERNAL APIS ]
  Dexie (IndexedDB):
    - Journal-Entries
    - Journal-Insights
    - Watchlist
    - Alerts

  LocalStorage:
    - Settings (Theme, AI-Provider)
    - Onboarding-State
    - Session-Flags

  Service Worker Cache:
    - PWA-Assets
    - Teile von Chart/Price-Daten

  External APIs:
    - Moralis, DexPaprika, DexScreener, PumpFun
    - OpenAI, Grok
    - Vercel Edge Functions (/api/telemetry, /api/moralis/*, /api/data/*)
```

---

## 6. Current Implementation Status & Known Gaps

### 6.1 What Works Well

- ✅ Klare Page- & Route-Struktur (v2-Pages als Primary Screens).
- ✅ Offline-First Architektur (Dexie, Service Worker, API-Proxies).
- ✅ Dual-AI-Integration (OpenAI + Grok) mit sauberem Routing & Caching.
- ✅ Mobile-First-UX (BottomNav, responsive Layouts, Touch-optimiert).
- ✅ Tests & Type Safety (TS strict, Lints & Tests laufen).
- ✅ Pattern-Library (StateView, EmptyState, ErrorState) - Production-ready.
- ✅ Offline-Indicators (Watchlist, Chart) - Sprint 1 complete.

### 6.2 Gaps & Risks

- ⚠️ **Alert-Management**
  - Actions `Snooze/Edit/Delete` teilweise nur visuell.
  - Trigger-Engine (Polling) noch nicht fertig oder nicht dokumentiert.

- ⚠️ **Dashboard-KPIs**
  - KPIs nutzen Dummy-Daten.
  - Keine echte Berechnung aus Journal & Alerts.

- ⚠️ **Analysis-Tabs (Flow & Playbook)**
  - Nur „Coming Soon" Platzhalter, keine Logik.

- ⚠️ **Replay**
  - Funktionalität vorhanden, aber Detailgrad unklar.
  - Status von Replay-Controls unklar.

- ⚠️ **Navigation-Inkonsistenz**
  - BottomNav (Mobile) enthält nicht alle wichtigen Routen (Watchlist/Alerts).
  - Sidebar (Desktop) zeigt mehr Seiten als BottomNav.

- ⚠️ **Zustand-Persistenz**
  - Stores sind primär in-memory.
  - Dexie übernimmt Persistence, aber kein `zustand/persist` für schnelle Rehydration.

- ⚠️ **Env/Security**
  - Vercel Env-Setup ist sauber, aber Audit für `VITE_*`-Variablen notwendig.

---

## 7. Prelaunch Scope — Must-Haves for First Public Release

### A. Journal v2 – Heart of the App (P0)

- Vollständiges Journal-CRUD:
  - Entries anlegen, anzeigen, bearbeiten, löschen.
- Notes im Detail-Panel editierbar, sauber Dexie-persistiert.
- Empty State / Onboarding:
  - „Starte mit deinem ersten Trade"-Banner.
- AI-Insights Panel (MVP):
  - Button `Generate Insights`.
  - Analyse der letzten N Trades.
  - Insight-Cards + Loading/Error/Empty States.

### B. Watchlist v2 – Marktübersicht (P0)

- Watchlist-Tabelle mit: Symbol, Name, Price, 24h % Change.
- Sortierung: `Top Movers` / `Alphabetical`.
- Session-Filter: `All / London / NY / Asia`.
- Detail-Panel:
  - Basisdaten.
  - `Open Chart` → `/chart-v2?symbol=...` (muss stabil sein).
  - `Open Replay` optional (Beta/Stub ok).

### C. Analysis v2 – Overview Tab (P0)

- **Overview** als einzig voll funktionaler Tab zum Prelaunch:
  - Stats-Grid (Bias, Confidence, Timeframe, Price, 24h%).
  - Solide AI-Insight-Card (Headline, Summary, Bulletpoints).
- **Flow & Playbook**:
  - Tabs sichtbar, klar als „Coming Soon" markiert.

### D. Alerts v2 – Minimaler, echter Alert-Loop (P0)

- Alerts-Liste mit Status:
  - `Armed`, `Triggered` (optional `Snoozed` als nächster Schritt).
- Alert erstellen:
  - Symbol, Typ (Price/%Move/Volume), Condition, Threshold, Timeframe.
- Alert bearbeiten & löschen (inkl. Confirm-Dialog, keine Zombie-Alerts).
- Trigger-Engine (Polling-MVP):
  - Regelmäßiges Abfragen von Kursen/Volumes.
  - Setzt Status auf `Triggered` & schreibt Log/Store.

### E. Dashboard v2 – Prelaunch KPIs & Navigation (P0)

- Echte KPIs aus Journal:
  - Net P&L.
  - Win Rate (z. B. letzten 30 Tage).
- Alerts-Snapshot:
  - Aktive + kürzlich getriggerte Alerts.
- Journal-Snapshot:
  - Letzte 3 Entries, klickbar ins Journal.
- Quick Actions:
  - Journal, Watchlist, Analysis, Alerts.

### F. Chart v2 – Solide Basis (P1)

- `/chart-v2?symbol=XYZ` lädt funktionierendes Chart (Timeframes, Pan/Zoom).
- Standard-Timeframe (z. B. 1h).
- Fehler-Handling:
  - Fehlender Symbol-Param → Hinweis statt kaputte Seite.

### G. Settings, Onboarding & Offline-Basis (P1)

- Settings:
  - AI-Provider wählen (OpenAI/Grok).
  - Theme (Light/Dark/System).
- Onboarding:
  - Kurze First-Run-Experience (3 Kernflows), skippable, später re-triggerbar.
- PWA / Offline:
  - Service Worker registriert, wichtigste Assets gecached.
  - Journal-Einträge offline sichtbar.
  - Sinnvolle Offline-Hinweise für Watchlist/Charts.

### H. Cross-Cutting (P1/P2)

- Konsistente Loading- & Error-States für alle Prelaunch-Screens.
- Prelaunch-QA-Runde:
  - Kernflows testen (Journal, Watchlist, Analysis, Alerts, Dashboard).
  - P0/P1-Bugs fixen.

---

## 8. Prelaunch Plan — Sprints & Timeline (ca. 6–8 Wochen)

### Sprint 1 — Foundation & Infrastructure ✅ **COMPLETE** (Woche 1–2)

**Ziel:** Basis-Infrastruktur & Cross-Cutting fertig machen.

**Status:** ✅ Abgeschlossen (alle 6 Tasks in < 1 Tag)

**Delivered:**

- ✅ Settings:
  - AI-Provider-Auswahl (OpenAI/Anthropic/Grok) — bereits implementiert, verifiziert
  - Theme-Toggle (Light/Dark/System) — bereits implementiert, verifiziert

- ✅ Cross-Cutting:
  - Pattern-Library: `<StateView />`, `<ErrorState />`, `<EmptyState />`, `<LoadingSkeleton />`
  - Alle Components production-ready, A11y-konform, dokumentiert

- ✅ PWA:
  - Service Worker + Asset-Caching — vite-plugin-pwa perfekt konfiguriert
  - Offline-Hinweise (Watchlist/Charts) — `useOnlineStatus` Hook + `StateView` implementiert

- ✅ Chart v2:
  - Symbol-Param-Handling + Error-State — Default-Asset-Fallback mit Info-Banner
  - Offline-Banner implementiert

**Outcome:**
- Viele Tasks waren bereits vollständig implementiert (4/6)
- Nur 2 Tasks benötigten neue Code-Änderungen (Offline-Banner)
- Foundation ist production-ready für Sprint 2

---

### Sprint 2 — Core Features: Journal + Watchlist (Woche 3–4)

**Ziel:** Heart of the App + Markt-Übersicht stabil.

**Status:** 🔜 Ready to Start

- Journal:
  - Vollständiges CRUD (inkl. Delete + Confirm).
  - Detail-Panel-Notes editierbar + Dexie-Persist.
  - Empty State / Onboarding.
  - AI-Insights: Loading/Error & Cache-Strategie prüfen.

- Watchlist:
  - Sortierung (Top Movers / Alphabetical).
  - Detail-Panel Action `Open Chart` stabil verdrahtet.

### Sprint 3 — Dashboard + Alerts + Analysis (Woche 5–6)

**Ziel:** Schließen der P0-Gaps.

- Dashboard:
  - Echte KPIs (Net P&L, Win Rate aus Journal).
  - Alerts-Snapshot (armed/triggered).
  - Quick Actions verdrahten.

- Alerts:
  - Create-Dialog (Symbol, Type, Condition, Threshold, Timeframe).
  - Edit/Delete-Handler + Confirm-Dialog.
  - Trigger-Engine MVP (Polling, setzt Status `Triggered`).

- Analysis:
  - Overview-Tab finalisieren (Error-Handling, Loading, Mock-Daten bereinigen).
  - Flow/Playbook-Tabs als „Coming Soon" klar markieren.

### Sprint 4 — Onboarding + QA + Polish (Woche 7–8)

**Ziel:** First-Run-Experience & Prelaunch-Reife.

- Onboarding:
  - 3-Step-Wizard (1. Journal → 2. Watchlist → 3. Alerts).
  - Skippable + re-triggerbar.

- Prelaunch-QA:
  - Manuelles Testen aller Kernflows.
  - E2E-Tests (z. B. Playwright) für kritische Flows.

- Bugfixes:
  - P0/P1-Bugs fixen, kleiner Polish-Sprint.

---

## 9. Development Priorities (P0 / P1 / P2)

- **P0 (Must Ship)**
  1. Alert-Management vollständig verdrahten (Snooze, Edit, Delete).
  2. Dashboard-KPIs aus echten Daten (Journal-Stats, Alert-Counts).
  3. Journal CRUD & AI-Insights robust.
  4. Watchlist-Flow (Sessions, Detail, Chart-Link) stabil.

- **P1 (Next)**
  1. Analysis Flow & Playbook Tabs (Grundversion).
  2. Replay Deep-Dive (Controls, User-Flows).
  3. Onboarding & Cross-Cutting Pattern-Polish.

- **P2 (Backlog / Cleanup)**
  1. BottomNav-Inkonsistenz auflösen (Watchlist/Alerts ergänzen oder bewusst dokumentieren).
  2. Legacy-Routes & Dead Code aufräumen.
  3. `zustand/persist` für relevante Stores.
  4. Push Notifications für Alerts (Browser, PWA).

---

## 10. Key Files, Docs & External Services

### 10.1 Key Files (Entry Points)

- `src/App.tsx` — App Root, Provider-Wrapper, Layout.
- `src/routes/RoutesRoot.tsx` — Router-Config (alle Routen).
- `src/pages/DashboardPageV2.tsx` — Dashboard v2.
- `src/pages/JournalPageV2.tsx` — Journal v2.
- `src/pages/WatchlistPageV2.tsx` — Watchlist v2.
- `src/pages/AnalysisPageV2.tsx` — Analysis v2.
- `src/pages/AlertsPageV2.tsx` — Alerts v2.
- `src/pages/ChartPageV2.tsx` — Chart v2.
- `src/store/journalStore.ts` — Journal-Store.
- `src/store/watchlistStore.ts` — Watchlist-Store.
- `src/store/alertsStore.ts` — Alerts-Store.
- `src/lib/journal/ai/` — Journal-AI-Insights.
- `.rulesync/` — Projekt-Docs (ADRs, Planning, Context).
- `CLAUDE.md` — Claude Code Rules (Auto-generated).
- `HANDOVER.md` — Detailliertes Handover-Dokument.

### 10.2 Documentation

- `.rulesync/00-project-core.md` — Vision, Tech-Stack, Domain-Map.
- `.rulesync/02-frontend-arch.md` — Frontend-Architektur, 5-Layer-Model.
- `.rulesync/03-pwa-conventions.md` — PWA & Offline-Conventions.
- `.rulesync/06-testing-strategy.md` — Tests (Vitest, Playwright).
- `.rulesync/11-ai-integration.md` — Dual-AI, Prompt-Design, Cost-Management.
- `.rulesync/_intentions.md` — Architecture Decision Records (ADRs).
- `.rulesync/_planning.md` — Roadmap & Sprint-Planung.
- `HANDOVER.md` — Vollständige UI-Architektur-Visualisierung & Prelaunch-Plan.

### 10.3 External Services & APIs

- **Moralis** — Token-Metadata & Live-Prices.
- **DexPaprika** — OHLC & Volume-Daten.
- **DexScreener** — Token-Discovery & Trends.
- **PumpFun** — Meme-Coin-Data.
- **OpenAI** — AI-Insights, Journal-Coach.
- **Grok (xAI)** — Social-Trends, Sentiment.
- **Vercel** — Deployment, Edge Functions (`/api/*` Proxies, Telemetry).

---

## 11. Setup & Dev-Workflow (Kurzfassung)

- **Dev Setup**
  - `pnpm install`
  - `pnpm dev` → `http://localhost:5173`

- **Testing & Quality**
  - `pnpm test`
  - `pnpm run typecheck`
  - `pnpm run lint`

- **Git Workflow**
  - Branch: `feature/<feature-name>`
  - PR → Review → Merge to `main`
  - Merge → Auto-Deploy via Vercel.

---

## 12. Open Questions & Follow-Ups

1. **BottomNav-Design**
   - Sollen Watchlist/Alerts in die BottomNav?
   - Oder bewusst nur Dashboard/Analysis/Journal/Settings?

2. **Signals & Lessons Pages**
   - Aktiv in Roadmap?
   - Oder deprecated & zu entfernen?

3. **Replay**
   - Welche Replay-Controls sind produktreif?
   - Wie wird Replay real genutzt (Use Cases, Feedback)?

4. **Push Notifications**
   - Alerts → Browser- und PWA-Notifications in Q1 2025?
   - Oder bewusst erst später?

5. **AI-Cost-Management**
   - Limits & Budgets für OpenAI/Grok weiter herunterziehen?
   - Mehr Caching / Batching?

---

_End of Single Source of Truth — Sparkfined PWA_
