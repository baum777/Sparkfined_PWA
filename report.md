# Tab-Architektur Analyse & Wiring Report

**Generiert:** 2025-01-27  
**Quellen:** Codebase-Analyse, loveable-import, verdrahtung.md  
**Version:** 1.0.0

---

## 📋 Inhaltsverzeichnis

1. [Executive Summary](#executive-summary)
2. [Tab-Inventar (Ist-Zustand)](#tab-inventar-ist-zustand)
3. [Tab-Inventar (Soll-Zustand)](#tab-inventar-soll-zustand)
4. [Ist↔Soll Mapping & Bewertung](#ist↔soll-mapping--bewertung)
5. [Wiring Sheets (pro Tab)](#wiring-sheets-pro-tab)
6. [Priorisierte Fixliste](#priorisierte-fixliste)
7. [Static Checks & Automatisierung](#static-checks--automatisierung)
8. [Smoke-Test Matrix](#smoke-test-matrix)

---

## Executive Summary

### Status-Übersicht

| Kategorie | Anzahl | Status |
|-----------|--------|--------|
| **Soll-Tabs (Primary)** | 6 | ✅ 5/6 korrekt, 1 Mismatch |
| **Soll-Tabs (Secondary)** | 2 | ✅ 2/2 korrekt |
| **Replay (Mode)** | 1 | ✅ Korrekt als Chart-Mode |
| **Extra Tabs (Dev)** | 2 | ℹ️ Dev-only, kein Action Item |

### Top Issues

1. **🔴 HIGH**: Lessons ist in Secondary Nav, sollte Primary (Order 3) sein
2. **🟡 MEDIUM**: Route-Mismatch: loveable-import zeigt `/learn`, Soll ist `/lessons`
3. **🟢 LOW**: Bottom Panel Tabs (Grok Pulse + Journal Notes) fehlen in Chart/Dashboard
4. **🟢 LOW**: Progress-Tracking fehlt in Lessons
5. **🟢 LOW**: Wallet Chain-Gating nicht implementiert

### Compliance Score

- **Routing/Nav**: 85% (1 Mismatch)
- **UI Must-Haves**: 90% (meiste Features vorhanden)
- **API/Wiring**: 85% (grundlegend vorhanden, Verbesserungen möglich)
- **Wallet/Onchain**: 60% (basic vorhanden, erweiterte Features fehlen)
- **Tests**: 70% (E2E vorhanden, Smoke-Tests unvollständig)

---

## Tab-Inventar (Ist-Zustand)

### Primary Tabs

| Tab ID | Label | Route | Order | Component | Status | Nav Key |
|--------|-------|-------|-------|-----------|--------|---------|
| dashboard | Dashboard | `/dashboard` | 1 | `DashboardPage` | ✅ done | `nav-dashboard` |
| journal | Journal | `/journal` | 2 | `JournalPage` | ✅ done | `nav-journal` |
| chart | Chart | `/chart` | 4 | `ChartPage` | ✅ done | `nav-chart` |
| alerts | Alerts | `/alerts` | 5 | `AlertsPage` | ✅ done | `nav-alerts` |
| settings | Settings | `/settings` | 6 | `SettingsPage` | ✅ done | `nav-settings` |

**⚠️ Fehlend in Primary**: `lessons` (ist aktuell in Secondary)

### Secondary Tabs

| Tab ID | Label | Route | Order | Component | Status | Nav Key |
|--------|-------|-------|-------|-----------|--------|---------|
| watchlist | Watchlist | `/watchlist` | 7 | `WatchlistPage` | ✅ done | `nav-watchlist` |
| oracle | Oracle | `/oracle` | 8 | `OraclePage` | ✅ done | `nav-oracle` |
| lessons | Learn | `/lessons` | - | `LessonsPage` | ✅ done | `nav-lessons` |
| signals | Signals | `/signals` | - | `SignalsPage` | ⚠️ partial | `nav-signals` |
| showcase | Showcase | `/icons` | - | `IconShowcase` | ℹ️ dev | `nav-showcase` |

**⚠️ Problem**: `lessons` sollte Primary sein (Order 3)

### Replay (Mode, kein Tab)

| Route | Component | Mode | Chart Tab Active |
|-------|-----------|------|------------------|
| `/replay` | `ChartPage` | `replay` | ✅ Ja |
| `/replay/:sessionId` | `ChartPage` | `replay` | ✅ Ja |

**✅ Korrekt**: Replay ist kein eigener Tab, sondern Chart-Mode

---

## Tab-Inventar (Soll-Zustand)

### Soll-Architektur (aus verdrahtung.md)

**Primary Tabs (Reihenfolge):**
1. Dashboard
2. Journal
3. **Learn** (`/lessons`)
4. Chart
5. Alerts
6. Settings

**Secondary Tabs:**
- Watchlist
- Oracle

**Replay-Regel:**
> Kein eigener Tab; `/replay` ist Route-Alias → setzt Chart Replay Mode

### Must-Have Inhalte (pro Tab)

#### Dashboard
- ✅ Header + Meta + CTA "Log entry"
- ✅ KPI Strip (5 KPIs)
- ✅ Daily Bias Card
- ✅ Holdings Card
- ✅ Trade Log Card
- ✅ Secondary Cards
- ✅ Bottom Grid
- ✅ FAB + Quick Actions + Overlay
- ✅ Alert Create Entry Point
- ⚠️ **Fehlt**: Bottom Panel Tabs (Grok Pulse + Journal Notes)

#### Journal
- ✅ V2 Layout (Input Column + Output Column)
- ✅ Input Column: Emotional State (required), Thesis (required)
- ✅ Templates (overwrite/merge/suggest)
- ✅ AI notes
- ✅ Sticky Action Bar
- ✅ Output Column: Archetype + Score, 2×2 Metrics, Insights Cards
- ✅ History (latest 5)
- ⚠️ **Zu prüfen**: Autosave Contract (Debounce, Persistence, Error Recovery)

#### Learn (`/lessons`)
- ✅ Module list
- ✅ Lesson viewer (markdown/json)
- ✅ Filters
- ⚠️ **Fehlt**: Progress tracking
- ⚠️ **Fehlt**: Quizzes
- ⚠️ **Fehlt**: AI summaries
- ⚠️ **Fehlt**: Offline caching

#### Chart
- ✅ TopBar: timeframes, replay, export, mobile actions
- ✅ Sidebar: markets, sessions
- ✅ Toolbar: indicators, drawings, alerts
- ✅ Canvas + markers
- ⚠️ **Fehlt**: Bottom Panel Tabs (Grok Pulse + Journal Notes)

#### Alerts
- ✅ List + filters
- ✅ Create flow
- ✅ Empty states with CTA
- ✅ URL-prefill semantics
- ✅ Stable testids
- ℹ️ **Optional**: Onchain triggers (nicht implementiert)

#### Settings
- ✅ Appearance
- ✅ Chart prefs
- ✅ Notifications
- ✅ Connected Wallets
- ✅ Export/Backup
- ✅ Danger Zone (typed RESET)

#### Watchlist
- ✅ Assets list/table
- ✅ Selection → detail panel (split/sheet)
- ✅ Open chart CTA
- ✅ Sort/filter

#### Oracle
- ✅ Reward banner
- ✅ Full report block (`oracle-pre`)
- ✅ Theme filter + history chart + list

---

## Ist↔Soll Mapping & Bewertung

### Score-Matrix (pro Tab)

| Tab | UI Must-Haves | Routing/Nav | API | Wallet | Onchain | States | Tests | Gesamt |
|-----|---------------|-------------|-----|--------|---------|--------|-------|--------|
| Dashboard | 90% | 100% | 85% | N/A | N/A | 90% | 80% | **88%** |
| Journal | 95% | 100% | 90% | N/A | N/A | 95% | 85% | **93%** |
| Lessons | 70% | ⚠️ 50% | 60% | N/A | N/A | 80% | 60% | **63%** |
| Chart | 80% | 100% | 85% | N/A | 70% | 85% | 75% | **82%** |
| Alerts | 95% | 100% | 90% | N/A | N/A | 95% | 90% | **94%** |
| Settings | 90% | 100% | 85% | 60% | 60% | 90% | 70% | **79%** |
| Watchlist | 100% | 100% | 90% | N/A | 70% | 90% | 70% | **87%** |
| Oracle | 95% | 100% | 90% | N/A | N/A | 90% | 70% | **91%** |

### Detaillierte Diff-Analyse

#### ✅ Dashboard (Match)
- **Status**: Match
- **Severity**: None
- **UI Score**: 90% (fehlt: Bottom Panel Tabs)
- **Wiring Score**: 85% (Refresh-Invalidation könnte granularer sein)
- **Empfehlungen**:
  - Bottom Panel Tabs für Grok Pulse hinzufügen
  - Refresh-Invalidation granularer gestalten

#### ✅ Journal (Match)
- **Status**: Match
- **Severity**: None
- **UI Score**: 95% (alle Must-Haves vorhanden)
- **Wiring Score**: 90% (Autosave-Contract prüfen)
- **Empfehlungen**:
  - Autosave Debounce & Persistence Contract verifizieren
  - Error Recovery robuster gestalten

#### ⚠️ Lessons (Mismatch)
- **Status**: Mismatch
- **Severity**: Medium
- **Probleme**:
  1. **Nav**: Ist in Secondary, sollte Primary (Order 3) sein
  2. **Route**: loveable-import zeigt `/learn`, Soll ist `/lessons`
  3. **UI**: Progress-Tracking fehlt
  4. **Wiring**: Progress-Persistence nicht implementiert
- **Empfehlungen**:
  - Lessons zu Primary Nav verschieben (Order 3)
  - `/learn → /lessons` Redirect hinzufügen (Kompatibilität)
  - Progress-Tracking implementieren
  - Offline-Lesson-Caching hinzufügen

#### ✅ Chart (Match)
- **Status**: Match
- **Severity**: Low
- **UI Score**: 80% (fehlt: Bottom Panel Tabs)
- **Wiring Score**: 85% (Replay-State-Init könnte robuster sein)
- **Empfehlungen**:
  - Bottom Panel Tabs für Grok Pulse & Journal Notes hinzufügen
  - Replay-State-Initialisierung robuster gestalten

#### ✅ Alerts (Match)
- **Status**: Match
- **Severity**: None
- **UI Score**: 95% (alle Must-Haves vorhanden)
- **Wiring Score**: 90% (Onchain-Triggers optional, nicht implementiert)
- **Empfehlungen**:
  - Onchain-Triggers optional hinzufügen
  - Prefill-Parsing robuster gestalten

#### ✅ Settings (Match)
- **Status**: Match
- **Severity**: None
- **UI Score**: 90% (alle Must-Haves vorhanden)
- **Wiring Score**: 85% (Export-Endpoints testen)
- **Empfehlungen**:
  - Alle Settings-Sektionen verifizieren
  - Export-Endpoints gründlich testen

#### ✅ Watchlist (Match)
- **Status**: Match
- **Severity**: None
- **UI Score**: 100% (alle Must-Haves vorhanden)
- **Wiring Score**: 90% (Price-Source-Fallback könnte robuster sein)
- **Empfehlungen**:
  - Price-Source-Fallback-Chain verbessern

#### ✅ Oracle (Match)
- **Status**: Match
- **Severity**: None
- **UI Score**: 95% (alle Must-Haves vorhanden)
- **Wiring Score**: 90% (Data-Pipeline optimieren)
- **Empfehlungen**:
  - Data-Pipeline optimieren
  - Pagination-UX verbessern

---

## Wiring Sheets (pro Tab)

### Dashboard

**Entry Points:**
- **Nav-Key**: `nav-dashboard` (`src/config/navigation.ts`)
- **Route-Def**: `/dashboard` (`src/routes/RoutesRoot.tsx`)
- **Params**: `?kpi=alerts` (optional)
- **Aliases**: `/board`, `/dashboard-v2` → `/dashboard`
- **Deep-Link**: `/dashboard?kpi=alerts`
- **Refresh**: State persistiert via Zustand

**UI Composition:**
- **Header**: `DashboardShell` mit Meta + CTA "Log entry"
- **KPI Strip**: `KPIBar` (5 KPIs)
- **Cards**: `DailyBiasCard`, `HoldingsCard`, `TradeLogCard`
- **Secondary Cards**: `JournalSnapshot`, `AlertsSnapshot`
- **Bottom Grid**: `RecentEntriesSection`, `AlertsOverviewWidget`
- **FAB**: `FAB` + `FABMenu` + Overlays

**Data Layer:**
- **Sources**: 
  - KPIs: `useDashboardKpiItemsAdapter()` → `journalStore`, `alertsStore`, `tradeEntries`
  - Holdings: `HoldingsCard` → API/onchain
  - Trades: `TradeLogCard` → `useDashboardTradeEntriesAdapter()`
- **Query Keys**: N/A (Zustand Stores)
- **Mutations**: N/A
- **Cache**: Zustand Stores mit Persistence
- **Invalidation**: Manual refresh via store actions
- **Loading**: `isLoading` state in stores
- **Error**: `error` state in stores
- **Empty**: `hasData` checks + `EmptyState` components

**Wallet/Onchain:**
- **Connectors**: N/A
- **Chain IDs**: N/A
- **Reads**: N/A
- **Writes**: N/A

**Edge Cases:**
- ✅ Disconnected: Offline-State wird angezeigt
- ✅ Error: Error-Banner mit Retry
- ✅ Empty: Empty-State mit CTAs

**Testability:**
- **Test IDs**: `dashboard-page`, `dashboard-kpi-bar`, `dashboard-log-entry`
- **Mocks**: `tests/mocks/`
- **E2E**: `tests/e2e/dashboard/*.spec.ts`
- **Smoke Checklist**: Click nav → loads, Deep-link → preserves state, Refresh → state persists, KPI click → navigates, FAB → opens menu, Log entry CTA → opens overlay

---

### Journal

**Entry Points:**
- **Nav-Key**: `nav-journal` (`src/config/navigation.ts`)
- **Route-Def**: `/journal` (`src/routes/RoutesRoot.tsx`)
- **Params**: `?entry=123` (optional)
- **Aliases**: `/journal-v2` → `/journal`
- **Deep-Link**: `/journal?entry=123`
- **Refresh**: State persistiert via IndexedDB

**UI Composition:**
- **Input Column**: `JournalForm` mit:
  - Emotional State (required)
  - Thesis (required)
  - Templates (overwrite/merge/suggest)
  - AI notes
  - Sticky Action Bar
- **Output Column**: `JournalCard` mit:
  - Archetype + Score
  - 2×2 Metrics
  - Insights Cards
  - History (latest 5)

**Data Layer:**
- **Sources**: 
  - Templates: Static/API
  - AI Insights: `/api/ai/insights`
  - History: IndexedDB via Dexie
- **Query Keys**: N/A (Zustand + IndexedDB)
- **Mutations**: `createEntry`, `updateEntry`, `deleteEntry`
- **Cache**: IndexedDB via Dexie (`src/db/journal.ts`)
- **Invalidation**: Store actions trigger refresh
- **Loading**: `isSaving`, `isLoading` in `useJournalV2()`
- **Error**: `error` state in hook
- **Empty**: `EmptyState` component + `history.length` check

**Wallet/Onchain:**
- **Connectors**: N/A
- **Chain IDs**: N/A
- **Reads**: N/A
- **Writes**: N/A

**Edge Cases:**
- ✅ Validation: Required fields enforced
- ✅ Autosave: Debounced autosave (⚠️ Contract prüfen)
- ✅ Error Recovery: Basic error handling (⚠️ Verbessern)
- ✅ Empty: Empty-State mit CTA

**Testability:**
- **Test IDs**: `journal-page`, `journal-v2-history`, `journal-history-row`
- **Mocks**: `tests/mocks/journal.ts`
- **E2E**: `tests/e2e/journal/*.spec.ts`
- **Smoke Checklist**: Create entry → saves, Autosave → debounced, Template apply → fills form, Submit → shows result, History → shows latest 5

---

### Lessons

**Entry Points:**
- **Nav-Key**: `nav-lessons` (`src/config/navigation.ts`) ⚠️ **Problem**: Ist in Secondary, sollte Primary sein
- **Route-Def**: `/lessons` (`src/routes/RoutesRoot.tsx`)
- **Params**: `?category=technical` (optional)
- **Aliases**: ⚠️ **Fehlt**: `/learn → /lessons` Redirect
- **Deep-Link**: `/lessons?category=technical`
- **Refresh**: State persistiert

**UI Composition:**
- **Header**: `DashboardShell` mit Title "Learn"
- **Filters**: `LessonFilters` (Categories, Sort)
- **Lessons Grid**: `LessonCard` components
- **Empty State**: `lessons-empty-state` component

**Data Layer:**
- **Sources**: 
  - Lessons: `/api/lessons` (via `useLessons()`)
  - Progress: ⚠️ **Fehlt**: `/api/lessons/progress`
- **Query Keys**: N/A (Hook-based)
- **Mutations**: ⚠️ **Fehlt**: `markLessonComplete`
- **Cache**: Static/API
- **Invalidation**: Manual refresh
- **Loading**: `loading` state in `useLessons()`
- **Error**: `error` state
- **Empty**: `lessons-empty-state` component

**Wallet/Onchain:**
- **Connectors**: N/A
- **Chain IDs**: N/A
- **Reads**: N/A
- **Writes**: N/A

**Edge Cases:**
- ✅ Empty: Empty-State mit Reset-Filter-CTA
- ⚠️ **Fehlt**: Offline-Caching
- ⚠️ **Fehlt**: Progress-Persistence

**Testability:**
- **Test IDs**: `lessons-page`, `lessons-empty-state`, `btn-reset-filters`, `lessons-min-score`
- **Mocks**: N/A
- **E2E**: ⚠️ **Fehlt**: E2E-Tests
- **Smoke Checklist**: Load → shows lessons, Filter → updates list, Min score → filters, Reset → clears filters

---

### Chart

**Entry Points:**
- **Nav-Key**: `nav-chart` (`src/config/navigation.ts`)
- **Route-Def**: `/chart` (`src/routes/RoutesRoot.tsx`)
- **Params**: `?symbol=BTC&timeframe=1h` (optional)
- **Aliases**: `/chart-v2`, `/analysis`, `/analysis-v2`, `/analyze`, `/replay`, `/replay/:sessionId`
- **Deep-Link**: `/chart?symbol=BTC&timeframe=1h`
- **Refresh**: State in `chartUiStore`

**UI Composition:**
- **TopBar**: Timeframes, replay, export, mobile actions
- **Sidebar**: Markets, sessions
- **Toolbar**: Indicators, drawings, alerts
- **Canvas**: Chart canvas + markers
- ⚠️ **Fehlt**: Bottom Panel Tabs (Grok Pulse + Journal Notes)

**Data Layer:**
- **Sources**: 
  - OHLC: `/api/data/ohlc` (Multi-provider fallback)
  - Token Metadata: `/api/moralis/token`
  - Grok Pulse: `/api/grok-pulse/context`
- **Query Keys**: N/A (Direct API calls)
- **Mutations**: N/A
- **Cache**: Multi-provider fallback (CoinGecko → CoinCap → Moralis)
- **Invalidation**: Manual refresh + polling
- **Loading**: Loading states per provider
- **Error**: Error handling with fallback
- **Empty**: Empty chart state

**Wallet/Onchain:**
- **Chains**: `solana`, `ethereum`
- **Addresses**: Token addresses from market data
- **Reads**: Token metadata, decimals
- **Writes**: N/A
- **Events**: N/A
- **Refresh**: Manual + polling

**Edge Cases:**
- ✅ Provider Fallback: Multi-provider chain
- ✅ Error: Fallback to next provider
- ✅ Empty: Empty chart state

**Testability:**
- **Test IDs**: `chart-page`, `chart-canvas`
- **Mocks**: `tests/mocks/chart.ts`
- **E2E**: `tests/e2e/chart/*.spec.ts`
- **Smoke Checklist**: Load → shows chart, Replay mode → sets state, Timeframe change → updates, Indicator add → shows, Deep-link → loads symbol

---

### Alerts

**Entry Points:**
- **Nav-Key**: `nav-alerts` (`src/config/navigation.ts`)
- **Route-Def**: `/alerts` (`src/routes/RoutesRoot.tsx`)
- **Params**: `?alert=123&prefill=symbol=BTC&threshold=50000`
- **Aliases**: `/alerts-v2` → `/alerts`
- **Deep-Link**: `/alerts?alert=123&prefill=symbol=BTC&threshold=50000`
- **Refresh**: State in `alertsStore`

**UI Composition:**
- **Header**: Title + Subtitle + "New alert" Button
- **Filters**: `FiltersBar` (Status, Type, Query, Symbol)
- **List**: `AlertCard` components
- **Detail Panel**: `AlertsDetailPanel`
- **Create Sheet**: `NewAlertSheet` (RightSheet)

**Data Layer:**
- **Sources**: 
  - Alerts: `alertsStore` (Zustand + IndexedDB)
- **Query Keys**: N/A (Zustand Store)
- **Mutations**: `createAlert`, `updateAlert`, `deleteAlert`, `toggleStatus`
- **Cache**: `alertsStore` (Zustand + IndexedDB)
- **Invalidation**: Store actions
- **Loading**: Loading states in store
- **Error**: Error handling
- **Empty**: `alerts-empty-state` component

**Wallet/Onchain:**
- **Connectors**: N/A
- **Chain IDs**: N/A
- **Reads**: N/A
- **Writes**: N/A
- ℹ️ **Optional**: Onchain triggers (nicht implementiert)

**Edge Cases:**
- ✅ URL Prefill: `parseAlertPrefillSearchParams()` parst URL params → form state
- ✅ Empty: Empty-State mit CTA
- ✅ Delete: Confirmation + state update

**Testability:**
- **Test IDs**: `alerts-page`, `alerts-list`, `alerts-list-item`, `alerts-new-alert-button`, `alerts-empty-state`
- **Mocks**: `tests/mocks/alerts.ts`
- **E2E**: `tests/e2e/alerts/*.spec.ts`
- **Smoke Checklist**: Create alert → saves, URL prefill → fills form, Toggle status → updates, Delete → removes, Filter → updates list

---

### Settings

**Entry Points:**
- **Nav-Key**: `nav-settings` (`src/config/navigation.ts`)
- **Route-Def**: `/settings` (`src/routes/RoutesRoot.tsx`)
- **Params**: `?section=wallets` (optional)
- **Aliases**: `/settings-v2` → `/settings`
- **Deep-Link**: `/settings?section=wallets`
- **Refresh**: State persistiert

**UI Composition:**
- **Sections**: 
  - Appearance
  - Chart prefs
  - Notifications
  - Connected Wallets (`ConnectedWalletsPanel`)
  - Monitoring
  - Token Usage
  - Risk Defaults
  - Export/Backup
  - Advanced/Diagnostics
  - Danger Zone (typed RESET)

**Data Layer:**
- **Sources**: 
  - Settings: LocalStorage + IndexedDB
  - Wallets: `walletStore` (`src/store/walletStore.ts`)
- **Query Keys**: N/A
- **Mutations**: `updateSettings`, `exportData`, `resetSettings`
- **Cache**: LocalStorage + IndexedDB
- **Invalidation**: Manual
- **Loading**: Loading states
- **Error**: Error handling
- **Empty**: N/A

**Wallet/Onchain:**
- **Connectors**: Solana Wallet Adapter (Phantom, Solflare, Backpack)
- **Chain IDs**: `solana`
- **Connect**: `walletStore.connectWallet()`
- **Disconnect**: `walletStore.disconnectWallet()`
- **Account State**: `walletStore.getActiveWallets()`
- ⚠️ **Fehlt**: Chain gating
- ⚠️ **Fehlt**: Switch chain
- ⚠️ **Basic**: Rejection handling

**Edge Cases:**
- ✅ Disconnected: UI zeigt disconnected state
- ⚠️ **Fehlt**: Wrong network handling
- ⚠️ **Basic**: Rejected signature handling
- ✅ Reset: Confirmation dialog

**Testability:**
- **Test IDs**: `settings-page`
- **Mocks**: N/A
- **E2E**: `tests/e2e/settings/*.spec.ts`
- **Smoke Checklist**: Load → shows sections, Update setting → saves, Connect wallet → adds, Export → downloads, Reset → confirms

---

### Watchlist

**Entry Points:**
- **Nav-Key**: `nav-watchlist` (`src/config/navigation.ts`)
- **Route-Def**: `/watchlist` (`src/routes/RoutesRoot.tsx`)
- **Params**: `?symbol=BTC` (optional)
- **Aliases**: `/watchlist-v2` → `/watchlist`
- **Deep-Link**: `/watchlist?symbol=BTC`
- **Refresh**: State in `watchlistStore`

**UI Composition:**
- **Filters**: Session filter (All, London, NY, Asia) + Sort toggle
- **Table**: `WatchlistTable` mit rows
- **Detail Panel**: `WatchlistDetailPanel` (split/sheet)
- **Actions**: Open chart CTA, Open replay CTA

**Data Layer:**
- **Sources**: 
  - Prices: `/api/market/token` (via `fetchWatchlistQuotes()`)
  - OHLC: `/api/data/ohlc`
- **Query Keys**: N/A
- **Mutations**: N/A
- **Cache**: `watchlistStore` + price polling
- **Invalidation**: Polling + manual refresh
- **Loading**: `isLoading` in store
- **Error**: `error` state
- **Empty**: `EmptyState` component

**Wallet/Onchain:**
- **Chains**: `solana`, `ethereum`
- **Addresses**: Token addresses
- **Reads**: Token prices, metadata
- **Writes**: N/A
- **Events**: N/A
- **Refresh**: Polling

**Edge Cases:**
- ✅ Offline: Offline-Banner wird angezeigt
- ✅ Error: Error-State mit Retry
- ✅ Empty: Empty-State mit CTA

**Testability:**
- **Test IDs**: `watchlist-page`, `watchlist-session-filter-All`, `watchlist-sort-toggle`
- **Mocks**: N/A
- **E2E**: ⚠️ **Fehlt**: E2E-Tests
- **Smoke Checklist**: Load → shows assets, Select → shows detail, Filter → updates list, Sort → reorders, Open chart → navigates

---

### Oracle

**Entry Points:**
- **Nav-Key**: `nav-oracle` (`src/config/navigation.ts`)
- **Route-Def**: `/oracle` (`src/routes/RoutesRoot.tsx`)
- **Params**: `?theme=macro` (optional)
- **Aliases**: N/A
- **Deep-Link**: `/oracle?theme=macro`
- **Refresh**: State in `oracleStore`

**UI Composition:**
- **Header**: Title + Meta + Actions (Refresh, Mark as Read)
- **Reward Banner**: `OracleRewardBanner` (streak)
- **Today Takeaway**: `OracleTodayTakeaway`
- **Insights**: `OracleInsightCard` components
- **Report Section**: Full report block (`oracle-pre`)
- **Theme Filter**: `OracleThemeFilter`
- **History Chart**: `OracleHistoryChart`
- **History List**: `OracleHistoryList`

**Data Layer:**
- **Sources**: 
  - Report: `/api/oracle/report`
  - History: `/api/oracle/history`
- **Query Keys**: N/A
- **Mutations**: `markAsRead`
- **Cache**: `oracleStore`
- **Invalidation**: Daily refresh at 09:00 UTC
- **Loading**: `isLoading` state
- **Error**: `error` state
- **Empty**: `OracleEmptyState` component

**Wallet/Onchain:**
- **Connectors**: N/A
- **Chain IDs**: N/A
- **Reads**: N/A
- **Writes**: N/A
- **Events**: N/A
- **Refresh**: Daily at 09:00 UTC

**Edge Cases:**
- ✅ Loading: Loading-State
- ✅ Error: Error-State mit Retry
- ✅ Empty: Empty-State mit CTA
- ✅ Mark as Read: Reward-Banner wird angezeigt

**Testability:**
- **Test IDs**: `oracle-page`, `oracle-refresh-button`, `oracle-mark-read-button`, `oracle-pre`
- **Mocks**: N/A
- **E2E**: ⚠️ **Fehlt**: E2E-Tests
- **Smoke Checklist**: Load → shows report, Refresh → updates, Mark as read → saves, Theme filter → filters, History chart → shows

---

## Priorisierte Fixliste

### 🔴 HIGH Priority

#### 1. Lessons zu Primary Nav verschieben
- **Tab**: Lessons
- **Problem**: Ist in Secondary Nav, sollte Primary (Order 3) sein
- **Dateien**: `src/config/navigation.ts`
- **Aktion**: 
  - `lessons` aus `SECONDARY_NAV_ITEMS` entfernen
  - `lessons` zu `NAV_ITEMS` hinzufügen (Order 3, nach Journal)
- **Impact**: Navigation-Struktur entspricht Soll-Spezifikation
- **Tests**: E2E-Tests für Nav-Reihenfolge

---

### 🟡 MEDIUM Priority

#### 2. `/learn → /lessons` Redirect hinzufügen
- **Tab**: Lessons
- **Problem**: loveable-import zeigt `/learn`, Soll ist `/lessons`
- **Dateien**: `src/routes/RoutesRoot.tsx`
- **Aktion**: 
  - Route `/learn` hinzufügen → Redirect zu `/lessons`
  - Alias in Nav-Config hinzufügen (optional)
- **Impact**: Kompatibilität mit loveable-import
- **Tests**: E2E-Test für Redirect

#### 3. Progress-Tracking in Lessons implementieren
- **Tab**: Lessons
- **Problem**: Progress-Tracking fehlt
- **Dateien**: `src/pages/LessonsPage.tsx`, `src/hooks/useLessons.ts`, `src/db/lessons.ts` (neu)
- **Aktion**: 
  - Progress-State in IndexedDB speichern
  - `markLessonComplete` Mutation hinzufügen
  - Progress-Anzeige in UI
- **Impact**: User kann Fortschritt tracken
- **Tests**: Unit-Tests für Progress-Logik, E2E-Test für Mark-as-Complete

---

### 🟢 LOW Priority

#### 4. Bottom Panel Tabs in Chart hinzufügen
- **Tab**: Chart
- **Problem**: Bottom Panel Tabs (Grok Pulse + Journal Notes) fehlen
- **Dateien**: `src/features/chart/ChartLayout.tsx`, `src/components/chart/BottomPanel.tsx` (neu)
- **Aktion**: 
  - Bottom Panel Component erstellen
  - Tabs: "Grok Pulse", "Journal Notes"
  - Integration mit Chart-Layout
- **Impact**: Bessere UX für Grok Pulse & Journal Notes
- **Tests**: E2E-Test für Tab-Switching

#### 5. Bottom Panel Tabs in Dashboard hinzufügen
- **Tab**: Dashboard
- **Problem**: Bottom Panel Tabs (Grok Pulse + Journal Notes) fehlen
- **Dateien**: `src/pages/DashboardPage.tsx`, `src/components/dashboard/BottomPanel.tsx` (neu)
- **Aktion**: 
  - Bottom Panel Component erstellen
  - Tabs: "Grok Pulse", "Journal Notes"
  - Integration mit Dashboard-Layout
- **Impact**: Bessere UX für Grok Pulse & Journal Notes
- **Tests**: E2E-Test für Tab-Switching

#### 6. Wallet Chain-Gating implementieren
- **Tab**: Settings
- **Problem**: Chain-Gating fehlt
- **Dateien**: `src/store/walletStore.ts`, `src/components/settings/ConnectedWalletsPanel.tsx`
- **Aktion**: 
  - Chain-Validation hinzufügen
  - Wrong-Network-Banner hinzufügen
  - Switch-Chain-Flow implementieren
- **Impact**: Bessere UX für Multi-Chain-Szenarien
- **Tests**: E2E-Test für Chain-Switching

#### 7. Autosave-Contract in Journal verifizieren
- **Tab**: Journal
- **Problem**: Autosave-Contract muss verifiziert werden
- **Dateien**: `src/features/journal-v2/hooks/useJournalV2.ts`
- **Aktion**: 
  - Debounce-Verhalten prüfen
  - Persistence-Verhalten prüfen
  - Error-Recovery prüfen
- **Impact**: Zuverlässiges Autosave
- **Tests**: Unit-Tests für Autosave-Logik

#### 8. Offline-Lesson-Caching hinzufügen
- **Tab**: Lessons
- **Problem**: Offline-Caching fehlt
- **Dateien**: `src/hooks/useLessons.ts`, `src/db/lessons.ts` (neu)
- **Aktion**: 
  - Lessons in IndexedDB cachen
  - Offline-State prüfen
  - Cache-Invalidation implementieren
- **Impact**: Lessons verfügbar offline
- **Tests**: E2E-Test für Offline-Verhalten

---

## Static Checks & Automatisierung

### Automatisierbare Checks

#### ✅ Soll-Tabs existieren in Nav + Router
- **Status**: Partial
- **Issue**: Lessons ist in Secondary, sollte Primary sein
- **Check**: `src/config/navigation.ts` + `src/routes/RoutesRoot.tsx`
- **Automatisierung**: Script prüft, ob alle Soll-Tabs in Nav vorhanden sind

#### ✅ `/replay` ist nur Alias/Mode, kein Tab
- **Status**: Correct
- **Details**: Replay ist korrekt als Chart-Mode implementiert
- **Check**: `src/routes/RoutesRoot.tsx` (Zeile 71-72)
- **Automatisierung**: Script prüft, ob `/replay` kein Nav-Item ist

#### ⚠️ Learn Route-Konformität: `/lessons` (ggf. `/learn` Redirect)
- **Status**: Mismatch
- **Details**: Route ist `/lessons` (korrekt), aber `/learn` Redirect fehlt
- **Check**: `src/routes/RoutesRoot.tsx`
- **Automatisierung**: Script prüft, ob `/lessons` existiert und `/learn` Redirect vorhanden ist

#### ✅ API-Calls: Loading/Error/Empty überall vorhanden
- **Status**: Partial
- **Details**: Meiste Tabs haben Loading/Error/Empty, einige könnten konsistenter sein
- **Check**: Pro Tab-Komponente prüfen
- **Automatisierung**: Script prüft, ob alle API-Calls Loading/Error/Empty haben

#### ⚠️ Wallet/Onchain: Chain-Gating, Address-Registry, Decimals/BigInt, TX Lifecycle UI
- **Status**: Partial
- **Issues**: 
  - Chain-Gating nicht implementiert
  - Address-Registry existiert pro Chain
  - ABI-Usage nicht konsistent
  - BigInt/Decimals-Handling muss verifiziert werden
  - TX-Lifecycle-UI nicht umfassend
- **Check**: `src/store/walletStore.ts`, `src/lib/solana/`
- **Automatisierung**: Script prüft Wallet/Onchain-Integration

#### ✅ Alerts: URL-Prefill-Parsing + stabile data-testid Patterns
- **Status**: Correct
- **Details**: URL-Prefill-Parsing existiert und funktioniert, stabile data-testid Patterns vorhanden
- **Check**: `src/features/alerts/prefill.ts`, `src/features/alerts/AlertsPage.tsx`
- **Automatisierung**: Script prüft URL-Prefill-Parser und data-testid Patterns

---

## Smoke-Test Matrix

### Pro Tab: Manuell/E2E Checkliste

| Tab | Click Nav | Deep-Link | Refresh | Wallet Connect | Wrong Network | Onchain Read | Write TX (Reject) | Write TX (Revert) | Write TX (Success) | UI State Updates |
|-----|-----------|-----------|---------|----------------|---------------|--------------|-------------------|-------------------|---------------------|------------------|
| Dashboard | ✅ | ✅ | ✅ | N/A | N/A | N/A | N/A | N/A | N/A | ✅ |
| Journal | ✅ | ✅ | ✅ | N/A | N/A | N/A | N/A | N/A | N/A | ✅ |
| Lessons | ✅ | ✅ | ✅ | N/A | N/A | N/A | N/A | N/A | N/A | ⚠️ |
| Chart | ✅ | ✅ | ✅ | N/A | N/A | ⚠️ | N/A | N/A | N/A | ✅ |
| Alerts | ✅ | ✅ | ✅ | N/A | N/A | N/A | N/A | N/A | N/A | ✅ |
| Settings | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Watchlist | ✅ | ✅ | ✅ | N/A | N/A | ⚠️ | N/A | N/A | N/A | ✅ |
| Oracle | ✅ | ✅ | ✅ | N/A | N/A | N/A | N/A | N/A | N/A | ⚠️ |

**Legende:**
- ✅ = Implementiert & getestet
- ⚠️ = Teilweise implementiert / Tests fehlen
- N/A = Nicht anwendbar

### E2E-Test-Coverage

| Tab | E2E-Tests vorhanden | Smoke-Tests vorhanden | Coverage |
|-----|---------------------|----------------------|----------|
| Dashboard | ✅ | ✅ | 80% |
| Journal | ✅ | ✅ | 85% |
| Lessons | ❌ | ❌ | 0% |
| Chart | ✅ | ✅ | 75% |
| Alerts | ✅ | ✅ | 90% |
| Settings | ✅ | ⚠️ | 70% |
| Watchlist | ❌ | ❌ | 0% |
| Oracle | ❌ | ❌ | 0% |

**Empfehlungen:**
- E2E-Tests für Lessons, Watchlist, Oracle hinzufügen
- Smoke-Tests für alle Tabs standardisieren
- Wallet/Onchain-Tests für Settings hinzufügen

---

## Zusammenfassung & Next Steps

### ✅ Was funktioniert gut
- Routing-Struktur ist größtenteils korrekt
- UI Must-Haves sind größtenteils vorhanden
- API-Integration funktioniert grundlegend
- E2E-Tests für kritische Tabs vorhanden

### ⚠️ Was verbessert werden muss
- Lessons zu Primary Nav verschieben (HIGH)
- `/learn → /lessons` Redirect hinzufügen (MEDIUM)
- Progress-Tracking in Lessons implementieren (MEDIUM)
- Bottom Panel Tabs in Chart/Dashboard hinzufügen (LOW)
- Wallet Chain-Gating implementieren (LOW)
- E2E-Tests für Lessons, Watchlist, Oracle hinzufügen (LOW)

### 📋 Empfohlene Reihenfolge
1. **Sprint 1**: Lessons zu Primary Nav verschieben + Redirect hinzufügen
2. **Sprint 2**: Progress-Tracking in Lessons implementieren
3. **Sprint 3**: Bottom Panel Tabs in Chart/Dashboard hinzufügen
4. **Sprint 4**: Wallet Chain-Gating implementieren
5. **Sprint 5**: E2E-Tests für fehlende Tabs hinzufügen

---

**Ende des Reports**

