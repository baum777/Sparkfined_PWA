# Sparkfined PWA – Strukturierte Übersicht

**Erstellt**: 2025-12-08  
**Zweck**: Vollständige Architektur-Dokumentation aller Pages, Komponenten, Navigation und Abhängigkeiten

---

## 📋 Inhaltsverzeichnis

1. [Routing-Architektur](#routing-architektur)
2. [Pages-Übersicht](#pages-übersicht)
3. [Komponenten-Architektur](#komponenten-architektur)
4. [State Management (Stores)](#state-management-stores)
5. [Navigationsfluss](#navigationsfluss)
6. [Abhängigkeiten und Datenfluss](#abhängigkeiten-und-datenfluss)
7. [Architektur-Diagramm](#architektur-diagramm)

---

## 🗺️ Routing-Architektur

### Haupt-Router: `src/routes/RoutesRoot.tsx`

**Lazy Loading**: Alle Pages werden via `React.lazy()` code-gesplittet

**Globale Wrapper**:
- `ErrorBoundary` – Fehlerbehandlung
- `SwipeNavGate` – Swipe-Navigation zwischen Pages
- `UpdateBanner` – PWA-Update-Benachrichtigungen
- `Suspense` mit `Fallback` – Loading-Spinner während Lazy Load

### Route-Definitionen

| Route | Component | Redirect | Beschreibung |
|-------|-----------|----------|--------------|
| `/landing` | `LandingPage` | - | Marketing Landing Page |
| `/` | - | `/dashboard-v2` | Root redirect |
| `/dashboard-v2` | `DashboardPageV2` | - | Haupt-Dashboard |
| `/journal-v2` | `JournalPageV2` | - | Trading-Journal |
| `/analysis-v2` | `AnalysisPageV2` | - | AI-Analyse & Insights |
| `/watchlist-v2` | `WatchlistPageV2` | - | Token-Watchlist |
| `/alerts-v2` | `AlertsPageV2` | - | Preis-Alerts |
| `/chart-v2` | `ChartPageV2` | - | Chart-Workspace |
| `/oracle` | `OraclePage` | - | Daily Oracle Reports |
| `/settings-v2` | `SettingsPageV2` | - | App-Einstellungen |
| `/replay` | `ReplayPage` | - | Replay-Player & Pattern Dashboard |
| `/replay/:sessionId` | `ReplayPage` | - | Replay-Session mit ID |
| `/notifications` | `NotificationsPage` | - | Push-Benachrichtigungen |
| `/signals` | `SignalsPage` | - | Trading-Signale |
| `/lessons` | `LessonsPage` | - | Trading-Lektionen |
| `/icons` | `IconShowcase` | - | Icon-Bibliothek Showcase |
| `/styles` | `StyleShowcasePage` | DEV only | Design System Showcase |
| `/ux` | `UXShowcasePage` | DEV only | UX-Komponenten Showcase |

**Legacy Redirects**:
- `/dashboard` → `/dashboard-v2`
- `/board` → `/dashboard-v2`
- `/analyze` → `/analysis-v2`
- `/analysis` → `/analysis-v2`
- `/chart` → `/chart-v2`
- `/journal` → `/journal-v2`
- `/watchlist` → `/watchlist-v2`
- `/alerts` → `/alerts-v2`

---

## 📄 Pages-Übersicht

### 1. **DashboardPageV2** (`/dashboard-v2`)

**Hauptfunktion**: Zentrale Übersicht über KPIs, Recent Entries und aktive Alerts

**UI-Elemente**:
- `DashboardShell` – Page-Wrapper mit Header
- `DashboardKpiStrip` – 4 KPI-Tiles (Net P&L, Win Rate, Alerts Armed, Journal Streak)
- `DashboardQuickActions` – Schnellzugriff-Buttons
- `DashboardMainGrid` – 3-Spalten-Layout für:
  - `InsightTeaser` – AI Daily Bias
  - `JournalSnapshot` – 3 neueste Journal-Einträge
  - `AlertsSnapshot` – Aktive Alerts
- `ErrorBanner` – Fehleranzeige mit Retry

**Daten-Quellen**:
- `useJournalStore` → Journal-Einträge
- `useAlertsStore` → Alerts
- Berechnungen via `calculateKPIs.ts`

**States**:
- `isLoading`, `error`, `hasData`

---

### 2. **JournalPageV2** (`/journal-v2`)

**Hauptfunktion**: Trading-Journal mit Hero's Journey Gamification

**UI-Elemente**:
- `DashboardShell` mit Custom Header
- `JournalJourneyBanner` – XP, Phase, Badges (wenn Journey-Meta vorhanden)
- `JournalInsightsPanel` – AI-generierte Insights
- `JournalLayout` – Split-View:
  - **Links**: `JournalList` mit Filter-Pills (All, Long, Short)
  - **Rechts**: `JournalDetailPanel` – Details des aktiven Eintrags
- `JournalNewEntryDialog` – Modal zum Erstellen neuer Einträge
- `JournalHeaderActions` – "New Entry" Button + Loading Indicator

**Daten-Quellen**:
- `useJournalStore` → `entries`, `activeId`, `isLoading`, `error`
- `useSearchParams` → URL-State-Sync (`?entry=<id>`)
- `loadJournalEntries()` – IndexedDB via Dexie
- `computeUserJourneySnapshotFromEntries()` – Journey-Analytik

**Filter**:
- Direction: `all | long | short`

**Key Features**:
- URL-State-Synchronisation (aktiver Entry in Query-Param)
- Offline-First (IndexedDB-Persistierung)
- Quick Create Dialog
- Journey Progress Tracking

---

### 3. **AnalysisPageV2** (`/analysis-v2`)

**Hauptfunktion**: AI-Marktanalyse mit Multi-Tab-Interface

**UI-Elemente**:
- `DashboardShell`
- `AnalysisLayout` – Tab-System:
  - **Overview**: AI Insight, Market Stats, Trend Snapshot
  - **Flow**: (Coming Soon)
  - **Playbook**: (Coming Soon)
- `AnalysisOverviewStats` – 5 Stat-Tiles (Bias, Range, Volume, Price, 24h Change)
- `AdvancedInsightCard` – Detaillierte AI-Analyse
- `AnalysisHeaderActions` – Refresh + Error Handling
- `TrendBadge` – Social Trend Indicators

**Daten-Quellen**:
- `useAdvancedInsightStore` → AI-Insights (sections, trendSnapshots)
- `fetchAnalysisSnapshot()` → Market Data
- `generateMockAdvancedInsight()` – Fallback Mock Data

**States**:
- `activeTab` (sync mit URL `?tab=`)
- `marketSnapshot`, `isMarketLoading`, `marketError`

**Tab-Logik**:
- `overview` → Zeigt Bias, Range, Volume, Price, Social Trends
- `flow` / `playbook` → Placeholder mit "Coming Soon"

---

### 4. **WatchlistPageV2** (`/watchlist-v2`)

**Hauptfunktion**: Token-Watchlist mit Live-Preisen und Trend-Tracking

**UI-Elemente**:
- `DashboardShell`
- `WatchlistLayout` – 2-Spalten-Layout:
  - **Links**: `WatchlistTable` mit Session-Filtern + Sort-Toggle
  - **Rechts**: `WatchlistDetailPanel` – Details + Chart/Replay-Buttons
- `WatchlistHeaderActions`
- `LiveStatusBadge` – Zeigt Live-Daten-Status
- Session-Filter-Pills: `All | London | NY | Asia`
- Sort-Toggle: `Default | Top Movers | A-Z`
- Offline-Banner via `StateView`

**Daten-Quellen**:
- `useWatchlistStore` → `rows`, `trends`, `isLoading`, `error`
- `fetchWatchlistQuotes()` → Fetch Live-Preise
- `useOnlineStatus()` → Online/Offline-Detection

**Interaktionen**:
- Klick auf Row → Detail Panel
- "Open Chart" → Navigate zu `/chart-v2?symbol=...`
- "Open Replay" → Navigate zu `/replay?symbol=...&from=...&to=...`

---

### 5. **AlertsPageV2** (`/alerts-v2`)

**Hauptfunktion**: Preis-Alert-Verwaltung mit Filter und Detail-View

**UI-Elemente**:
- `DashboardShell`
- `AlertsLayout` – 2-Spalten-Layout:
  - **Links**: `AlertsList` mit Filter-Pills
  - **Rechts**: `AlertsDetailPanel` – Detail + Edit/Delete
- `AlertsHeaderActions` – "Create Alert" Button
- Status-Filter: `All | Armed | Triggered | Paused`
- Type-Filter: `All | Price Above | Price Below`
- URL-State-Sync: `?alert=<id>`

**Daten-Quellen**:
- `useAlertsStore` → `alerts`
- `useSearchParams` → Active Alert Sync

**Interaktionen**:
- Klick auf Alert → Detail Panel + URL Update
- Delete Alert → Callback `onAlertDeleted` (unselect wenn aktiv)

---

### 6. **ChartPageV2** (`/chart-v2`)

**Hauptfunktion**: Trade-ready Chart mit Indicators, Annotations, Replay

**UI-Elemente**:
- `DashboardShell`
- `Card` (glass variant) mit:
  - `ChartIntroBanner` (dismissable)
  - Offline-Banner via `StateView`
  - Default-Asset-Warning (wenn kein Symbol in URL)
  - Timeframe-Buttons: `15m | 1h | 4h | 1d`
  - "Refresh" + "Open Replay" Buttons
  - Indicator-Toolbar:
    - Toggle: `SMA 20 | EMA 50 | BB 20/2`
    - Preset-Buttons: `Scalper | Swing | Position`
  - `AdvancedChart` – Canvas-basierter Chart
  - `ChartLegend` – Annotation-Legende
  - Error/Stale/No-Data-Banner

**Daten-Quellen**:
- `useOhlcData()` → Candles, Status, Error
- `useIndicators()` → Berechnete Indikatoren
- `useAlertsStore` → Alert-Annotations
- `useJournalStore` → Journal-Annotations
- `useChartUiStore` → Indicator-Config (overlays, preset)
- `useSearchParams` → `symbol`, `address`, `network`, `timeframe`, `focus`

**Annotations**:
- Journal Entries (📝)
- Alerts (⚠️)
- Pulse Signals (⚡)

**Interaktionen**:
- Timeframe-Switch → URL Update + Refresh
- Indicator-Toggle → Local State (pro Asset gespeichert)
- Preset-Select → Anwendung vordefinierter Indicator-Sets
- "Open Replay" → Navigate zu `/replay?...`
- Annotation-Click → Jump to Timestamp (via `?focus=`)
- Right-Click on Chart → Create Journal/Alert at Point

---

### 7. **OraclePage** (`/oracle`)

**Hauptfunktion**: Tägliche Meta-Market Intelligence Reports

**UI-Elemente**:
- `DashboardShell`
- Header Actions: `Refresh` + `Mark as Read` (wenn unread)
- Reward-Message Banner (nach Mark as Read)
- Report Header: Date, Score, Top Theme
- Full Report `<pre>` Block
- `OracleThemeFilter` – Theme-Dropdown
- `OracleHistoryChart` – 30-Tage-Score-Chart
- `OracleHistoryList` – Vergangene Reports

**Daten-Quellen**:
- `useOracleStore` → `todayReport`, `reports`, `isLoading`, `error`
- `loadTodayReport()`, `loadHistory(30)`

**Gamification**:
- Mark as Read → +50 XP, Streak erhöhen, Badge-Unlock
- High-Score-Benachrichtigung (Score >= 6)
- Auto-Journal-Entry bei erstem Read

**Filter**:
- Theme-Filter → Filtert Reports nach `topTheme`

---

### 8. **SettingsPageV2** (`/settings-v2`)

**Hauptfunktion**: App-Einstellungen (Wrapper um `SettingsPage`)

**UI-Elemente**:
- `DashboardShell`
- `SettingsHeaderActions`
- `Card` Container
- `SettingsPage` (Legacy Component)

**Settings-Bereiche** (via `SettingsPage`):
- Theme (Light/Dark)
- Data Backup/Restore
- AI Usage Preferences
- Notifications
- Clear Cache
- Export Data

---

### 9. **ReplayPage** (`/replay` oder `/replay/:sessionId`)

**Hauptfunktion**: Chart-Replay mit Playback-Controls + Pattern-Dashboard

**UI-Elemente**:
- **View-Toggle**: Player vs. Dashboard
- **Player Mode**:
  - Timeframe-Buttons
  - Refresh + Go Live Buttons
  - `AdvancedChart` (mit Replay-State)
  - `ReplayPlayer` – Playback-Controls (Play/Pause, Seek, Speed, Bookmarks)
  - Frame-Counter
- **Dashboard Mode**:
  - `PatternDashboard` – Stats + Entry-Filter
  - Pattern-Filter (Setup, Emotion)
  - Entry-List mit "View" Button

**Daten-Quellen**:
- `useOhlcData()` → Candles
- `getSession(sessionId)` → Replay-Session-Daten
- `queryEntries()` → Journal-Entries für Pattern-Analyse
- `calculatePatternStats()` → Win Rate, Avg P&L, etc.

**Playback**:
- State: `currentFrame`, `isPlaying`, `speed`
- `setInterval`-Loop für Auto-Play
- Seek via Slider
- Bookmarks: Add/Delete/Jump

**Mode-Switch**:
- `replay` → Frame-by-Frame mit Playback
- `live` → Neueste Candle (via "Go Live")

---

### 10. **LandingPage** (`/landing`)

**Hauptfunktion**: Marketing-Page für Neunutzer

**Sektionen**:
1. **Hero**: Headline, CTA ("Enter Command Center"), Demo-Placeholder
2. **Ticker**: Animierte Testimonial-Quotes
3. **Problem Points**: 4 Cards mit Pain Points
4. **Features**: 3 Modul-Cards (Charts, Alerts, Journal)
5. **Stats**: 6 Metrik-Tiles (Uptime, Latency, etc.)
6. **Pricing**: 2 Tiers (Free, OG)
7. **Testimonials**: 3 Cards mit Auto-Rotation
8. **CTA Final**: "Ready to trade smarter?"
9. **Footer**: Links + Copyright

**Navigation**:
- Alle CTAs führen zu `/dashboard-v2`
- Kein Layout/BottomNav (standalone)

---

### 11. **Weitere Pages** (weniger kritisch)

- **NotificationsPage**: Push-Benachrichtigungen-Liste
- **SignalsPage**: Trading-Signale-Feed
- **LessonsPage**: Educational Content
- **IconShowcase**: Icon-Bibliothek für Design
- **StyleShowcasePage** (DEV): Design-Token-Preview
- **UXShowcasePage** (DEV): UX-Komponenten-Preview

---

## 🧩 Komponenten-Architektur

### Layout-Komponenten (`src/components/layout/`)

| Komponente | Zweck |
|------------|-------|
| `PageLayout` | Globales Page-Layout mit Sidebar/Header |
| `BottomNav` | Mobile Bottom-Navigation (5 Tabs + "More") |
| `NavigationDrawer` | Drawer für zusätzliche Nav-Items (Watchlist, Alerts, Oracle, etc.) |
| `Sidebar` | Desktop-Sidebar (Alternative zu BottomNav) |
| `FormLayout` | Standard-Form-Wrapper |
| `FilterPills` | Wiederverwendbare Filter-Pills |
| `ResponsiveTable` | Responsive Table-Wrapper |

### Domain-Komponenten

#### **Dashboard** (`src/components/dashboard/`)
- `DashboardShell` – Page-Wrapper mit Title, Description, Actions
- `DashboardKpiStrip` – KPI-Tiles-Grid
- `DashboardQuickActions` – Action-Buttons
- `DashboardMainGrid` – 3-Spalten-Layout
- `InsightTeaser` – AI-Insight-Card
- `JournalSnapshot` – Recent Journal Entries
- `AlertsSnapshot` – Active Alerts

#### **Journal** (`src/components/journal/`)
- `JournalLayout` – Split-View (List + Detail)
- `JournalList` – Entry-Liste mit Empty-State
- `JournalDetailPanel` – Entry-Detail mit Edit/Delete
- `JournalNewEntryDialog` – Create-Modal
- `JournalHeaderActions` – Header-Buttons
- `JournalInsightsPanel` – AI-Insights
- `JournalJourneyBanner` – Gamification-Banner
- `JournalSocialPreview` – Share-Preview

#### **Analysis** (`src/components/analysis/`)
- `AnalysisLayout` – Tab-Wrapper
- `AnalysisOverviewStats` – Stat-Tiles
- `AnalysisHeaderActions` – Header-Buttons
- `AnalysisSidebarTabs` – Sidebar-Navigation

#### **Alerts** (`src/components/alerts/`)
- `AlertsLayout` – 2-Spalten-Layout
- `AlertsList` – Alert-Liste
- `AlertCard` – Alert-Item
- `AlertsDetailPanel` – Detail-View
- `AlertCreateDialog` – Create-Modal
- `AlertEditDialog` – Edit-Modal
- `AlertsHeaderActions` – Header-Buttons
- `NotificationsPermissionButton` – Push-Permissions

#### **Watchlist** (`src/components/watchlist/`)
- `WatchlistLayout` – Container
- `WatchlistTable` – Token-Tabelle
- `WatchlistDetailPanel` – Detail + Actions
- `WatchlistHeaderActions` – Header-Buttons

#### **Chart** (`src/components/chart/`)
- `AdvancedChart` – Canvas-Chart mit Annotations
- `ChartHeaderActions` – Header-Buttons

#### **Oracle** (`src/components/oracle/`)
- `OracleHistoryChart` – Score-Linechart
- `OracleThemeFilter` – Theme-Dropdown
- `OracleHistoryList` – Past Reports

#### **Settings** (`src/components/settings/`)
- `SettingsHeaderActions` – Header-Buttons

#### **Signals** (`src/components/signals/`)
- `SignalCard` – Signal-Item
- `SignalReviewCard` – Review-Mode
- `LessonCard` – Lesson-Item

### UI-Primitives (`src/components/ui/`)

| Komponente | Verwendung |
|------------|------------|
| `Button` | Primär, Secondary, Outline, Ghost |
| `Card` | Glass, Elevated, Muted |
| `Modal` | Dialog-System mit A11y |
| `Drawer` | Slide-In-Panel |
| `Badge` | Status-Badges |
| `Input`, `Textarea`, `Select` | Form-Inputs |
| `FormField` | Input + Label + Error |
| `Tooltip`, `TooltipIcon` | Hover-Tooltips |
| `Toast` | Notification-System |
| `EmptyState`, `ErrorState` | Placeholder-States |
| `ErrorBanner` | Error mit Retry |
| `LoadingSkeleton`, `Skeleton` | Loading-States |
| `StateView` | Unified State-Handler (Loading, Error, Empty, Offline) |
| `Collapsible` | Expand/Collapse-Wrapper |
| `KeyboardShortcutsDialog` | Shortcut-Übersicht |
| `PageTransition` | Fade-In/Out |

### Weitere Komponenten

- `Header` – Global App-Header (wenn nicht DashboardShell)
- `UpdateBanner` – PWA-Update-Prompt
- `OfflineIndicator` – Offline-Badge
- `ErrorBoundary` – React Error Boundary
- `Logo` – App-Logo
- `FeedbackModal` – User-Feedback-Dialog
- `GrokContextPanel` – AI-Context-Viewer
- `ReplayPlayer` – Replay-Playback-Controls
- `ReplayModal` – Replay-Session-Picker
- `PatternDashboard` – Pattern-Stats-Dashboard
- `MetricsPanel` – Metric-Tiles
- `SaveTradeModal` – Trade-Save-Dialog
- `MissingConfigBanner` – Config-Fehler-Banner

---

## 🗄️ State Management (Stores)

**Tech Stack**: Zustand (Flux-Pattern)

### Store-Übersicht (`src/store/`)

| Store | Zuständigkeit |
|-------|---------------|
| `journalStore` | Journal-Entries, Active ID, CRUD |
| `alertsStore` | Alerts, Draft-Management, CRUD |
| `watchlistStore` | Watchlist-Rows, Trends, Quote-Hydration |
| `chartUiStore` | Indicator-Config (pro Asset), Overlays, Presets, Intro-Dismissal |
| `oracleStore` | Today-Report, History, Read-Status |
| `gamificationStore` | XP, Level, Badges, Journey-Phase |
| `liveDataStore` | Live-Price-Subscription-Management |
| `walletStore` | Wallet-Connection, Balance |
| `onboardingStore` | Tour-Steps, Checklists, Welcome-Modal |
| `pushQueueStore` | Push-Notification-Queue |
| `eventBus` | Pub/Sub-System für Cross-Component-Events |

### Persistierung

**IndexedDB** (via Dexie):
- Journal Entries
- Alerts
- Watchlist
- Oracle Reports
- Gamification State
- Chart OHLC Cache

**LocalStorage**:
- UI-Preferences (Theme, Dismissed Banners)
- Onboarding-Status
- Last Seen Timestamp

---

## 🧭 Navigationsfluss

### Primäre Navigation (BottomNav / Sidebar)

```
┌─────────────────────────────────────────────────────┐
│  Board  │  Analyze  │  Chart  │  Journal  │  Settings│
│  (Home) │   (AI)    │ (Chart) │  (Log)    │  (Gear)  │
└─────────────────────────────────────────────────────┘
```

**5 Haupt-Tabs**:
1. **Board** → `/dashboard-v2` (Home)
2. **Analyze** → `/analysis-v2` (AI Insights)
3. **Chart** → `/chart-v2` (Chart Workspace)
4. **Journal** → `/journal-v2` (Trading Log)
5. **Settings** → `/settings-v2` (App Config)

### Sekundäre Navigation (Drawer / "More")

**6. More-Button** → Öffnet `NavigationDrawer` mit:
- Watchlist → `/watchlist-v2`
- Alerts → `/alerts-v2`
- Oracle → `/oracle`
- Replay → `/replay`
- Notifications → `/notifications`
- Signals → `/signals`
- Lessons → `/lessons`
- Icons → `/icons` (Dev)

### Cross-Page-Navigation

**Von Dashboard**:
- Journal Snapshot → `/journal-v2?entry=<id>`
- Alerts Snapshot → `/alerts-v2?alert=<id>`
- Quick Actions → Diverse (z.B. Create Alert)

**Von Journal**:
- Entry-Click → URL-Update `?entry=<id>` (keine Navigation)
- "Create Entry" → Dialog (bleibt auf Page)

**Von Watchlist**:
- Row-Click → Detail Panel (keine Navigation)
- "Open Chart" → `/chart-v2?symbol=SOL&address=...&network=solana`
- "Open Replay" → `/replay?symbol=SOL&from=...&to=...`

**Von Alerts**:
- Alert-Click → URL-Update `?alert=<id>` (keine Navigation)
- "Create Alert" → Dialog (bleibt auf Page)

**Von Chart**:
- "Open Replay" → `/replay?symbol=...&timeframe=...&from=...&to=...`
- Annotation-Click → URL-Update `?focus=<timestamp>` (Jump im Chart)

**Von Replay**:
- "Go Live" → Bleibt auf `/replay`, wechselt Mode zu `live`
- "Open Chart" → `/chart-v2?...`
- "View Entry" (Dashboard) → `/journal-v2?entry=<id>`

**Von Analysis**:
- Tab-Switch → URL-Update `?tab=<overview|flow|playbook>`

**URL-State-Sync** (Query-Params):
- `/journal-v2?entry=<id>` – Aktiver Entry
- `/alerts-v2?alert=<id>` – Aktiver Alert
- `/analysis-v2?tab=<overview>` – Aktiver Tab
- `/chart-v2?symbol=<>&address=<>&network=<>&timeframe=<>&focus=<>` – Chart-Config
- `/replay?symbol=<>&address=<>&network=<>&timeframe=<>&from=<>&to=<>` – Replay-Config

---

## 🔄 Abhängigkeiten und Datenfluss

### Daten-Provider (Lib-Layer)

#### Market Data (`src/lib/data/`)
- `marketOrchestrator.ts` – Multi-Provider-Fallback (CoinGecko → CoinCap → Moralis)
- `getTokenSnapshot.ts` – Token-Snapshot
- `orderflow.ts` – Orderflow-Daten
- `walletFlow.ts` – Wallet-Flow-Tracking

#### Adapters (`src/lib/adapters/`)
- `dexscreenerAdapter.ts` – Dexscreener-API
- `dexpaprikaAdapter.ts` – DEXPaprika-API
- `moralisAdapter.ts` – Moralis-API
- `pumpfunAdapter.ts` – Pump.fun-API

#### Services (`src/lib/`)
- `JournalService.ts` – Journal CRUD + Pattern-Stats
- `ReplayService.ts` – Replay-Session-Management
- `ExportService.ts` – Data-Export (JSON, CSV, Markdown)
- `TelemetryService.ts` – Event-Tracking
- `priceAdapter.ts` – Price-Normalization
- `aiClient.ts` – AI-API-Client (Claude, Grok)

#### Chart-Logic (`src/lib/chart/`)
- `snapshot.ts` – OHLC-Cache-Management
- `indicators.ts` – Indicator-Berechnungen (SMA, EMA, BB)
- `annotations.ts` – Annotation-Mapping (Journal, Alerts, Pulse)
- `chartLinks.ts` – URL-Builder für Chart/Replay
- `chartTelemetry.ts` – Chart-Event-Tracking

#### AI/Heuristics (`src/lib/ai/heuristics/`)
- `marketStructure.ts` – Bias, Range, Support/Resistance
- `flowVolume.ts` – Volume-Analyse
- `botScore.ts` – Bot-Detection-Score
- `playbook.ts` – Rule-Generation
- `sanity.ts` – Data-Validation

#### Journal-AI (`src/lib/journal/ai/`)
- `journal-insights-service.ts` – AI-Insights-Generation
- `journal-insights-prompt.ts` – Prompt-Templates
- `journey-analytics.ts` – Hero's Journey-Tracking
- `journey-snapshot.ts` – Journey-Snapshot-Berechnung

#### Live Data (`src/lib/live/`)
- `liveDataManager.ts` – WebSocket/Polling-Manager
- `PricePollingService.ts` – Price-Update-Polling

#### Offline/Sync (`src/lib/`)
- `offline-sync.ts` – Offline-First-Logic
- `datastore.ts` – IndexedDB-Wrapper
- `db.ts`, `db-board.ts`, `db-oracle.ts` – Dexie-Schemas
- `safeStorage.ts` – LocalStorage-Wrapper

### Datenfluss-Diagramm

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interaction                      │
│   (Click, Form Submit, URL-Change, Swipe, Keyboard)        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
│  (Pages, Layout, Domain-Components, UI-Primitives)         │
└────────┬────────────────────────┬─────────────────┬─────────┘
         │                        │                 │
         ▼                        ▼                 ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────┐
│  Custom Hooks    │   │  Zustand Stores  │   │  React Router│
│  (useOhlcData,   │   │  (journal, alerts│   │  (navigate,  │
│   useIndicators, │   │   watchlist, etc)│   │   useParams) │
│   useOnlineStatus│   │                  │   │              │
└────────┬─────────┘   └────────┬─────────┘   └──────┬───────┘
         │                      │                     │
         ▼                      ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer (Lib)                       │
│  (JournalService, ReplayService, marketOrchestrator,        │
│   chartTelemetry, aiClient, annotations, indicators)        │
└────────┬────────────────────────┬─────────────────┬─────────┘
         │                        │                 │
         ▼                        ▼                 ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────┐
│  IndexedDB       │   │  External APIs   │   │  LocalStorage│
│  (Dexie)         │   │  (CoinGecko,     │   │  (Prefs, UI) │
│  - Journal       │   │   Moralis, Grok) │   │              │
│  - Alerts        │   │                  │   │              │
│  - OHLC Cache    │   │                  │   │              │
└──────────────────┘   └──────────────────┘   └──────────────┘
```

### Dependency-Graph (Kern-Dependencies)

```
Pages
  ├─> Components (Domain + UI)
  ├─> Stores (Zustand)
  ├─> Hooks (Custom)
  └─> React Router

Components
  ├─> UI-Primitives
  ├─> Stores (read/write)
  ├─> Icons (lucide-react)
  └─> Tailwind (Styling)

Stores
  ├─> Services (Lib)
  ├─> EventBus (Pub/Sub)
  └─> IndexedDB (Dexie)

Services
  ├─> Adapters (API-Normalisierung)
  ├─> IndexedDB (Persistierung)
  ├─> External APIs (Fetch)
  └─> AI-Clients (Claude, Grok)

Hooks
  ├─> Stores (Zustand)
  ├─> Services (Lib)
  └─> Browser-APIs (WebSocket, Navigator)
```

---

## 📊 Architektur-Diagramm

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                         │
│  - Pages (Dashboard, Journal, Chart, etc.)                  │
│  - Components (Layout, Domain, UI-Primitives)               │
│  - Routing (React Router, URL-State-Sync)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   STATE MANAGEMENT LAYER                     │
│  - Zustand Stores (journal, alerts, watchlist, etc.)       │
│  - EventBus (Pub/Sub for cross-store communication)        │
│  - Custom Hooks (useOhlcData, useIndicators, etc.)         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
│  - Services (JournalService, ReplayService, etc.)          │
│  - Orchestrators (marketOrchestrator, signalOrchestrator)  │
│  - Heuristics (AI-Bias, Bot-Detection, Pattern-Stats)      │
│  - Telemetry (Event-Tracking, Error-Logging)               │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   DATA ACCESS LAYER                          │
│  - IndexedDB (Dexie: Journal, Alerts, OHLC-Cache)          │
│  - LocalStorage (UI-Prefs, Onboarding-Status)              │
│  - External APIs (CoinGecko, Moralis, Grok, Claude)        │
│  - Adapters (Normalisierung von Provider-Daten)            │
└─────────────────────────────────────────────────────────────┘
```

### Component-Hierarchie (Beispiel: JournalPage)

```
JournalPageV2
├─ DashboardShell
│  ├─ Header (Title + Description)
│  └─ JournalHeaderActions
│     └─ Button ("New Entry")
│
├─ JournalJourneyBanner (if hasJourneyMeta)
│  ├─ Phase-Badge
│  ├─ XP-Progress-Bar
│  └─ Badges-List
│
├─ JournalInsightsPanel
│  └─ JournalInsightCard (AI-Insights)
│
├─ JournalLayout
│  ├─ JournalList (Left)
│  │  ├─ Filter-Pills (All, Long, Short)
│  │  └─ Entry-Items (clickable)
│  │
│  └─ JournalDetailPanel (Right)
│     ├─ Entry-Header (Title, Date, Direction)
│     ├─ Entry-Content (Notes, Tags, Screenshots)
│     └─ Entry-Actions (Edit, Delete, Export)
│
└─ JournalNewEntryDialog (Modal)
   ├─ FormField (Title)
   ├─ Textarea (Notes)
   └─ Button ("Create" / "Cancel")
```

---

## 🔗 Weitere wichtige Patterns

### 1. **Lazy Loading + Code Splitting**
- Alle Pages via `React.lazy()` → Bundle Size Optimierung
- Suspense-Fallback → Globaler Loading-Spinner

### 2. **URL-State-Sync**
- `useSearchParams` für persistente UI-States (aktiver Entry, Tab, Filter)
- `replace: true` → Verhindert History-Pollution

### 3. **Offline-First**
- IndexedDB als Primary Storage
- API-Calls als Sync-Mechanismus
- Stale-While-Revalidate-Pattern
- Offline-Banner via `useOnlineStatus()`

### 4. **Error Handling**
- `ErrorBoundary` → Catch React-Fehler
- `ErrorBanner` → User-Facing-Fehler mit Retry
- `StateView` → Unified Error/Loading/Empty-States
- Try/Catch in Async-Funktionen mit User-Feedback

### 5. **Telemetry**
- `chartTelemetry.ts` → Chart-Events tracken
- `TelemetryService.ts` → Globale Event-Tracking-API
- Events: `chart.view_opened`, `chart.replay_started`, etc.

### 6. **Gamification**
- `gamificationStore.ts` → XP, Level, Badges
- `journey-analytics.ts` → Hero's Journey Phase-Tracking
- Rewards bei Oracle-Read, Entry-Create, etc.

### 7. **Responsive Design**
- Mobile-First-Approach
- `BottomNav` (Mobile) vs. `Sidebar` (Desktop)
- Breakpoints: `sm`, `md`, `lg`, `xl`
- Touch-Targets ≥ 44px

### 8. **Design System**
- Tailwind + Custom Tokens (`tailwind.config.ts`)
- Glass-Effekte (`glass-heavy`, `card-glass`)
- Hover-Effekte (`hover-glow`, `hover-scale`)
- Dark-Mode-Only (aktuell keine Light-Mode-Unterstützung)

---

## 📝 Zusammenfassung

### Kernseiten (User-Facing)
1. **Dashboard** – Zentrale Übersicht
2. **Journal** – Trading-Log mit Gamification
3. **Analysis** – AI-Marktanalyse
4. **Watchlist** – Token-Tracking
5. **Alerts** – Preis-Alerts
6. **Chart** – Chart-Workspace
7. **Oracle** – Daily Reports
8. **Replay** – Chart-Replay + Pattern-Analyse

### Architektur-Prinzipien
- **Offline-First** (IndexedDB via Dexie)
- **Lazy Loading** (Code-Splitting)
- **State Management** (Zustand)
- **URL-State-Sync** (Query-Params)
- **Error Resilience** (Fallbacks, Retry)
- **Mobile-First** (Responsive Design)
- **Gamification** (XP, Journey, Badges)
- **Telemetry** (Event-Tracking)

### Tech Stack
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Routing**: React Router v6
- **State**: Zustand
- **DB**: Dexie (IndexedDB)
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Testing**: Vitest + Playwright
- **PWA**: Workbox + Manifest

---

**Nächste Schritte**:
- Siehe `/docs/` für detaillierte Domain-Dokumentation
- Siehe `/tests/e2e/` für E2E-Test-Specs
- Siehe `.rulesync/rules/` für AI-Agent-Guardrails
