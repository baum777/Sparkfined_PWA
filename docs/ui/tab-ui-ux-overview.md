# Sparkfined PWA – Tab UI/UX Overview

**Erstellt**: 2025-12-30  
**Zweck**: Vollständige Übersicht aller Tabs mit ihren UI/UX-Elementen, Funktionen, User Interactions und technischen Details

---

## Format-Legende

Für jedes Element:
- **Tab/Position** – Wo das Element im Tab erscheint
- **Bezeichnung** – Name/Label des UI-Elements
- **Funktion/Events** – Was passiert technisch
- **User Interaction** – Wie der User damit interagiert
- **Konzept/Launchready** – Status und Design-Idee
- **Data Provider** – Woher kommen die Daten

---

## 1. Dashboard (/)

**Route**: `/`  
**Icon**: LayoutDashboard  
**Store**: `useTradesStore`, `useAlerts`  
**Testid**: `page-dashboard`

### 1.1 Header Section

#### 1.1.1 DashboardHeader
- **Position**: Top
- **Bezeichnung**: Dashboard Header mit Meta-Counters
- **Funktion**: 
  - Zeigt Anzahl Journal-Einträge und Alerts
  - "Log Entry" Button navigiert zu `/journal`
- **User Interaction**: Click auf "Log Entry" → Navigation
- **Konzept**: ✅ Launch-ready, Header mit Quick Actions
- **Data Provider**: `useTradesStore`, `useAlerts`

### 1.2 KPI Cards (5 Horizontal Cards)

#### 1.2.1 DashboardKpiCards
- **Position**: Unterhalb Header
- **Bezeichnung**: 5 horizontale KPI-Karten
- **Funktion**: 
  - **Net P&L**: Summe aller Trades (+ Prozent)
  - **Win Rate 30d**: Prozentsatz gewonnener Trades
  - **Today's Txs**: Anzahl heutiger Trades
  - **Today's Amount**: Summe heutiger P&L
  - **Journal Streak**: Consecutive Tage mit Einträgen
- **User Interaction**: Read-only Display
- **Konzept**: ✅ Launch-ready, KPI-Übersicht
- **Data Provider**: `useTradesStore` (berechnet aus `trades[]`)

### 1.3 Primary Cards Grid

#### 1.3.1 DailyBiasCard
- **Position**: Full-width oberhalb Grid
- **Bezeichnung**: Daily Bias Analysis Card
- **Funktion**: 
  - Zeigt aktuellen Market Bias (bullish/bearish)
  - Confidence Score (%)
  - Bullet Points mit Begründung
  - Refresh Button, "View Analysis" → `/oracle`, "Open Chart" → `/chart`
- **User Interaction**: 
  - Click Refresh: Bias neu laden
  - Click "View Analysis": Navigation zu Oracle
  - Click "Open Chart": Navigation zu Chart
- **Konzept**: 🚧 Placeholder (statische Demo-Daten), AI-generiert geplant
- **Data Provider**: Aktuell hardcoded, künftig AI/Oracle Service

#### 1.3.2 HoldingsCard
- **Position**: Grid (1/3)
- **Bezeichnung**: Holdings Overview
- **Funktion**: Zeigt aktuelles Portfolio (Wallet-basiert)
- **User Interaction**: Read-only (künftig: Click → Detail-View)
- **Konzept**: 🚧 Placeholder, Wallet-Integration geplant
- **Data Provider**: Künftig Wallet API (Moralis/Web3)

#### 1.3.3 LastTradesCard
- **Position**: Grid (2/3)
- **Bezeichnung**: Last 3 Trades
- **Funktion**: Zeigt letzte 3 Journal-Einträge (Symbol, P&L, Zeit)
- **User Interaction**: Click → `/journal?entry={id}`
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `useTradesStore` (neueste 3 Trades)

#### 1.3.4 InsightCard
- **Position**: Grid (3/3)
- **Bezeichnung**: AI Insight Teaser
- **Funktion**: 
  - Zeigt "Unlock nach 5+ Trades" oder AI-Insight
  - Props: `isReady={trades.length >= 5}`
- **User Interaction**: Click → `/oracle` (wenn unlocked)
- **Konzept**: 🚧 Gamification, AI-Insight künftig dynamisch
- **Data Provider**: `useTradesStore`, künftig AI/Oracle

### 1.4 Secondary Cards Grid

#### 1.4.1 JournalSnapshotCard
- **Position**: Secondary Grid (1/2)
- **Bezeichnung**: Journal Snapshot
- **Funktion**: 
  - Total Entries, This Week Entries
  - "Last entry {time ago}"
- **User Interaction**: Read-only, Kontext-Link zu Journal
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `useTradesStore` (aggregiert)

#### 1.4.2 AlertsSnapshotCard
- **Position**: Secondary Grid (2/2)
- **Bezeichnung**: Alerts Snapshot
- **Funktion**: Zeigt Anzahl triggered Alerts
- **User Interaction**: Click → `/alerts`
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `useAlerts` (gefiltert nach `status === 'triggered'`)

### 1.5 Footer Section

#### 1.5.1 RecentEntriesCard
- **Position**: Full-width unten
- **Bezeichnung**: Recent Journal Entries
- **Funktion**: Zeigt letzten 5 Entries als Tabelle/Liste
- **User Interaction**: 
  - Click Entry → `/journal?entry={id}`
  - "View Journal" → `/journal`
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `useTradesStore`

### 1.6 Mobile FAB

#### 1.6.1 DashboardFab
- **Position**: Fixed bottom-right (mobile only)
- **Bezeichnung**: Floating Action Button
- **Funktion**: 
  - Quick Actions: "Log Entry", "Create Alert"
- **User Interaction**: 
  - Tap → Öffnet Speed Dial
  - Auswahl → Navigation zu `/journal` oder `/alerts`
- **Konzept**: ✅ Launch-ready, Mobile-optimiert
- **Data Provider**: Navigation only

### 1.7 Empty State

#### 1.7.1 DashboardEmptyState
- **Position**: Anstelle aller Cards (wenn `hasTrades === false`)
- **Bezeichnung**: Onboarding Empty State
- **Funktion**: Hero-Message + CTA "Log First Trade"
- **User Interaction**: Click CTA → `/journal`
- **Konzept**: ✅ Launch-ready, Onboarding-Flow
- **Data Provider**: `useTradesStore.hasTrades`

---

## 2. Journal (/journal)

**Route**: `/journal`  
**Icon**: BookOpen  
**Store**: `useJournalStore`, `useTradesStore`  
**Testid**: `page-journal`

### 2.1 Header Section

#### 2.1.1 Page Header
- **Position**: Top
- **Bezeichnung**: "Journal" + Subtitle
- **Funktion**: Title + Description ("Auto-capture trades, add notes, build self-awareness")
- **User Interaction**: Read-only
- **Konzept**: ✅ Launch-ready
- **Data Provider**: Static

### 2.2 JournalView (Hauptkomponente)

**Komponente**: `@/features/journal/JournalView`

#### 2.2.1 Segmented Control (Tabs)
- **Position**: Unterhalb Header
- **Bezeichnung**: Segmented Control mit 3 Tabs
- **Funktion**: 
  - **Confirmed** (Badge: `confirmedCount`)
  - **Pending** (Badge: `pendingCount`)
  - **Archived** (Badge: `archivedCount`)
  - URL-Sync: `?tab=confirmed|pending|archived`
- **User Interaction**: Click Tab → State + URL-Update
- **Konzept**: ✅ Launch-ready, Hero's Journey Flow
- **Data Provider**: `useJournalStore` (aggregierte Counts)

#### 2.2.2 Trade Entry List (je nach Tab)
- **Position**: Unterhalb Segmented Control
- **Bezeichnung**: Liste von Journal Entries
- **Funktion**: 
  - Zeigt Entries je nach Tab
  - Click Entry → öffnet Edit-Dialog
  - URL-Sync: `?entry={id}` öffnet Dialog automatisch
- **User Interaction**: 
  - Click Entry → Edit Dialog
  - Swipe (mobile) → Quick Actions (Delete, Archive)
- **Konzept**: ✅ Launch-ready, Offline-First (Dexie)
- **Data Provider**: `useJournalStore` → Dexie IndexedDB (`journalEntries` table)

#### 2.2.3 Filters & Search
- **Position**: Oberhalb Entry List
- **Bezeichnung**: Filter Controls
- **Funktion**: 
  - **Symbol Filter**: Dropdown mit allen Symbols
  - **Date Range**: Von-Bis Picker
  - **Outcome Filter**: Win/Loss/Break-even
  - **Sort**: Newest/Oldest/P&L
- **User Interaction**: Select/Input → List filtert in Echtzeit
- **Konzept**: ✅ Launch-ready
- **Data Provider**: Lokal (Client-seitig auf `trades[]`)

#### 2.2.4 Create Entry Button (FAB)
- **Position**: Fixed bottom-right
- **Bezeichnung**: "+" Floating Action Button
- **Funktion**: Öffnet Create Entry Dialog
- **User Interaction**: Click → Dialog mit Trade Entry Form
- **Konzept**: ✅ Launch-ready
- **Data Provider**: None (Action trigger)

### 2.3 Entry Edit/Create Dialog

**Komponente**: `TradeEntryForm`

#### 2.3.1 Form Fields
- **Position**: Modal Dialog
- **Bezeichnung**: Trade Entry Form
- **Funktion**: 
  - **Symbol**: Text Input (z.B. "BTC")
  - **Type**: Select (Long/Short)
  - **Entry Price**: Number Input
  - **Exit Price**: Number Input
  - **Position Size**: Number Input
  - **P&L**: Auto-calculated (oder manuell)
  - **Date**: Date Picker
  - **Notes**: Textarea
  - **Emotional State**: Emoji Picker (optional)
  - **Template**: Dropdown (vordefinierte Templates)
- **User Interaction**: 
  - Fill Form → Click "Save"
  - Validierung: Symbol + Entry Price required
- **Konzept**: ✅ Launch-ready, Hero's Journey Integration
- **Data Provider**: 
  - **Write**: `JournalService.createEntry()` → Dexie
  - **Read** (Edit): `useJournalStore.getEntryById(id)`

#### 2.3.2 Template Selector
- **Position**: Innerhalb Entry Form
- **Bezeichnung**: Template Dropdown
- **Funktion**: 
  - Wählt vordefiniertes Template (z.B. "Scalp", "Swing", "Lesson Learned")
  - Auto-füllt Notes mit Template-Struktur
- **User Interaction**: Select Template → Notes werden vorausgefüllt
- **Konzept**: ✅ Launch-ready, UX-Optimierung
- **Data Provider**: Static Templates (künftig: user-defined)

#### 2.3.3 Action Buttons
- **Position**: Dialog Footer
- **Bezeichnung**: Save, Cancel, Delete (bei Edit)
- **Funktion**: 
  - **Save**: Validiert + speichert in DB
  - **Cancel**: Schließt Dialog ohne Änderung
  - **Delete**: Öffnet Confirm-Dialog → löscht Entry
- **User Interaction**: Click Button → entsprechende Aktion
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `JournalService`

### 2.4 Empty State

#### 2.4.1 Journal Empty State (je Tab)
- **Position**: Anstelle List (wenn keine Entries)
- **Bezeichnung**: Empty State Message
- **Funktion**: 
  - **Confirmed Tab**: "No confirmed trades yet. Start by logging a trade!"
  - **Pending Tab**: "No pending trades. All clear!"
  - **Archived Tab**: "No archived entries."
- **User Interaction**: CTA → "Create First Entry"
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `useJournalStore` (leer wenn count === 0)

---

## 3. Learn (/lessons)

**Route**: `/lessons`  
**Icon**: GraduationCap  
**Store**: `useLessons`  
**Testid**: `page-learn`

### 3.1 Header Section

#### 3.1.1 Page Header
- **Position**: Top
- **Bezeichnung**: "Learn" + Icon + Progress
- **Funktion**: 
  - Zeigt "{unlockedCount} of {totalCount} lessons unlocked"
  - Gamification: "degen → mastery"
- **User Interaction**: Read-only
- **Konzept**: ✅ Launch-ready, Gamification
- **Data Provider**: `useLessons` (berechnet aus Lessons Array)

### 3.2 Unlock Callout

#### 3.2.1 UnlockCallout
- **Position**: Unterhalb Header
- **Bezeichnung**: Unlock Banner
- **Funktion**: 
  - Zeigt "{lockedCount} lessons locked"
  - Motivational Message: "Trade more to unlock lessons"
- **User Interaction**: Read-only (künftig: Click → XP Info)
- **Konzept**: ✅ Launch-ready, Gamification
- **Data Provider**: `useLessons.lockedCount`

### 3.3 Filters

#### 3.3.1 LessonFilters
- **Position**: Unterhalb Callout
- **Bezeichnung**: Filter Controls
- **Funktion**: 
  - **Category Pills**: Multi-select (z.B. "Risk Management", "Psychology", "Technical Analysis")
  - **Sort Dropdown**: Newest, Difficulty Asc, Difficulty Desc
  - **Reset Button**: Setzt Filter zurück
- **User Interaction**: 
  - Click Pill → Toggle category
  - Select Sort → Re-ordnet List
  - Click Reset → Alle Filter zurücksetzen
- **Konzept**: ✅ Launch-ready
- **Data Provider**: Lokal (Client-seitig auf `lessons[]`)

### 3.4 Lessons Grid

#### 3.4.1 LessonCard (Grid Items)
- **Position**: Grid (3 Spalten Desktop, 2 Tablet, 1 Mobile)
- **Bezeichnung**: Lesson Card
- **Funktion**: 
  - **Title**: Lesson Name
  - **Category Badge**: Kategorie (farbcodiert)
  - **Difficulty**: Sterne (1-5)
  - **Lock Icon**: Falls locked
  - **Unlock Requirement**: "Trade 10+ times to unlock"
- **User Interaction**: 
  - Click (unlocked) → öffnet Lesson Detail
  - Click (locked) → Tooltip mit Unlock-Hint
- **Konzept**: ✅ Launch-ready, Gamification
- **Data Provider**: `useLessons.lessons[]` (statische Daten)

### 3.5 Lesson Detail View

**Hinweis**: Detail-View existiert noch nicht im Code, ist aber geplant.

#### 3.5.1 Lesson Detail (geplant)
- **Position**: Modal oder separate Page
- **Bezeichnung**: Lesson Content
- **Funktion**: 
  - Markdown-Content des Lessons
  - Video/Image (optional)
  - "Mark as Complete" Button
  - XP Reward: "+50 XP"
- **User Interaction**: 
  - Scroll → Read
  - Click "Complete" → XP Update + Badge
- **Konzept**: 🚧 Geplant, noch nicht implementiert
- **Data Provider**: `useLessons.getLessonById(id)` (künftig)

### 3.6 Empty State

#### 3.6.1 Lessons Filter Empty State
- **Position**: Anstelle Grid (wenn Filter keine Results)
- **Bezeichnung**: "No lessons match your filters"
- **Funktion**: Zeigt Message + "Reset filters" Link
- **User Interaction**: Click "Reset" → Filter zurücksetzen
- **Konzept**: ✅ Launch-ready
- **Data Provider**: Lokal (Filter-Result empty)

---

## 4. Chart (/chart)

**Route**: `/chart`  
**Icon**: LineChart  
**Store**: useState (lokal)  
**Testid**: `page-chart`

### 4.1 Top Bar

#### 4.1.1 ChartTopBar
- **Position**: Top
- **Bezeichnung**: Chart Header Bar
- **Funktion**: 
  - **Timeframe Selector**: Buttons (1m, 5m, 15m, 1H, 4H, 1D, 1W)
  - **Replay Mode Toggle**: Switch "Replay Mode" (on/off)
  - **Menu Button** (mobile only): Öffnet Sidebar
- **User Interaction**: 
  - Click Timeframe → Update Chart
  - Toggle Replay → URL-Param `?replay=true`
  - Click Menu → öffnet Sheet
- **Konzept**: ✅ Launch-ready, Chart-Steuerung
- **Data Provider**: Lokal State (`selectedTimeframe`, `isReplayMode`)

### 4.2 Left Sidebar (Desktop)

#### 4.2.1 ChartSidebar
- **Position**: Links (Desktop), Sheet (Mobile)
- **Bezeichnung**: Markets List
- **Funktion**: 
  - Zeigt Liste von Markets (BTC/USD, ETH/USD, SOL/USD, etc.)
  - Highlight: Aktuell ausgewähltes Market
  - Search Input (geplant)
- **User Interaction**: 
  - Click Market → Update Chart
  - Search → Filter Markets
- **Konzept**: ✅ Launch-ready, Market Selection
- **Data Provider**: Statische Market-Liste (künftig: API)

### 4.3 Chart Canvas (Center)

#### 4.3.1 ChartToolbar
- **Position**: Oberhalb Canvas
- **Bezeichnung**: Drawing Tools
- **Funktion**: 
  - Tool Icons: Trendline, Horizontal Line, Fib Retracement, Text
  - Cursor, Crosshair, Zoom
- **User Interaction**: 
  - Click Tool → Aktiviert Drawing Mode
  - Click Canvas → Zeichnet Shape
- **Konzept**: 🚧 Placeholder (Icons vorhanden, Drawing-Logik fehlt)
- **Data Provider**: None (UI-only, Canvas-Interaction geplant)

#### 4.3.2 Chart Canvas
- **Position**: Hauptbereich
- **Bezeichnung**: Chart Placeholder
- **Funktion**: 
  - Zeigt aktuell Placeholder mit Symbol + Timeframe
  - Nachricht: "Chart canvas ready. Connect a charting provider to view live data."
  - **Replay Mode**: "Replay mode active. Use controls to navigate historical data."
- **User Interaction**: 
  - Künftig: Pan, Zoom, Click für Drawing
- **Konzept**: 🚧 Placeholder, TradingView/Charting-Provider geplant
- **Data Provider**: Künftig TradingView Widget oder Custom Charting Lib

#### 4.3.3 ChartReplayControls (wenn Replay Mode aktiv)
- **Position**: Oberhalb Canvas (unterhalb Toolbar)
- **Bezeichnung**: Replay Steuerung
- **Funktion**: 
  - **Play/Pause Button**: Startet/stoppt Replay
  - **Slider**: Zeigt Current Time / Duration
  - **Speed Dropdown**: 0.5x, 1x, 2x, 4x
  - **Step Back/Forward**: -10s / +10s
  - **Reset Button**: Zurück zu Start
- **User Interaction**: 
  - Click Play → Replay läuft (State: `isPlaying`)
  - Drag Slider → Seek zu bestimmter Zeit
  - Keyboard: Space (Play/Pause), ← (Step Back), → (Step Forward)
- **Konzept**: ✅ Launch-ready, Replay-Logik vorhanden (Demo)
- **Data Provider**: Lokal State (`currentTime`, `speed`, `isPlaying`)

### 4.4 Bottom Tabs

#### 4.4.1 ChartBottomTabs
- **Position**: Unten (unterhalb Canvas)
- **Bezeichnung**: Chart Analysis Tabs
- **Funktion**: 
  - **Tabs**: Orders, Positions, History, Alerts, Notes
  - Zeigt jeweils entsprechende Liste
- **User Interaction**: Click Tab → Zeigt Content
- **Konzept**: 🚧 UI vorhanden, Content Placeholder
- **Data Provider**: Künftig: Alerts Store, Journal Store

### 4.5 Right Panel (Desktop)

#### 4.5.1 ChartRightPanel
- **Position**: Rechts (Desktop only)
- **Bezeichnung**: Tools & Indicators
- **Funktion**: 
  - **Indicators**: Liste verfügbarer Indikatoren (RSI, MACD, Bollinger Bands)
  - **Drawing Tools**: Erweiterte Tools
  - **Settings**: Chart-Einstellungen (Farben, Grid)
- **User Interaction**: 
  - Click Indicator → Fügt hinzu zu Chart
  - Toggle Settings → Öffnet Settings Panel
- **Konzept**: 🚧 Placeholder, Indicators geplant
- **Data Provider**: Static (künftig: Chart Provider API)

### 4.6 Mobile Sidebar Sheet

#### 4.6.1 Sheet (Mobile)
- **Position**: Sheet von links (mobile)
- **Bezeichnung**: Markets Sheet
- **Funktion**: Gleich wie Desktop Sidebar, aber als Sheet
- **User Interaction**: 
  - Click Market → Schließt Sheet + Update Chart
- **Konzept**: ✅ Launch-ready
- **Data Provider**: Siehe 4.2.1

---

## 5. Alerts (/alerts)

**Route**: `/alerts`  
**Icon**: Bell  
**Store**: `useAlerts`  
**Testid**: `page-alerts`

### 5.1 Header Section

#### 5.1.1 Page Header
- **Position**: Top
- **Bezeichnung**: "Alerts" + Icon
- **Funktion**: Title mit Bell-Icon
- **User Interaction**: Read-only
- **Konzept**: ✅ Launch-ready
- **Data Provider**: Static

### 5.2 Empty State

#### 5.2.1 AlertsEmptyState
- **Position**: Anstelle List (wenn keine Alerts)
- **Bezeichnung**: Empty State
- **Funktion**: 
  - Hero-Message: "No alerts yet. Create your first alert!"
  - CTA Button: "Create Alert"
- **User Interaction**: Click CTA → Zeigt Quick Create Form
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `useAlerts.alerts.length === 0`

### 5.3 Quick Create Form

#### 5.3.1 AlertQuickCreate
- **Position**: Oberhalb List (wenn `showQuickCreate === true`)
- **Bezeichnung**: Quick Create Form
- **Funktion**: 
  - **Symbol Input**: Text (z.B. "BTC")
  - **Condition Dropdown**: "Price above", "Price below"
  - **Target Price**: Number Input
  - **Submit Button**: "Create Alert"
- **User Interaction**: 
  - Fill Form → Click "Create"
  - Validierung: Alle Felder required
  - Nach Submit: Form bleibt offen für nächsten Alert
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `useAlerts.createAlert(symbol, condition, targetPrice)`

#### 5.3.2 Toggle Create Form
- **Position**: Oberhalb List (wenn Form hidden)
- **Bezeichnung**: "+ Create new alert" Link
- **Funktion**: Zeigt Quick Create Form
- **User Interaction**: Click → `setShowQuickCreate(true)`
- **Konzept**: ✅ Launch-ready
- **Data Provider**: Local State

### 5.4 Filters

#### 5.4.1 AlertFilters
- **Position**: Oberhalb List
- **Bezeichnung**: Filter Tabs
- **Funktion**: 
  - **Tabs**: All, Active, Triggered, Paused
  - Badge: Anzahl pro Filter
  - **Clear Button**: Zeigt "All"
- **User Interaction**: Click Tab → Filter List
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `useAlerts.filter`, `filteredAlerts`

### 5.5 Alerts List

#### 5.5.1 AlertCard (List Items)
- **Position**: List
- **Bezeichnung**: Alert Card
- **Funktion**: 
  - **Symbol**: z.B. "BTC"
  - **Condition**: "Price above 50,000"
  - **Status Badge**: Active, Triggered, Paused (farbcodiert)
  - **Toggle Switch**: Aktiviert/Deaktiviert Alert
  - **Delete Button**: Trash Icon
- **User Interaction**: 
  - Toggle Switch → `useAlerts.toggleAlert(id)`
  - Click Delete → Öffnet Confirm Dialog
  - Click Card (künftig) → Edit Dialog
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `useAlerts.filteredAlerts[]`

### 5.6 Delete Confirmation

#### 5.6.1 AlertDeleteConfirm
- **Position**: Modal Dialog
- **Bezeichnung**: Delete Confirmation
- **Funktion**: 
  - Message: "Delete alert for {symbol}?"
  - Buttons: "Cancel", "Delete"
- **User Interaction**: 
  - Click "Delete" → `useAlerts.deleteAlert(id)`
  - Click "Cancel" → Schließt Dialog
- **Konzept**: ✅ Launch-ready
- **Data Provider**: Local State (`deleteTarget`)

### 5.7 Filter Empty State

#### 5.7.1 Filter Empty State
- **Position**: Anstelle List (wenn Filter keine Results)
- **Bezeichnung**: "No alerts match the current filter."
- **Funktion**: Info-Message
- **User Interaction**: Read-only (User kann Filter wechseln)
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `filteredAlerts.length === 0`

---

## 6. Settings (/settings)

**Route**: `/settings`  
**Icon**: Settings  
**Store**: Verschiedene (Theme, Journal, etc.)  
**Testid**: `page-settings`

### 6.1 Header Section

#### 6.1.1 Page Header
- **Position**: Top
- **Bezeichnung**: "Settings" + Icon
- **Funktion**: Title + Subtitle ("Manage your preferences and data")
- **User Interaction**: Read-only
- **Konzept**: ✅ Launch-ready
- **Data Provider**: Static

### 6.2 Setup Completeness

#### 6.2.1 SetupCompleteness
- **Position**: Unterhalb Header
- **Bezeichnung**: Setup Progress Bar
- **Funktion**: 
  - Progress Bar: z.B. "3 of 5 steps completed"
  - Checklist: Theme, Wallet, First Trade, First Alert, Export Backup
- **User Interaction**: Read-only (zeigt Status)
- **Konzept**: ✅ Launch-ready, Onboarding
- **Data Provider**: Aggregiert aus verschiedenen Stores

### 6.3 Settings Sections

**Pattern**: Alle Sections verwenden `SettingsSection` Wrapper

#### 6.3.1 Appearance (Priority Section)
- **Position**: Section 1
- **Bezeichnung**: "Appearance"
- **Funktion**: 
  - **ThemeToggle**: Light, Dark, System (Radio Buttons)
- **User Interaction**: Click Theme → Update Theme (LocalStorage + DOM)
- **Konzept**: ✅ Launch-ready
- **Data Provider**: LocalStorage `sparkfined-theme`

#### 6.3.2 Chart Preferences
- **Position**: Section 2
- **Bezeichnung**: "Chart preferences"
- **Funktion**: 
  - **Default Timeframe**: Dropdown (1H, 4H, 1D)
  - **Default Indicator**: Dropdown (None, RSI, MACD)
  - **Grid**: Checkbox "Show grid"
- **User Interaction**: Change → Saved to LocalStorage
- **Konzept**: 🚧 UI vorhanden, Settings noch nicht vollständig implementiert
- **Data Provider**: LocalStorage (künftig)

#### 6.3.3 Notifications
- **Position**: Section 3
- **Bezeichnung**: "Notifications"
- **Funktion**: 
  - **Alert Notifications**: Toggle (Push, Email)
  - **Journal Reminders**: Toggle "Daily reminder"
  - **Sound**: Toggle "Alert sound"
- **User Interaction**: Toggle → Saved to LocalStorage
- **Konzept**: 🚧 UI vorhanden, Push-Logik fehlt
- **Data Provider**: LocalStorage + künftig Push API

#### 6.3.4 Connected Wallets
- **Position**: Section 4
- **Bezeichnung**: "Connected wallets"
- **Funktion**: 
  - Liste von Wallets (leer wenn keine)
  - "+ Add Wallet" Button
  - Für jede Wallet: Address (shortened), "Disconnect" Button
- **User Interaction**: 
  - Click "+ Add Wallet" → Öffnet Wallet-Connect Dialog
  - Click "Disconnect" → Entfernt Wallet
- **Konzept**: 🚧 Placeholder, Wallet-Connect geplant
- **Data Provider**: Künftig WalletConnect API / Moralis

#### 6.3.5 Monitoring
- **Position**: Section 5
- **Bezeichnung**: "Monitoring"
- **Funktion**: 
  - **Data Refresh Interval**: Dropdown (10s, 30s, 1m, 5m)
  - **Performance Mode**: Toggle "Enable performance mode"
- **User Interaction**: Change → Saved to LocalStorage
- **Konzept**: 🚧 UI vorhanden, Logik teilweise implementiert
- **Data Provider**: LocalStorage

#### 6.3.6 Journal Data
- **Position**: Section 6
- **Bezeichnung**: "Journal data"
- **Funktion**: 
  - **Auto-capture**: Toggle "Auto-capture wallet trades"
  - **Enrichment**: Checkboxes (Market data, Gas fees, Tx hash)
- **User Interaction**: Toggle → Saved to LocalStorage
- **Konzept**: 🚧 UI vorhanden, Auto-Capture geplant
- **Data Provider**: LocalStorage

#### 6.3.7 Token Usage
- **Position**: Section 7
- **Bezeichnung**: "Token usage"
- **Funktion**: 
  - Zeigt AI Token Consumption (z.B. "1,234 / 10,000 tokens used")
  - Progress Bar
- **User Interaction**: Read-only
- **Konzept**: 🚧 Placeholder, Telemetry geplant
- **Data Provider**: Künftig Telemetry Service

#### 6.3.8 Risk Defaults
- **Position**: Section 8
- **Bezeichnung**: "Risk defaults"
- **Funktion**: 
  - **Default Stop Loss %**: Number Input
  - **Default Take Profit %**: Number Input
  - **Max Position Size**: Number Input
- **User Interaction**: Input → Saved to LocalStorage
- **Konzept**: 🚧 UI vorhanden, Auto-fill in Journal geplant
- **Data Provider**: LocalStorage

#### 6.3.9 Backup & Restore (Priority Section)
- **Position**: Section 9
- **Bezeichnung**: "Backup & Restore"
- **Funktion**: 
  - **Export Button**: "Export all data" → Download JSON
  - **Import Button**: "Import backup" → Upload JSON
  - Shows: "Last export: {date}"
- **User Interaction**: 
  - Click "Export" → Triggers file download (alle Dexie-Daten)
  - Click "Import" → File Input → Import + Merge
- **Konzept**: ✅ Launch-ready, kritische Funktion
- **Data Provider**: `DataExportImport` Component → Dexie

#### 6.3.10 Advanced
- **Position**: Section 10
- **Bezeichnung**: "Advanced"
- **Funktion**: 
  - **Debug Mode**: Toggle "Enable debug logs"
  - **Clear Cache**: Button "Clear cache"
  - **View Logs**: Button "View logs" → öffnet Log-Viewer
- **User Interaction**: 
  - Toggle Debug → LocalStorage
  - Click "Clear Cache" → Clears Service Worker Cache
- **Konzept**: 🚧 UI vorhanden, Logs teilweise implementiert
- **Data Provider**: LocalStorage + Service Worker

#### 6.3.11 Danger Zone
- **Position**: Section 11 (rote Border)
- **Bezeichnung**: "Danger zone"
- **Funktion**: 
  - **Factory Reset**: Button "Reset all data"
  - Öffnet Confirmation Dialog: "This will delete ALL data. Type 'RESET' to confirm."
- **User Interaction**: 
  - Click "Reset" → Dialog
  - Type "RESET" + Confirm → Löscht Dexie DB + LocalStorage + Reload
- **Konzept**: ✅ Launch-ready, kritische Funktion
- **Data Provider**: `FactoryReset` Component → Dexie + LocalStorage

### 6.4 Footer Section

#### 6.4.1 Update App Button
- **Position**: Ganz unten
- **Bezeichnung**: "Update app" Button
- **Funktion**: 
  - Checkt für Service Worker Update
  - Bei Update verfügbar: Triggert Reload
- **User Interaction**: Click → Reload mit neuem SW
- **Konzept**: 🚧 UI vorhanden, SW-Update-Logik geplant
- **Data Provider**: Service Worker API

---

## 7. Watchlist (/watchlist)

**Route**: `/watchlist`  
**Icon**: Eye  
**Store**: `useWatchlist`  
**Testid**: `page-watchlist`

### 7.1 Header Section

#### 7.1.1 Page Header
- **Position**: Top
- **Bezeichnung**: "Watchlist" + Icon
- **Funktion**: Title mit Eye-Icon
- **User Interaction**: Read-only
- **Konzept**: ✅ Launch-ready
- **Data Provider**: Static

#### 7.1.2 WatchlistQuickAdd (wenn Items vorhanden)
- **Position**: Header rechts
- **Bezeichnung**: Quick Add Input
- **Funktion**: 
  - Text Input: "Add symbol..."
  - Enter → Fügt Symbol hinzu
- **User Interaction**: 
  - Type Symbol → Press Enter → `useWatchlist.addItem(symbol)`
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `useWatchlist`

### 7.2 Empty State

#### 7.2.1 WatchlistEmptyState
- **Position**: Anstelle List (wenn keine Items)
- **Bezeichnung**: Empty State
- **Funktion**: 
  - Hero-Message: "Your watchlist is empty. Add symbols to track."
  - CTA: "Add First Symbol"
- **User Interaction**: Click CTA → Fokussiert Add Input
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `useWatchlist.items.length === 0`

### 7.3 Watchlist Grid (Main View)

**Layout**: 2-Spalten (Desktop): List (links) + Detail Panel (rechts)

#### 7.3.1 Watchlist Card (List Items)
- **Position**: Grid (2 Spalten Tablet, 1 Mobile)
- **Bezeichnung**: Symbol Card
- **Funktion**: 
  - **Symbol**: z.B. "BTC"
  - **Name**: "Bitcoin"
  - **Current Price**: Live-Preis
  - **24h Change**: +/- % (farbcodiert: grün/rot)
  - **Sparkline**: Mini-Chart (letzte 24h)
  - **Remove Button**: Trash Icon
- **User Interaction**: 
  - Click Card → Select (öffnet Detail Panel)
  - Click Remove → `useWatchlist.removeItem(id)`
- **Konzept**: ✅ Launch-ready
- **Data Provider**: 
  - `useWatchlist.items[]`
  - Live-Preis: `marketOrchestrator` (künftig)

### 7.4 Detail Panel (Right)

#### 7.4.1 WatchlistSymbolDetail
- **Position**: Rechts (sticky, Desktop)
- **Bezeichnung**: Symbol Detail Panel
- **Funktion**: 
  - **Header**: Symbol + Name
  - **Price**: Current Price (groß)
  - **Stats**: 
    - 24h High/Low
    - 24h Volume
    - Market Cap
  - **Mini Chart**: 7-Tage-Chart
  - **Actions**: 
    - "View Chart" → `/chart?symbol={symbol}`
    - "Create Alert" → `/alerts?symbol={symbol}`
    - "Log Trade" → `/journal?symbol={symbol}`
- **User Interaction**: 
  - Click Action Button → Navigation mit pre-filled Symbol
- **Konzept**: ✅ Launch-ready
- **Data Provider**: 
  - `useWatchlist.selectedItem`
  - Market Data: `marketOrchestrator`

### 7.5 Detail Panel Empty State

#### 7.5.1 Detail Empty State
- **Position**: Detail Panel (wenn nichts selected)
- **Bezeichnung**: "Select a symbol to see details"
- **Funktion**: Placeholder Message
- **User Interaction**: Read-only
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `useWatchlist.selectedId === null`

---

## 8. Oracle (/oracle)

**Route**: `/oracle`  
**Icon**: Sparkles  
**Store**: `useOracle`  
**Testid**: `page-oracle` (implizit)

### 8.1 Header Section

#### 8.1.1 Page Header
- **Position**: Top
- **Bezeichnung**: "Oracle" + Icon
- **Funktion**: 
  - Title mit Sparkles-Icon
  - Subtitle: "AI-powered insights to guide your journey"
- **User Interaction**: Read-only
- **Konzept**: ✅ Launch-ready, Gamification
- **Data Provider**: Static

#### 8.1.2 OracleFilters
- **Position**: Header rechts
- **Bezeichnung**: Filter Tabs
- **Funktion**: 
  - **Tabs**: All, Unread, Read
  - Badge: Anzahl pro Filter
- **User Interaction**: Click Tab → Filter Insights
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `useOracle.filter`, `counts`

### 8.2 Today's Takeaway

#### 8.2.1 OracleTodayTakeaway
- **Position**: Unterhalb Header (Featured)
- **Bezeichnung**: Today's Insight Card
- **Funktion**: 
  - Highlighted Card (größer, andere Farbe)
  - **Title**: Insight Title
  - **Message**: Insight Content
  - **Badge**: "Today"
- **User Interaction**: Click (künftig) → Insight Detail
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `useOracle.todayInsight`

### 8.3 Reward Banner

#### 8.3.1 OracleRewardBanner
- **Position**: Unterhalb Today's Takeaway
- **Bezeichnung**: Streak Banner
- **Funktion**: 
  - Zeigt Reading Streak: "{readingStreak} days in a row"
  - Motivational Message: "Keep reading to earn XP!"
  - XP Icon + Progress Bar (künftig)
- **User Interaction**: Read-only (künftig: Click → XP Detail)
- **Konzept**: ✅ Launch-ready, Gamification
- **Data Provider**: `useOracle.readingStreak`

### 8.4 Insights List

#### 8.4.1 OracleInsightCard (List Items)
- **Position**: List (unterhalb Banner)
- **Bezeichnung**: Insight Card
- **Funktion**: 
  - **Icon**: Basierend auf Type (💡 Tip, 🎯 Goal, 📈 Analysis)
  - **Title**: Insight Title
  - **Message**: Insight Content (max 2-3 Zeilen)
  - **Timestamp**: "2 hours ago"
  - **Read Badge**: "Unread" Badge (wenn nicht gelesen)
  - **Mark as Read Button**: Checkmark Icon
- **User Interaction**: 
  - Click "Mark as Read" → `useOracle.markAsRead(id)`
  - Click Card (künftig) → Insight Detail
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `useOracle.insights[]`

### 8.5 Empty State

#### 8.5.1 OracleEmptyState
- **Position**: Anstelle List (wenn keine Insights)
- **Bezeichnung**: Empty State
- **Funktion**: 
  - **All Tab**: "No insights yet. Trade more to unlock AI insights!"
  - **Unread Tab**: "All caught up! No unread insights."
  - **Read Tab**: "No read insights yet."
- **User Interaction**: Read-only
- **Konzept**: ✅ Launch-ready
- **Data Provider**: `useOracle.insights.length === 0`

---

## 9. Handbook (/handbook)

**Route**: `/handbook`  
**Icon**: HelpCircle  
**Store**: None (statisch)  
**Testid**: `page-handbook` (implizit)

**Status**: 🚧 Dev-Only Feature (nur sichtbar wenn `VITE_ENABLE_DEV_NAV === 'true'`)

### 9.1 Content

- **Funktion**: Dokumentation und FAQ
- **Konzept**: Geplant, noch nicht implementiert
- **Data Provider**: Static Markdown (künftig)

---

## 10. Replay (/replay, /chart/replay)

**Route**: `/replay`, `/chart/replay`  
**Funktion**: Redirect zu `/chart?replay=true`

**Komponente**: `Replay.tsx` (simple Redirect-Komponente)

---

## Navigation Elemente (Global)

### 10.1 Desktop Sidebar Navigation

**Komponente**: `AppSidebar` (vermutlich in `@/features/shell`)

#### 10.1.1 Primary Nav Items
- Dashboard (/)
- Journal (/journal)
- Learn (/lessons)
- Chart (/chart)
- Alerts (/alerts)
- Settings (/settings)

#### 10.1.2 Secondary Nav Items
- Watchlist (/watchlist)
- Oracle (/oracle)
- Handbook (/handbook) [Dev-Only]

### 10.2 Mobile Bottom Navigation

**Komponente**: `MobileBottomNav`

#### 10.2.1 Bottom Nav Items (Mobile)
- Dashboard
- Journal
- Chart
- Alerts
- Settings

**Hinweis**: Watchlist + Oracle nur über Sidebar/Drawer erreichbar auf Mobile

### 10.3 App Header

**Komponente**: `AppHeader`

#### 10.3.1 Header Elements
- **Logo**: Sparkfined Logo (links)
- **Title**: Aktueller Tab-Name (center, mobile)
- **Menu Button**: Hamburger (mobile, öffnet Sidebar)
- **User Profile** (geplant): Avatar (rechts)
- **Notifications Badge** (geplant): Bell mit Counter

---

## Data Provider Übersicht

### Stores (Zustand)
- **useTradesStore**: Journal Entries (Dexie Sync)
- **useJournalStore**: Journal UI State + CRUD
- **useAlerts**: Alerts Management
- **useWatchlist**: Watchlist Items
- **useOracle**: AI Insights
- **useLessons**: Lessons Content

### Services
- **JournalService**: CRUD für Journal Entries (Dexie)
- **marketOrchestrator**: Multi-Provider Market Data (CoinGecko → CoinCap → Moralis)
- **eventBus**: Cross-Component Events

### Persistence
- **Dexie (IndexedDB)**: 
  - `journalEntries` Table
  - `alerts` Table
  - `watchlist` Table
  - `insights` Table
- **LocalStorage**: 
  - Theme
  - Settings
  - UI State

### External APIs (geplant/teilweise)
- **CoinGecko**: Market Data (Primary)
- **CoinCap**: Market Data (Fallback)
- **Moralis**: Wallet Data, Chain Data (Fallback)
- **TradingView Widget**: Chart Provider (geplant)
- **WalletConnect**: Wallet Connection (geplant)
- **Push API**: Notifications (geplant)

---

## Gamification System

### XP System
- **Degen** (0-99 XP): Starter
- **Seeker** (100-499 XP): Learning
- **Warrior** (500-1999 XP): Trading actively
- **Master** (2000-4999 XP): Consistent
- **Sage** (5000+ XP): Mastery

### XP Sources
- **Journal Entry**: +10 XP
- **Complete Lesson**: +50 XP
- **Read Oracle Insight**: +5 XP
- **Daily Streak**: +20 XP
- **Trade with Lesson Applied**: +25 XP

### Unlockables
- **Lessons**: Unlock based on Trade Count
- **Oracle Insights**: Unlock based on Journal Entries
- **Advanced Features**: Unlock based on XP Level

---

## Launch Readiness Status

### ✅ Launch-Ready Tabs (Vollständig)
1. **Dashboard**: Alle KPI Cards, Feed, Empty States
2. **Journal**: CRUD, Filters, Templates, URL-Sync
3. **Learn**: Lessons Grid, Filters, Gamification
4. **Alerts**: CRUD, Filters, Quick Create
5. **Settings**: Theme, Backup/Restore, Factory Reset
6. **Watchlist**: List, Detail Panel, Quick Add
7. **Oracle**: Insights List, Filters, Gamification

### 🚧 Partiell Launch-Ready (UI fertig, Logik fehlt)
1. **Chart**: 
   - ✅ UI/UX vollständig
   - ❌ Canvas Provider fehlt (TradingView geplant)
   - ✅ Replay Mode Steuerung funktional
   - ❌ Drawing Tools UI-only

### ⚠️ Geplante Features (nicht implementiert)
- Wallet Connect
- Push Notifications
- AI-generierte Insights (aktuell statisch)
- Auto-Capture (Wallet → Journal)
- Service Worker Update-Logik
- Lesson Detail View

---

## Testing Coverage

### E2E Tests (Playwright)
- ✅ Journal CRUD Flows
- ✅ Alert Creation/Deletion
- ✅ Navigation zwischen Tabs
- ✅ URL-Sync (Journal, Chart)
- 🚧 Replay Mode (teilweise)
- ❌ Watchlist Flows (fehlt)
- ❌ Oracle Flows (fehlt)

### Unit Tests (Vitest)
- ✅ JournalService
- ✅ useTradesStore
- ✅ useAlerts
- 🚧 marketOrchestrator (teilweise)
- ❌ useWatchlist (fehlt)
- ❌ useOracle (fehlt)

---

## Accessibility (a11y)

### Implementiert
- ✅ Keyboard Navigation (Tab, Enter, Escape)
- ✅ ARIA Labels auf Icons
- ✅ Focus Indicators
- ✅ `data-testid` Attributes (E2E-stabil)
- ✅ Semantic HTML (Headings, Lists, Buttons)

### Geplant
- Screen Reader Optimierung
- High Contrast Mode Support
- Reduced Motion Preferences

---

## Performance

### Optimiert
- ✅ React.lazy() für alle Pages (Code Splitting)
- ✅ useMemo für teure Berechnungen (KPIs, Filters)
- ✅ Dexie Indexing (schnelle Queries)
- ✅ Debounced Search Inputs

### Geplant
- Virtual Scrolling für lange Listen (Journal, Watchlist)
- Image Lazy Loading
- Service Worker Caching

---

**Letzte Aktualisierung**: 2025-12-30  
**Status**: Vollständiges Overview aller 8 Haupt-Tabs erstellt  
**Nächste Schritte**: Detailanalyse einzelner Komponenten bei Bedarf
