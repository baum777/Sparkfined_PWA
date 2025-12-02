# Sparkfined PWA — Pages, Funktionen & Events

> **Erstellt:** 2025-11-15  
> **Zweck:** Vollständige Übersicht aller Pages mit zugehörigen Funktionen und Events

---

## Übersichtstabelle

| # | Page | Route | Hauptfunktionen | Events | Status |
|---|------|-------|-----------------|--------|--------|
| 1 | **LandingPage** | `/` | Marketing, Hero-Section, Feature-Grid, Pricing-Tabs, Testimonials | `navigate()` (Call-to-Action Buttons) | ✅ Produktiv |
| 2 | **HomePage** | `/home` | Beta-Shell, Dark-Mode-Toggle | `toggleDarkMode()`, `document.documentElement.classList.toggle('dark')` | ✅ Legacy |
| 3 | **BoardPage** | `/board` | KPI-Tiles, Focus Stream, Quick Actions, Feed, Onboarding-System | `WelcomeModal`, `OnboardingChecklist`, `KeyboardShortcuts`, `HintBanner`, `createProductTour()` | ✅ Produktiv |
| 4 | **DashboardPageV2** | `/dashboard-v2` | KPI-Focus (P&L, Win Rate, Alerts, Journal), Activity-Feed, Market-Movers | `useBoardKPIs()`, `useBoardFeed()`, `formatRelativeTime()` | 🔨 Variant |
| 5 | **JournalPage** | `/journal` | CRUD Journal-Entries, AI-Assist (Condense), Tags, Search, Server-Sync, Export (JSON/MD) | `journal:insert`, `journal:draft`, `useJournal()`, `useAssist()`, `saveServer()`, `loadServer()`, `delServer()`, `attachAI()` | ✅ Produktiv |
| 6 | **JournalPageV2** | `/journal-v2` | List + Sidebar, Date-Filter, Tag-Cloud, Stats, AI-Condense per Entry | `useJournal()`, `formatDate()`, `getExcerpt()` | 🔨 Variant |
| 7 | **AlertsPageV2** | `/alerts-v2` | Tabbed List (Price Alerts / Signal Rules), Toggle-Switches, Status-Badges, Delete-Actions | `ToggleButton`, `getStatusBadge()`, `formatDate()` | 🔨 Variant |
| 8 | **ChartPage** | `/chart` | OHLC-Canvas, Indicators (SMA/EMA/VWAP), Draw-Tools (Trend/Fib/HLine), Replay-Mode, Backtest, Export (PNG/JSON/Shortlink), Bookmarks, Session-Import/Export | `fetchOhlc()`, `useReplay()`, `useEvents()`, `runBacktest()`, `runBtServer()`, `exportWithHud()`, `onSaveToJournal()`, `encodeState()`, `decodeState()`, `encodeToken()`, `decodeToken()`, `loadReplaySession()` | ✅ Produktiv |
| 9 | **ChartPageV2** | `/chart-v2` | Token-Search, Timeframe-Selector, Chart-Canvas-Placeholder, Indicators-Panel, On-Chain-Metrics, Quick-Actions | `useState()` für Token/TF/Indicators | 🔨 Variant |
| 10 | **SignalsPage** | `/signals` | Pattern-Filter, Confidence-Threshold, Signal-Cards, Signal-Review-Modal | `useSignals()`, `SignalCard`, `SignalReviewCard` | ✅ Produktiv |
| 11 | **AnalyzePage** | `/analyze` | OHLC-Load, KPI-Cards (Change24h, ATR, Vol), Heatmap (Indicator-Matrix), AI-Assist (Analyze-Bullets), One-Click-Trade-Idea-Packet (Rule + Journal + Idea + Watchlist), Export (JSON/CSV), Playbook-Apply | `fetchOhlc()`, `kpis()`, `signalMatrix()`, `useAssist()`, `runAI()`, `insertIntoJournal()`, `createIdeaPacket()`, `exportJSON()`, `exportCSV()`, `window.dispatchEvent('journal:insert')` | ✅ Produktiv |
| 12 | **AccessPage** | `/access` | Tabs (Status, Lock, Hold, Leaderboard), MCAP-Lock-Calculator, Hold-Verification, Leaderboard-Top-333 | `navigateToTab()`, `AccessStatusCard`, `LockCalculator`, `HoldCheck`, `LeaderboardList` | ✅ Produktiv |
| 13 | **LessonsPage** | `/lessons` | Trading-Lessons-Library, Pattern-Filter, Score-Threshold, Lesson-Cards (DOs/DONTs), Stats-Overview | `useLessons()`, `LessonCard`, `StateView` | ✅ Produktiv |
| 14 | **NotificationsPage** | `/notifications` | Alert-Rules-CRUD, Rule-Wizard, Server-Rules-Panel, Push-Subscribe/Unsubscribe, Test-Trigger, Ideas-Management (Close, Export Pack), Playbook-Apply | `useAlertRules()`, `RuleEditor`, `RuleWizard`, `subscribePush()`, `unsubscribePush()`, `currentSubscription()`, `loadSrv()`, `uploadAll()`, `toggleAct()`, `evalNow()`, `exportIdeas()` | ✅ Produktiv |
| 15 | **ReplayPage** | `/replay/:sessionId?` | Replay-Player (Play/Pause/Seek/Speed), Bookmark-Management, Pattern-Dashboard, Chart-View-Sync, Session-Load/Cache-OHLC | `getSession()`, `updateSession()`, `addBookmark()`, `deleteBookmark()`, `cacheOhlcData()`, `calculatePatternStats()`, `queryEntries()`, `handlePlay()`, `handlePause()`, `handleSeek()` | ✅ Produktiv |
| 16 | **SettingsPage** | `/settings` | Theme-Switch, Snap-Default, Replay-Speed, HUD/Timeline/MiniMap-Toggle, Wallet-Monitoring (Auto-Journal), Data-Export/Import (JSON), Factory-Reset, AI-Settings (Provider, Model, maxTokens, maxCost), Token-Budget-Display, Risk & Playbook-Defaults, Telemetry-Flags, PWA-Controls (SW-Update, Cache-Clear) | `useSettings()`, `setSettings()`, `useAISettings()`, `setAI()`, `useTelemetry()`, `useAIContext()`, `exportAppData()`, `importAppData()`, `clearNs()`, `clearCaches()`, `pokeServiceWorker()`, `startWalletMonitoring()`, `stopWalletMonitoring()` | ✅ Produktiv |
| 17 | **SettingsPageV2** | `/settings-v2` | Account & Access (Wallet-Connect), AI-Settings (Provider-Selection), Notifications (Push-Toggle), App-Preferences (Auto-Sync, Theme-Placeholder), About & Support, Danger-Zone (Clear-Cache, Reset) | `useSettings()`, `useAISettings()`, `Toggle` | 🔨 Variant |
| 18 | **FontTestPage** | `/font-test` | Font-Rendering-Test (JetBrains Mono), Character-Distinction-Test (0 vs O, 1 vs l), Contract-Address-Display, Font-Detection-Anleitung | Keine Events (statische Demo-Page) | 🛠️ Dev-Tool |
| 19 | **IconShowcase** | `/icons` | PWA-Icon-Grid (32px–1024px), Maskable-Info, Favicon-Display, Installation-Testing-Anleitung | Keine Events (statische Showcase-Page) | 🛠️ Dev-Tool |

---

## Detaillierte Funktions-Beschreibungen

### 1. LandingPage

**Zweck:** Marketing-Landingpage mit Feature-Showcase und Pricing-Tabs.

**Hauptfunktionen:**
- `navigate('/board')` — Navigiert zur Board-Page (Call-to-Action)
- Auto-rotating Testimonials (5s Interval via `useEffect()`)
- Hero-Section mit Floating-Stats (Alerts, Uptime, Response-Time)
- Problem-Points-Grid (4 Cards)
- Features-Grid (3 Cards: Charts, Alerts, Journal)
- Stats-Banner (8 KPIs: Total, High-Conf, Long, Short)
- Pricing-Tabs (Free Tier vs. OG Tier)
- Social-Proof-Ticker (Infinite-Scroll-Animation)

**Events:**
- `onClick={() => navigate('/board')}` (mehrere CTA-Buttons)
- `setActiveTestimonial()` (Auto-Rotate)

**Status:** ✅ Produktiv

---

### 2. HomePage

**Zweck:** Einfache Beta-Shell (Legacy, wird durch LandingPage/BoardPage ersetzt).

**Hauptfunktionen:**
- `toggleDarkMode()` — Schaltet zwischen Dark/Light-Mode
- `document.documentElement.classList.toggle('dark')` — DOM-Class-Toggle

**Events:**
- `onClick={toggleDarkMode}` (Button)

**Status:** ✅ Legacy (wird möglicherweise entfernt)

---

### 3. BoardPage

**Zweck:** Command-Center / Dashboard mit KPI-Tiles, Focus-Stream, Quick-Actions, Feed, Onboarding-System.

**Hauptfunktionen:**
- `Overview` — 4 KPI-Tiles (P&L, Risk, Sentiment, Win-Rate)
- `Focus` — "Now Stream" (Recent-Activities)
- `QuickActions` — Navigation-Shortcuts
- `Feed` — Activity-Events
- `WelcomeModal` — Onboarding-Modal (Persona-Selection)
- `OnboardingChecklist` — Checklist mit Progress-Tracking
- `KeyboardShortcuts` — Keyboard-Shortcut-Overlay (Shift + ?)
- `HintBanner` — Progressive-Hints (dismissable)
- `createProductTour()` — Driver.js-based Product-Tour

**Events:**
- `onPersonaSelected()` — Startet Product-Tour nach Persona-Auswahl
- `completeTour()` — Markiert Tour als abgeschlossen
- `isHintDismissed()` — Prüft, ob Hint bereits dismissed wurde
- Keyboard-Listener für `?` (Shortcut-Overlay)

**Status:** ✅ Produktiv

---

### 4. DashboardPageV2

**Zweck:** Variant 1 von Dashboard — KPI-Focus mit Activity-Feed + Market-Movers.

**Hauptfunktionen:**
- `useBoardKPIs()` — Hook für KPI-Daten (P&L, Win-Rate, Alerts, Journal)
- `useBoardFeed()` — Hook für Activity-Feed
- `formatRelativeTime()` — Formatiert Timestamps (z.B. "5m ago")
- 4 KPI-Tiles (Trend-Icons, Change-Badges)
- Activity-Feed (60% Width, Recent-5)
- Market-Movers (40% Width, Top-3-Tokens)
- Quick-Actions-Bar (New-Journal, Create-Alert, Open-Chart)

**Events:**
- Keine Custom-Events (nur Render-Logik)

**Status:** 🔨 Variant (Alternative zu BoardPage)

---

### 5. JournalPage

**Zweck:** Trading-Journal mit CRUD, AI-Assist, Server-Sync, Export.

**Hauptfunktionen:**
- `useJournal()` — Hook für lokale Journal-Einträge (IndexedDB)
- `create()`, `update()`, `remove()` — CRUD-Operationen (lokal)
- `saveServer()`, `loadServer()`, `delServer()` — Server-Sync (API-Calls)
- `useAssist()` — AI-Hook für Condense-Feature
- `runAIOnDraft()` — Generiert AI-Analyse-Bullets
- `insertAI()` — Fügt AI-Text in Draft ein
- `attachAI()` — Hängt AI-Analyse an Notiz an & speichert
- `JournalEditor` — Editor-Component (Draft-Editing)
- `JournalList` — Liste aller Einträge (Filter: Search, Tag)
- `JournalStats` — Statistiken (Total, Win-Rate, Tags)
- Export (JSON/MD) via `/api/journal/export`

**Events:**
- `journal:insert` — Custom-Event (empfängt Text von AnalyzePage)
- `journal:draft` — Custom-Event (empfängt Draft-Payload von ChartPage)
- `onSave()` — Speichert Draft (lokal + Server)
- `onOpen()` — Öffnet Eintrag im Editor
- `onDelete()` — Löscht Eintrag (lokal)

**Status:** ✅ Produktiv

---

### 6. JournalPageV2

**Zweck:** Variant 1 von Journal — List + Sidebar mit Date-Filter, Tag-Cloud.

**Hauptfunktionen:**
- `useJournal()` — Hook für Einträge
- `formatDate()` — Formatiert Datum (Today, Yesterday, Date)
- `getExcerpt()` — Extrahiert ersten 150 Zeichen als Excerpt
- Sidebar (25% Width): Date-Range-Filter, Tag-Cloud, Stats
- Main (75% Width): Entry-Cards mit Tags, P&L-Badges
- Filter-Chips (Search, Tags)
- AI-Condense-Button per Entry

**Events:**
- `setSearchQuery()`, `setSelectedTags()` — Filter-State
- Keine Custom-Events (lokale State-Logik)

**Status:** 🔨 Variant (Alternative zu JournalPage)

---

### 7. AlertsPageV2

**Zweck:** Variant 1 von Alerts — Tabbed-List (Price-Alerts / Signal-Rules).

**Hauptfunktionen:**
- Tabs: `price` (Price-Alerts), `signals` (Signal-Rules)
- Status-Grouped-Lists: Active → Triggered → Disabled
- `ToggleButton` — Enable/Disable-Toggle
- `getStatusBadge()` — Returns Badge-Component für Status
- `formatDate()` — Formatiert Trigger-Timestamps
- Delete-Actions per Alert

**Events:**
- `setActiveTab()` — Tab-Switch
- Toggle-Actions (noch nicht implementiert, Button-Only)
- Delete-Actions (noch nicht implementiert, Button-Only)

**Status:** 🔨 Variant (Alternative zu NotificationsPage)

---

### 8. ChartPage

**Zweck:** Haupt-Charting-Interface mit OHLC-Canvas, Indicators, Draw-Tools, Replay, Backtest, Export.

**Hauptfunktionen:**
- `fetchOhlc()` — Lädt OHLC-Daten (API-Call)
- `CandlesCanvas` — Canvas-Component (Rendering)
- `IndicatorBar` — Toggle für SMA/EMA/VWAP
- `sma()`, `ema()`, `vwap()` — Indikator-Berechnungen
- `DrawToolbar` — Tool-Auswahl (Cursor, Trend, Fib, HLine)
- `ZoomPanBar` — Zoom/Pan-Controls + Snap-Toggle
- `ReplayBar` — Replay-Controls (Play/Pause, Speed, Bookmarks)
- `useReplay()` — Replay-Hook (Playback-State)
- `useEvents()` — Event-Timeline-Hook
- `runBacktest()` — Client-Side-Backtest
- `runBtServer()` — Server-Side-Backtest (Paging)
- `BacktestPanel` — Backtest-Result-Display
- `exportWithHud()` — Export als PNG mit Header/Branding
- `onCopyPngHud()` — Kopiert PNG in Clipboard
- `onCopyShortlink()` — Kopiert Shortlink (Base64-State)
- `onSaveToJournal()` — Broadcast Draft-Payload an Journal
- `onExportJSON()`, `onImportJSON()` — Session-Export/Import
- `encodeState()`, `decodeState()` — URL-State-Encoding
- `encodeToken()`, `decodeToken()` — Shortlink-Token-Encoding
- `loadReplaySession()` — Lädt Replay-Session (inklusive OHLC-Cache)
- `MiniMap` — Navigator-Component (zeigt Full-Range)
- `Timeline` — Event-Timeline (Bookmarks, Alert-Hits)
- `TestOverlay` — Overlay für Test-Modus (Rule-Test)
- `decodeRuleToken()` — Dekodiert Test-Token (Rule-Test)

**Events:**
- `journal:draft` — Custom-Event (sendet Snapshot an JournalPage)
- `onStep()` — Replay-Step (Vor/Zurück)
- `onJumpTimestamp()` — Springt zu Timestamp (Bookmark-Click)
- `addBookmark()` — Fügt Bookmark hinzu
- `deleteBookmark()` — Löscht Bookmark
- `onShapesChange()` — Shape-Änderung (Draw-Tools)
- `doUndo()`, `doRedo()` — Undo/Redo (Shape-History)
- Keyboard-Hotkeys: `Space` (Play/Pause), `ArrowLeft/Right` (Step), `1-6` (Jump-to-Bookmark), `Ctrl+Z` (Undo), `Ctrl+Y` (Redo), `Delete` (Delete-Shape), `Escape` (Reset-Tool), `h` (HLine), `t` (Trend), `f` (Fib)

**Status:** ✅ Produktiv

---

### 9. ChartPageV2

**Zweck:** Variant 1 von Chart — Chart-Dominance mit Timeframe-Selector, Indicators-Panel, On-Chain-Metrics.

**Hauptfunktionen:**
- Token-Search (Autocomplete-Placeholder)
- Timeframe-Selector (1m → 1w)
- Chart-Canvas-Placeholder (Integrate Lightweight-Charts / TradingView)
- Active-Indicators-Panel (RSI, MACD, EMA)
- On-Chain-Metrics (24h Volume, Market-Cap, Holders, Social-Score)
- Quick-Actions (Create-Alert, Add-to-Journal, Share-Analysis)

**Events:**
- `setSelectedToken()`, `setSelectedTimeframe()` — Token/TF-State
- Keine Backend-Integration (nur State-Management)

**Status:** 🔨 Variant (Alternative zu ChartPage)

---

### 10. SignalsPage

**Zweck:** Trading-Signals-Dashboard mit Pattern-Filter, Confidence-Threshold, Signal-Review.

**Hauptfunktionen:**
- `useSignals()` — Hook für Signals (Pattern-Filter)
- `SignalCard` — Signal-Card-Component (Klick öffnet Detail-Modal)
- `SignalReviewCard` — Detail-Modal mit Accept/Reject-Actions
- Pattern-Filter (All, Momentum, Breakout, Reversal, Range-Bounce, Mean-Reversion, Continuation)
- Confidence-Threshold-Slider (0–100%)
- Stats-Overview (Total, High-Conf, Long, Short)
- Signal-Detail-Modal (Overlay mit Click-to-Close)

**Events:**
- `setSelectedSignalId()` — Öffnet Signal-Detail-Modal
- `onAccept()`, `onReject()` — Accept/Reject-Actions (noch nicht implementiert)

**Status:** ✅ Produktiv

---

### 11. AnalyzePage

**Zweck:** Token-Analyse mit KPIs, Heatmap, AI-Assist, One-Click-Trade-Idea-Packet.

**Hauptfunktionen:**
- `fetchOhlc()` — Lädt OHLC-Daten
- `kpis()` — Berechnet KPIs (LastClose, Change24h, ATR14, VolStdev, HiLoPerc, VolumeSum)
- `signalMatrix()` — Berechnet Indicator-Heatmap (SMA 9/20/50/200)
- `Heatmap` — Component (Bull/Bear/Flat-Visualization)
- `useAssist()` — AI-Hook
- `runTemplate()` — Führt AI-Prompt-Template aus (v1/analyze_bullets)
- `insertIntoJournal()` — Sendet AI-Bullets an Journal (Custom-Event)
- `createIdeaPacket()` — Erstellt Trade-Idea-Paket (Rule + Journal + Idea + Watchlist)
- `exportJSON()`, `exportCSV()` — Export OHLC-Daten
- `PlaybookCard` — Playbook-Preset-Selector (Risk/Reward-Kalkulation)
- Permalink (URL-State), Shortlink (Base64-Token)

**Events:**
- `journal:insert` — Custom-Event (sendet AI-Text an JournalPage)
- `createIdeaPacket()` — Erstellt vollständiges Idea-Objekt (Server-Sync)

**Status:** ✅ Produktiv

---

### 12. AccessPage

**Zweck:** Access-Pass-Dashboard mit Tabs (Status, Lock, Hold, Leaderboard).

**Hauptfunktionen:**
- `navigateToTab()` — Tab-Switch + Scroll-to-Top
- `AccessStatusCard` — Zeigt aktuellen Access-Status (OG / Holder / None)
- `LockCalculator` — MCAP-basierter Lock-Calculator
- `HoldCheck` — Token-Hold-Verification
- `LeaderboardList` — Top-333-OG-Locks

**Events:**
- `navigateToTab()` — Tab-Navigation (Status, Lock, Hold, Leaderboard)

**Status:** ✅ Produktiv

---

### 13. LessonsPage

**Zweck:** Trading-Lessons-Library mit Pattern-Filter, Score-Threshold, Lesson-Cards.

**Hauptfunktionen:**
- `useLessons()` — Hook für Lessons
- `LessonCard` — Lesson-Card-Component (DOs/DONTs, Win-Rate, Sample-Size)
- Pattern-Filter (All + Dynamic-Patterns)
- Min-Score-Slider (0–100%)
- Stats-Overview (Total, High-Score, Avg-WR, Total-Trades)
- Empty-State mit CTA ("Analyze Your First Chart")

**Events:**
- `setSelectedPattern()`, `setMinScore()` — Filter-State
- Keine Custom-Events

**Status:** ✅ Produktiv

---

### 14. NotificationsPage

**Zweck:** Alert-Center mit Rules-CRUD, Server-Rules-Panel, Push-Subscribe, Ideas-Management.

**Hauptfunktionen:**
- `useAlertRules()` — Hook für lokale Alert-Rules
- `RuleEditor` — CRUD-Editor für Rules
- `RuleWizard` — Preset-Wizard (Quick-Create)
- `subscribePush()`, `unsubscribePush()` — Push-Notifications-Management
- `currentSubscription()` — Prüft aktuelle Push-Subscription
- `loadSrv()` — Lädt Server-Rules + Ideas
- `uploadAll()` — Uploaded alle lokalen Rules an Server
- `toggleAct()` — Toggle Active-Status (Server-Rule)
- `evalNow()` — Führt Server-Eval sofort aus (Cron-Job)
- `exportIdeas()` — Export Ideas als Markdown (Case-Study)
- `PlaybookCard` — Playbook-Apply (innerhalb Idea)
- Test-Trigger (Manual-Trigger für Alert-Probe)

**Events:**
- `user.rule.create` — Telemetry-Event (Rule-Creation)
- `addManualTrigger()` — Fügt manuellen Trigger hinzu (Test-Probe)
- Keine Custom-Events (API-Calls + Telemetry)

**Status:** ✅ Produktiv

---

### 15. ReplayPage

**Zweck:** Replay-Player mit Chart-Sync, Bookmarks, Pattern-Dashboard.

**Hauptfunktionen:**
- `getSession()` — Lädt Replay-Session (inklusive OHLC-Cache)
- `updateSession()` — Updated Session (z.B. Bookmarks)
- `addBookmark()`, `deleteBookmark()` — Bookmark-Management
- `cacheOhlcData()` — Cached OHLC-Daten (für Offline-Playback)
- `calculatePatternStats()` — Berechnet Pattern-Statistiken
- `queryEntries()` — Lädt Journal-Einträge (für Dashboard)
- `ReplayPlayer` — Player-Component (Play/Pause, Speed, Seek, Bookmarks)
- `PatternDashboard` — Pattern-Analyse-Dashboard
- `handlePlay()`, `handlePause()`, `handleSeek()` — Playback-Controls
- `handleAddBookmark()`, `handleDeleteBookmark()` — Bookmark-Actions
- `handleJumpToBookmark()` — Springt zu Bookmark-Frame
- `handleFilterByPattern()` — Filter Dashboard nach Pattern
- `handleViewEntry()` — Navigiert zu Journal-Entry
- Chart-Sync (URL-Param: `?replaySession=<id>`)

**Events:**
- `onPlay()`, `onPause()`, `onSeek()` — Playback-Events
- `onAddBookmark()`, `onDeleteBookmark()`, `onJumpToBookmark()` — Bookmark-Events
- `onFilterByPattern()`, `onViewEntry()` — Dashboard-Events

**Status:** ✅ Produktiv

---

### 16. SettingsPage

**Zweck:** Settings & Configuration mit Theme-Switch, Wallet-Monitoring, Data-Export/Import, AI-Settings, PWA-Controls.

**Hauptfunktionen:**
- `useSettings()` — Hook für App-Settings
- `setSettings()` — Updated Settings (Theme, Snap, ReplaySpeed, HUD, Timeline, MiniMap)
- `useAISettings()` — Hook für AI-Settings (Provider, Model, maxTokens, maxCost)
- `setAI()` — Updated AI-Settings
- `useTelemetry()` — Hook für Telemetry-Flags
- `useAIContext()` — Hook für Token-Budget-Display
- `exportAppData()`, `importAppData()` — Export/Import App-Daten (JSON)
- `clearNs()` — Löscht spezifischen Namespace (LocalStorage)
- `clearCaches()` — Löscht Cache-Storage (PWA)
- `pokeServiceWorker()` — Stößt SW-Update an
- `startWalletMonitoring()`, `stopWalletMonitoring()` — Wallet-Monitoring-Controls
- `getWalletMonitor()` — Prüft Monitor-Status
- Factory-Reset (löscht alle `sparkfined.*`-Daten)
- Risk & Playbook-Defaults (Balance, Preset-ID)
- Telemetry-Flags (Enabled, Network, Canvas, User, TokenOverlay, Sampling)
- PWA-Info (App-Version, Build, VAPID-Status)

**Events:**
- Settings-Changes werden sofort gespeichert (LocalStorage)
- Wallet-Monitoring-Status-Update (5s Interval)
- Keine Custom-Events

**Status:** ✅ Produktiv

---

### 17. SettingsPageV2

**Zweck:** Variant 1 von Settings — Simplified UI mit Account & Access, AI-Settings, Notifications, App-Preferences.

**Hauptfunktionen:**
- `useSettings()`, `useAISettings()` — Hooks für Settings
- Account & Access-Card (Wallet-Connect, Usage-Stats)
- AI-Settings-Card (Provider-Selection: Auto, OpenAI, Grok)
- Notifications-Card (Push-Toggle)
- App-Preferences-Card (Auto-Sync, Theme-Placeholder)
- About & Support-Card (Version, Changelog, Report-Issue, Privacy-Policy)
- Danger-Zone-Card (Clear-Cache, Reset-Settings)

**Events:**
- `setPushEnabled()`, `setAutoSync()` — Toggle-Actions
- `setAI()` — AI-Provider-Selection
- Keine Custom-Events

**Status:** 🔨 Variant (Alternative zu SettingsPage)

---

### 18. FontTestPage

**Zweck:** Dev-Tool für Font-Rendering-Test (JetBrains Mono).

**Hauptfunktionen:**
- System-Font-Display (Sans-Serif)
- JetBrains-Mono-Display (Monospace)
- Contract-Address-Example (CA)
- Numeric-Precision-Example (0.00012345 BTC)
- Character-Distinction-Test (0 vs O, 1 vs l vs I, 5 vs S)
- Font-Detection-Anleitung (DevTools → Computed → font-family)
- Installation-Status (Google-Fonts-CDN vs. Local-Font)

**Events:**
- Keine Events (statische Demo-Page)

**Status:** 🛠️ Dev-Tool

---

### 19. IconShowcase

**Zweck:** Dev-Tool für PWA-Icon-Showcase (32px–1024px).

**Hauptfunktionen:**
- Icon-Grid (14 Icons: 32px, 48px, 64px, 72px, 96px, 128px, 152px, 167px, 180px, 192px, 256px, 384px, 512px, 1024px)
- Maskable-Info (Safe-Zone: 80% Center)
- Favicon-Display (favicon.ico, apple-touch-icon.png)
- Installation-Testing-Anleitung (DevTools → Application → Manifest)

**Events:**
- Keine Events (statische Showcase-Page)

**Status:** 🛠️ Dev-Tool

---

## Event-Typen Übersicht

### Custom-Events (window.dispatchEvent)

| Event | Page (Sender) | Page (Empfänger) | Payload | Zweck |
|-------|---------------|------------------|---------|-------|
| `journal:insert` | AnalyzePage | JournalPage | `{ text: string }` | Fügt AI-Bullets in Journal-Draft ein |
| `journal:draft` | ChartPage | JournalPage | `{ screenshotDataUrl, permalink, address, tf }` | Überträgt Chart-Snapshot als Journal-Draft |

### React-Events (Standard)

| Event | Page | Component | Zweck |
|-------|------|-----------|-------|
| `onClick` | LandingPage | Button | Navigation zu `/board` |
| `onClick` | HomePage | Button | Dark-Mode-Toggle |
| `onSave` | JournalPage | JournalEditor | Speichert Journal-Entry (lokal + Server) |
| `onOpen` | JournalPage | JournalList | Öffnet Entry im Editor |
| `onDelete` | JournalPage | JournalList | Löscht Entry (lokal) |
| `onPlay`, `onPause`, `onSeek` | ReplayPage | ReplayPlayer | Playback-Controls |
| `onAddBookmark`, `onDeleteBookmark` | ReplayPage, ChartPage | ReplayBar, ReplayPlayer | Bookmark-Management |
| `onShapesChange` | ChartPage | CandlesCanvas | Shape-Änderung (Draw-Tools) |
| `doUndo`, `doRedo` | ChartPage | DrawToolbar | Undo/Redo-Actions |

### Keyboard-Events

| Hotkey | Page | Aktion |
|--------|------|--------|
| `Space` | ChartPage | Play/Pause Replay |
| `ArrowLeft`, `ArrowRight` | ChartPage | Replay-Step (Vor/Zurück) |
| `Shift + ArrowLeft/Right` | ChartPage | Replay-Step (10 Bars) |
| `1-6` | ChartPage | Jump-to-Bookmark (Slots 1–6) |
| `Ctrl+Z` (Cmd+Z) | ChartPage | Undo (Shape-History) |
| `Ctrl+Y` (Cmd+Y) | ChartPage | Redo (Shape-History) |
| `Delete`, `Backspace` | ChartPage | Delete-Selected-Shape |
| `Escape` | ChartPage | Reset-Tool (zurück zu Cursor) |
| `h` | ChartPage | Select HLine-Tool |
| `t` | ChartPage | Select Trend-Tool |
| `f` | ChartPage | Select Fib-Tool |
| `?` (Shift + /) | BoardPage | Open Keyboard-Shortcuts-Overlay |

---

## API-Endpoints Übersicht

| Endpoint | Method | Page(s) | Zweck |
|----------|--------|---------|-------|
| `/api/journal` | GET | JournalPage | Lädt Server-Notizen |
| `/api/journal` | POST | JournalPage, AnalyzePage | Erstellt/Updated Notiz |
| `/api/journal/export` | GET | JournalPage | Export Journal (JSON/MD) |
| `/api/rules` | GET | NotificationsPage | Lädt Server-Rules |
| `/api/rules` | POST | NotificationsPage, AnalyzePage | Erstellt/Updated Rule |
| `/api/rules/eval-cron` | GET | NotificationsPage | Führt Eval-Cron sofort aus |
| `/api/backtest` | POST | ChartPage | Server-Side-Backtest |
| `/api/ideas` | GET | NotificationsPage | Lädt Ideas |
| `/api/ideas` | POST | NotificationsPage, AnalyzePage | Erstellt/Updated Idea |
| `/api/ideas/export` | GET | NotificationsPage | Export Ideas (MD-Case-Study) |
| `/api/ideas/export-pack` | GET | NotificationsPage | Export Execution-Pack (MD) |
| `/api/ideas/close` | POST | NotificationsPage | Schließt Idea |
| `/api/push/subscribe` | POST | SettingsPage, NotificationsPage | Registriert Push-Subscription |
| `/api/push/unsubscribe` | POST | SettingsPage, NotificationsPage | Deregistriert Push-Subscription |
| `/api/push/test-send` | POST | NotificationsPage | Sendet Test-Push-Notification |

---

## Statistische Zusammenfassung

- **Gesamt-Pages:** 19
- **Produktiv:** 13
- **Variants:** 4
- **Dev-Tools:** 2
- **Custom-Events:** 2 (`journal:insert`, `journal:draft`)
- **Keyboard-Hotkeys:** 11 (ChartPage: 9, BoardPage: 1, ReplayPage: 1)
- **API-Endpoints:** 13

---

## Legende

- ✅ **Produktiv:** Page ist live und wird aktiv genutzt
- 🔨 **Variant:** Alternative Implementierung (A/B-Test, Feature-Flag)
- 🛠️ **Dev-Tool:** Development/Testing-Tool (nicht im Production-Build)
- ⏳ **Legacy:** Alte Implementierung (wird möglicherweise entfernt)

---

## Nächste Schritte

1. **Variants konsolidieren:** Entscheiden, welche Variants behalten werden (z.B. JournalPageV2 vs. JournalPage)
2. **Event-Bus implementieren:** Zentraler Event-Bus für bessere Event-Verwaltung (aktuell: window.dispatchEvent)
3. **API-Dokumentation:** Swagger/OpenAPI-Spec für API-Endpoints generieren
4. **E2E-Tests:** Playwright-Tests für kritische User-Flows (Chart-Export, Journal-CRUD, Replay-Playback)

---

**Erstellt:** 2025-11-15  
**Author:** Sparkfined-Codex (via Cursor)  
**Version:** 1.0.0
