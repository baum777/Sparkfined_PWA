---
title: "Dokumentationsinventar"
summary: "Zuordnung der Alt-Dokumente zu den vier Zielkategorien inkl. neuer Pfade."
sources:
  - docs/pwa-audit/meta/categorization.csv
  - docs/process/product-overview.md
  - docs/process/onboarding-blueprint.md
  - docs/concepts/journal-system.md
  - docs/concepts/signal-orchestrator.md
  - docs/concepts/ai-roadmap.md
  - docs/guides/access-tabs.md
  - docs/setup/environment-and-providers.md
  - docs/setup/build-and-deploy.md
---

| Original | Kategorie | Kurzbeschreibung | Aktion | Neuer Pfad |
| --- | --- | --- | --- | --- |
| `docs/archive/raw/2025-11-12/PROJEKT_ÜBERSICHT.md`, `docs/archive/raw/2025-11-12/REPO_STRUKTURPLAN_2025.md` | Process | Projektvision, Feature-Matrix, Architektur-Layer | Inhalte konsolidiert | `docs/process/product-overview.md` |
| `docs/archive/raw/2025-11-12/ONBOARDING_STRATEGY.md`, `docs/archive/raw/2025-11-12/ONBOARDING_IMPLEMENTATION_COMPLETE.md`, `docs/archive/raw/2025-11-12/ONBOARDING_QUICK_START.md` | Process | Persona-basierte Einführung, Komponenten & Snippets | Inhalte konsolidiert | `docs/process/onboarding-blueprint.md` |
| `docs/archive/raw/2025-11-12/JOURNAL_SPECIFICATION.md` | Concepts | Journal-Datenmodell & Komponenten | Zusammengefasst | `docs/concepts/journal-system.md` |
| `docs/archive/raw/2025-11-12/SIGNAL_ORCHESTRATOR_INTEGRATION.md`, `docs/archive/raw/2025-11-12/SIGNAL_ORCHESTRATOR_USE_CASE.md`, `docs/archive/raw/2025-11-12/SIGNAL_ORCHESTRATOR_EXAMPLE.json`, `docs/archive/raw/2025-11-12/SIGNAL_UI_INTEGRATION.md` | Concepts | Signal-Pipeline, Action Graph, UI | Inhalte konsolidiert | `docs/concepts/signal-orchestrator.md` |
| `docs/archive/raw/2025-11-12/CORTEX_INTEGRATION_PLAN.md`, `docs/archive/raw/2025-11-12/ENV_USAGE_OVERVIEW.md` | Concepts | AI- & Cortex-Features, Env-Verwendung | Zusammengefasst | `docs/concepts/ai-roadmap.md` |
| `docs/archive/raw/2025-11-12/ACCESS_PAGE_TAB_IMPROVEMENTS.md` | Guides | Access-Tab UX & Tests | Inhalte konsolidiert | `docs/guides/access-tabs.md` |
| `docs/archive/raw/2025-11-12/API_KEYS.md`, `docs/archive/raw/2025-11-12/ENVIRONMENT_VARIABLES.md`, `docs/archive/raw/2025-11-12/SETUP_DEXPAPRIKA_MORALIS.md`, `docs/archive/raw/2025-11-12/DEXPAPRIKA_MORALIS_CHECKLIST.md` | Setup | Environment & Datenprovider | Inhalte konsolidiert | `docs/setup/environment-and-providers.md` |
| `docs/archive/raw/2025-11-12/BUILD_SCRIPTS_EXPLAINED.md`, `docs/archive/raw/2025-11-12/DEPLOY_GUIDE.md`, `docs/archive/raw/2025-11-12/DEPLOY_CHECKLIST.md` | Setup | Build-/Deploy-Skripte & QA | Inhalte konsolidiert | `docs/setup/build-and-deploy.md` |
| `docs/pwa-audit/*` | Process | Audit-Artefakte (Inventar, Features, Flows etc.) | Neu erstellt | `docs/pwa-audit/` |

Archivierte Originale liegen unter `docs/archive/raw/2025-11-12/`. Weitere unveränderte Dateien (z. B. `docs/README.md`, `docs/lore/`) behalten ihren bestehenden Platz und sind für zukünftige Konsolidierung markiert (`Kategorie E`).


---

## 📦 Neue Ergänzungen (2026-01-17)

- **New Alert Sheet (WP-072):** Alerts page now opens a dedicated new alert sheet with symbol autocomplete, threshold/direction builder, inline validation, and mock-backed create support across `src/features/alerts/NewAlertSheet.tsx`, `src/features/alerts/SymbolAutocomplete.tsx`, `src/features/alerts/AlertsPage.tsx`, `src/api/alerts.ts`, and `src/features/alerts/alerts.css`; Checklist-Link: `WP-Polish/WP-072/checklist.md`.

## 📦 Neue Ergänzungen (2026-01-16)

- **Alert Card Design & Actions (WP-071):** Alerts list now renders a dedicated AlertCard with status pill, condition summary, and pause/resume + delete actions wired to optimistic mock APIs (`src/features/alerts/AlertCard.tsx`, `src/features/alerts/AlertsPage.tsx`, `src/api/alerts.ts`, `src/features/alerts/alerts.css`); Checklist-Link: `WP-Polish/WP-071/checklist.md`.

## 📦 Neue Ergänzungen (2026-01-15)

- **Alerts Desktop Layout (WP-070):** New alerts feature scaffold with tokenized desktop filters + list layout, mock-backed loading/empty/error states, and the route wiring in `src/features/alerts/AlertsPage.tsx`, `src/features/alerts/FiltersBar.tsx`, `src/features/alerts/alerts.css`, and `src/pages/AlertsPage.tsx`; Checklist-Link: `WP-Polish/WP-070/checklist.md`.

## 📦 Neue Ergänzungen (2026-01-14)

- **Mobile Chart UX Controls (WP-056):** Mobile chart route now exposes floating “Sidebar”/“Tools” actions that open the existing BottomSheet/RightSheet surfaces, hides redundant top-bar mobile triggers under 768px, and pads the chart layout against bottom-nav safe-area overlap (`src/features/chart/MobileChartControls.tsx`, `src/features/chart/ChartLayout.tsx`, `src/features/chart/chart.css`, `tests/components/chart/MobileChartControls.test.tsx`); Checklist-Link: `WP-Polish/WP-056/checklist.md`.

## 📦 Neue Ergänzungen (2026-01-13)

- **Default Chart + Fallback (WP-055):** Chart route now resolves missing symbol/timeframe to SOL/USDC + 1h, routes candle loading through the typed `marketData` client with deterministic mock fallback, and surfaces retry actions for empty/error chart states (`src/api/marketData.ts`, `src/features/chart/ChartLayout.tsx`, `src/features/chart/ChartCanvas.tsx`, `src/hooks/useOhlcData.ts`); Checklist-Link: `WP-Polish/WP-055/checklist.md`.

## 📦 Neue Ergänzungen (2026-01-12)

- **Replay Controls + Export (WP-054):** Chart top bar now includes a replay toggle, speed controls, and an interaction-lazy export action that downloads a JSON stub (symbol/timeframe/replay state) via `src/features/chart/ChartTopBar.tsx`, `src/features/chart/replay.ts`, `src/features/chart/chartExport.ts`, plus tokenized styles in `src/features/chart/chart.css`; Checklist-Link: `WP-Polish/WP-054/checklist.md`.

## 📦 Neue Ergänzungen (2026-01-11)

- **Chart Bottom Panel (WP-053):** Bottom-panel tabs now surface a Grok Pulse mock card and inline Journal Notes with local draft persistence keyed by symbol/timeframe, wired in `src/features/chart/ChartBottomPanel.tsx`, `src/features/chart/GrokPulseCard.tsx`, `src/features/chart/InlineJournalNotes.tsx`, plus tokenized styles in `src/features/chart/chart.css`; Checklist-Link: `WP-Polish/WP-053/checklist.md`.

## 📦 Neue Ergänzungen (2026-01-10)

- **Right Toolbar Tool Hub (WP-052):** Chart-Toolbar now uses expandable sections for indicators, drawings, and alerts, with lazy alerts list fetch via `getAlertsList` (`src/api/alerts.ts`), create-alert sheet reuse (`src/components/alerts/AlertCreateDialog.tsx`), and tokenized styling in `src/features/chart/chart.css`, `src/features/chart/ChartToolbar.tsx`, and `src/features/chart/toolbar-sections.tsx`; Checklist-Link: `WP-Polish/WP-052/checklist.md`.

## 📦 Neue Ergänzungen (2026-01-09)

- **Main Chart Area (WP-051):** Chart-Seite mountet `ChartCanvas` mit lazy geladenem `AdvancedChart` (route-only), minimaler URL-Param-Sync für `address/timeframe` sowie Journal-Marker aus Mock-Entries (`src/features/chart/ChartCanvas.tsx`, `src/features/chart/markers.ts`, `src/features/chart/ChartLayout.tsx`); Checklist-Link: `WP-Polish/WP-051/checklist.md`.

## 📦 Neue Ergänzungen (2026-01-08)

- **Chart Foundation Shell (WP-050):** Chart-Seite nutzt jetzt ein eigenes Shell-Layout mit Topbar, Sidebar, Toolbar und Bottom Panel (`src/features/chart/ChartLayout.tsx`, `src/features/chart/ChartTopBar.tsx`, `src/features/chart/ChartSidebar.tsx`, `src/features/chart/ChartToolbar.tsx`, `src/features/chart/ChartBottomPanel.tsx`) sowie tokenisierte Layout-Styles in `src/features/chart/chart.css`; Checklist-Link: `WP-Polish/WP-050/checklist.md`.

## 📦 Neue Ergänzungen (2026-01-07)

- **Journal Workflow (WP-035):** Autosave hook (`src/features/journal/useAutoSave.ts`) with inline status on the V2 form, required reasoning/expectation validation, template-applied drafts that trigger immediate saves, expectation autocomplete input, and a stubbed `NewTradeModal` placeholder; Checklist-Link: `WP-Polish/WP-035/checklist.md`.

## 📦 Neue Ergänzungen (2026-01-06)

- **Mobile Journal Bottom Sheet (WP-034):** Neues `BottomSheet`-Primitive (`src/shared/components/BottomSheet.tsx`) und ein `TemplateBottomSheet` für mobile Template-Auswahl (`src/features/journal/TemplateBottomSheet.tsx`) triggerbar über die Journal-Insights-Karte (`src/features/journal/JournalCard.tsx`). Templates werden direkt in den aktiven V2-Formularzustand injiziert (`src/features/journal-v2/components/JournalInputForm.tsx`, `src/features/journal/JournalForm.tsx`, `src/pages/JournalPage.tsx`) mit tokenisierten Mobile-Spacings in `src/features/journal/journal.css`; Checklist-Link: `WP-Polish/WP-034/checklist.md`.

## 📦 Neue Ergänzungen (2026-01-05)

- **Trade Thesis (WP-033):** Neue TradeThesisCard mit TagInput, Screenshot-Stubs und AI-Notizen (deterministischer Mock) über `src/features/journal/TradeThesisCard.tsx`, `src/features/journal/TagInput.tsx`, `src/features/journal/AINotesGenerator.tsx`, verdrahtet im V2-Formular `src/features/journal-v2/components/JournalInputForm.tsx` und gestylt in `src/features/journal/journal.css`; Checklist-Link: `WP-Polish/WP-033/checklist.md`.

## 📦 Neue Ergänzungen (2026-01-04)

- **Market Context Accordion (WP-032):** Neues optionales Marktregime-Accordion mit Desktop-Dropdown und mobilen Horizontal-Pills (`src/features/journal/MarketContextAccordion.tsx`, `src/features/journal/MarketRegimeSelector.tsx`) plus tokenisierte Styles in `src/features/journal/journal.css`, eingebunden in `src/features/journal-v2/components/JournalInputForm.tsx`; Checklist-Link: `WP-Polish/WP-032/checklist.md`.

## 📦 Neue Ergänzungen (2026-01-03)

- **Emotional State (WP-031):** EmojiSelector + GradientSlider-basierte EmotionalStateCard mit Advanced-Toggle für Conviction/Pattern-Slider, eingebunden in `src/features/journal-v2/components/JournalInputForm.tsx` und gestylt über `src/features/journal/journal.css`; Checklist-Link: `WP-Polish/WP-031/checklist.md`.

## 📦 Neue Ergänzungen (2025-12-31)

- **Quick Actions FAB (WP-016):** Mobile-only Floating Action Button anchored above the BottomNav safe-area via `src/features/dashboard/FAB.tsx`, `src/features/dashboard/FABMenu.tsx`, and `src/features/dashboard/fab.css`, wired in `src/pages/DashboardPage.tsx` to open the trade log overlay (`LogEntryOverlayPanel`) and the alert creation sheet (`AlertCreateDialog`); Checklist-Link: `WP-Polish/WP-016/checklist.md`.

## 📦 Neue Ergänzungen (2025-12-30)

- **Recent Entries + Alerts Overview (WP-015):** Bottom dashboard section combining `RecentEntriesSection` (responsive grid/horizontal scroll with loading/error/empty states, `src/features/dashboard/RecentEntriesSection.tsx`, `src/features/dashboard/recent-entries.css`) and `AlertsOverviewWidget` (armed/triggered/paused stats with CTA, `src/features/dashboard/AlertsOverviewWidget.tsx`, `src/features/dashboard/alerts-overview.css`) backed by typed mock APIs `getRecentJournalEntries`/`getAlertsOverview`, wired into `src/pages/DashboardPage.tsx`; Checklist-Link: `WP-Polish/WP-015/checklist.md`.

## 📦 Neue Ergänzungen (2025-12-29)

- **Recent Trades (WP-014):** Neues `getRecentTrades`-DTO mit deterministischem Mock (`src/api/journalEntries.ts`), tokenisierte `TradeLogCard`/`TradeLogEntry` mit Loading/Error/Empty-Zuständen und Load-more, BUY-Signal-abhängiger "Log entry"-CTA über `useLogEntryAvailability` (`src/features/journal/useLogEntryAvailability.ts`) und Overlay-Öffnung im Dashboard (`src/pages/DashboardPage.tsx`); Checklist-Link: `WP-Polish/WP-014/checklist.md`.

## 📦 Neue Ergänzungen (2025-12-28)

- **Holdings Snapshot Card (WP-013):** Neues Wallet-Holdings-API-DTO mit deterministischem Mock (`src/api/wallet.ts`) und eine responsive `HoldingsCard` mit Not-Connected/Loading/Error/Empty/Loaded-Zuständen und Watchlist-Navigation pro Zeile (`src/features/dashboard/HoldingsCard.tsx`, `src/features/dashboard/holdings-card.css`), verdrahtet in `src/pages/DashboardPage.tsx`; Checklist-Link: `WP-Polish/WP-013/checklist.md`.

## 📦 Neue Ergänzungen (2025-12-27)

- **Daily Bias / Market Intel (WP-012):** Neues Dashboard-Intel-Carding mit getDailyBias-Mock/DTO (`src/api/marketIntelligence.ts`), BiasTag (`src/features/dashboard/BiasTag.tsx`), dem refreshbaren DailyBiasCard UI (`src/features/dashboard/DailyBiasCard.tsx`), und der Einbindung in `src/pages/DashboardPage.tsx`; Checklist-Link: `WP-Polish/WP-012/checklist.md`.

## 📦 Neue Ergänzungen (2025-12-26)

- **Hero KPI Bar (WP-011):** Sticky KPI rail beneath the dashboard header with tokenized KPICard/KPIBar components (`src/features/dashboard/KPIBar.tsx`, `src/features/dashboard/KPICard.tsx`, `src/features/dashboard/kpi.css`) wired into `src/pages/DashboardPage.tsx`; mobile scroll-snap + desktop sticky offset captured in `WP-Polish/WP-011/checklist.md`.

## 📦 Neue Ergänzungen (2025-12-24)

- **Dashboard Foundation (WP-010):** Neue Dashboard-Primitives (`src/features/dashboard/dashboard.css`) für tokenisierte Kartenflächen, konsistente Typografie und responsive Grids/Splits wurden in `src/pages/DashboardPage.tsx` verdrahtet; KPI-Bar, Holdings/Trade/Journal/Alerts-Karten respektieren nun die gemeinsamen Layout-/Scroll-Helfer.

---

## 📦 Neue Ergänzungen (2025-12-23)

- **Header Top Bar (WP-004):** Sticky shell header now surfaces the current route title with desktop actions for alerts (badge), settings, and the theme toggle, plus a minimal mobile cluster (settings + theme). Implemented at `src/features/shell/TopBar.tsx` with styling in `src/features/shell/top-bar.css` and wired through `src/components/layout/AppShell.tsx`.

## 📦 Neue Ergänzungen (2025-12-22)

- **Desktop Sidebar (WP-003):** Neue linke Navigationsschiene für ≥768px mit dem kanonischen `NAV_ITEMS`-Ordering, hervorgehobenen aktiven States via `--sf-primary`, angepinnter Settings-Kachel am Fuß und Hover/Focus-Tooltips für den kompakten Rail (`src/features/shell/Sidebar.tsx`, `src/features/shell/sidebar.css`, `src/components/layout/AppShell.tsx`).

## 📦 Neue Ergänzungen (2026-01-02)

- **Journal Foundation (WP-030):** Journal-Seite nutzt jetzt einen tokenisierten Shell-Rahmen (`src/features/journal/journal.css`) mit `JournalForm`/`JournalCard`-Wrappern rund um die V2-Komponenten. Score-Töne sind auf `--sf-success/warning/danger` normalisiert, und ein ergänzender Page-Test prüft Shell-Klasse + Score-Styling (`tests/pages/JournalPage.test.tsx`). Checklist-Link: `WP-Polish/WP-030/checklist.md`.

## 📦 Neue Ergänzungen (2025-12-21)

- **Theme System (WP-002):** Dunkelmodus als Standard mit neuem `ThemeProvider`/`useTheme` unter `src/features/theme/`, Persistenz über den Settings-Store und das Legacy-LocalStorage-Flag. Globale Token-Definitionen liegen in `src/styles/theme.css`, Utilities (Card, Spacing, Focus-Ring) in `src/styles/ui.css` und werden in `src/App.tsx` eingebunden.

## 📦 Neue Ergänzungen (2025-12-20)

- **Working Paper Relocation:** Das UI & UX Polish Working Paper liegt jetzt kanonisch unter `tasks/WP-polish/UI_&_UX_polish.md`; im Repo-Root bleibt eine Stub-Datei für bestehende Bookmarks, und das neue Ordner-Target `WP-Polish/` ist für PR-Artefakte vorbereitet.
- **Bottom Navigation Shell:** Die mobile Navigationsleiste wurde in `src/features/shell/BottomNavBar.tsx` + `src/features/shell/bottom-nav.css` überführt und im AppShell als `<BottomNavBar />` verdrahtet; der Layout-Export `src/components/layout/BottomNav.tsx` reexportiert die neue Implementierung.

---

## 📦 Neue Ergänzungen (2025-12-19)

- **Mobile Bottom Navigation (WP-001):** Einheitliche Navigationskonfiguration (`src/config/navigation.ts`) speist BottomNav, Rail und Topbar. Die mobile Leiste zeigt fünf Tabs (Dashboard, Journal, Chart, Watchlist, Alerts) mit Safe-Area-Polsterung und wird ab `md` ausgeblendet (`src/features/shell/BottomNavBar.tsx`, `src/components/layout/BottomNav.tsx`, `src/components/layout/Rail.tsx`, `src/components/layout/Topbar.tsx`, `src/styles/index.css`).

---

## 📦 Neue Ergänzungen (2025-12-18)

- **Drawing Overlay Core (CH-TA-1):** Added Dexie `chart_drawings` table with helpers (`listDrawings`, `saveDrawing`, `deleteDrawing`, `clearDrawings`) and mounted `DrawingOverlay` canvas above `AdvancedChart` to render stored HLINE/LINE/BOX/FIB stubs. Documented in [docs/architecture/Chart_System.md](architecture/Chart_System.md).
- **Drawing Overlay Interaction (CH-TA-2):** Introduced hit-testing with DPR-aware tolerance, single-select highlighting, and a view/select mode toggle to keep the overlay read-only by default while enabling selection when needed. Documented in [docs/architecture/Chart_System.md](architecture/Chart_System.md).
- **Drawing Lifecycle (CH-TA-3):** Added create/edit/delete/undo flows with draft previews, handle-based resize/move, keyboard shortcuts (ESC cancel, Delete, Ctrl/Cmd+Z/Shift+Z), and Dexie-backed persistence for Line/Box drawings. Documented in [docs/architecture/Chart_System.md](architecture/Chart_System.md).
- **Fib + Channel Drawings (CH-TA-4):** Added creation/editing for Fib retracements (default levels) and parallel channels (three-point flow with fill), extended hit-testing/handles/history, and stabilized Playwright webServer startup. Documented in [docs/architecture/Chart_System.md](architecture/Chart_System.md).

---

## 📦 Neue Ergänzungen (2025-12-17)

- **Chart Indicators:** SMA/EMA/Bollinger computations hardened (seeded EMA, short-series safe) with toolbar parameter controls for length/stddev. Relevant code in `src/lib/indicators.ts` and `src/pages/ChartPage.tsx`.

---

## 📦 Neue Ergänzungen (2025-12-16)

- **UI Redesign Taskboard:** Neues Verzeichnis [`tasks/ui-redesign/`](../tasks/ui-redesign/00-PLAN.md) mit neun Phasen-Dateien (00–08) für Foundation, App Shell, Dashboard, Chart, Journal, Alerts, Settings und A11y-Polish, inklusive Route-Inventur und Akzeptanzkriterien für den Sparkfined-Terminal-Refresh.
- **UI Redesign Foundation:** [`docs/process/ui-redesign-foundation.md`](process/ui-redesign-foundation.md) dokumentiert die Routeninventur (Phase 00) und die neuen Foundation-Primitives (Container, PageHeader, SectionNav, ListRow, KpiTile, MetricCard, InlineBanner, FormRow, RightSheet/Modal-Fokusfallen, Badge-Varianten).
- **Dashboard Log Entry Drawer:** `src/pages/DashboardPage.tsx` bindet den neuen `LogEntryOverlayPanel` ein, zeigt Badge-Counts für unbelegte BUY-Events (`trade_events`) und öffnet die Journal-V2-Bridge mit CTA.
- **Journal Trade Context & Confirmation:** `JournalInputForm` akzeptiert `tradeContext`-Payloads (txHash, walletId, timestamp, amounts/pair) zur Prefill-Logik und `confirmTradeFromContext` markiert Events als consumed und hebt `trade_logs` von shadow→confirmed an (txHash-first, Zeitfenster-Fallback, create-on-miss) plus `txHash`-Index in `trade_logs`.

---

## 📦 Neue Ergänzungen (2025-12-15)

- **On-chain Trade Events (Solana):** `trade_events` Dexie-Store mit dedupliziertem `saveTradeEvents`-Helper und Queries für unbelegte BUY-Swaps. Dokumentiert in [docs/events/index.md](events/index.md).
- **Moralis Wallet Swaps Provider:** Solana-Gateway-Client (`fetchWalletSwaps`) inklusive Normalisierung auf `NormalizedTradeEvent` (BUY/SELL, null-safe Amount/Price/Symbol/Mints) für das Trade-Events-Pipeline-Setup. Dokumentiert in [docs/events/index.md](events/index.md).
- **Trade Event Watcher (T1-C):** Moralis-basiertes Polling über alle verbundenen Wallets mit Backoff (429/Netzfehler), BUY-Filter und deduplizierter Persistenz über `tradeEventWatcher.ts`. Dokumentiert in [docs/events/index.md](events/index.md).

---

## 📦 Neue Ergänzungen (2025-12-03)

### Rulesync & AI Agent Setup
- **`.rulesync/rules/overview.md`** - Globale AI-Guardrails und Projektübersicht
- **`.rulesync/rules/journal-system.md`** - Journal-Domain spezifische Regeln
- **`.rulesync/.aiignore`** - AI-Kontext Ausschluss-Muster
- **`.rulesync/HANDOVER.md`** - Setup-Anleitung für Rulesync
- **`rulesync.jsonc`** - Rulesync Hauptkonfiguration

### Aus Root verschobene Dokumente
| Original (Root) | Neue Location | Kategorie |
|-----------------|---------------|-----------|
| `BUNDLE-OPTIMIZATION-PLAN.md` | `docs/process/` | Process |
| `BUNDLE-OPTIMIZATION-RESULT.md` | `docs/process/` | Process |
| `BUNDLE-SIZE-FINAL-SUMMARY.md` | `docs/process/` | Process |
| `STYLING-UPDATES.md` | `docs/design/` | Design |
| `UX-IMPROVEMENTS-SUMMARY.md` | `docs/design/` | Design |
| `UX-TEST-STATUS.md` | `docs/qa/` | QA |
| `sparkfined-style-guide.html` | `docs/design/` | Design |

---

## 📦 Neue Ergänzungen (2025-12-06)

- **`docs/journal/journal-v2-migration.md`** – Leitfaden zur Migration der Legacy-Journal-Einträge in die neue Journal-2.0-Pipeline (Dexie, Pipeline-Aufruf, manueller Trigger).

## 📦 Neue Ergänzungen (2025-12-12)

 - **`docs/architecture/ai-cache-layer.md`** – Basis-Abstraktion, Key-Schema, TTL-Defaults und Orchestrator-Integration (AC1-AC3).

## 📦 Documentation Governance (2025-12-04)

### Governance Audit & Rules
- **`docs/CHANGELOG.md`** - Documentation change tracking (NEW - required for all doc changes)
- **`docs/process/DOCS-GOVERNANCE-AUDIT.md`** - Full audit of repo structure vs. proposed 7×7 rules
- **`docs/process/DOCS-GOVERNANCE-FAZIT.md`** - German summary with actionable recommendations

### Key Findings
- ✅ **Root is clean** - Only README.md, AGENTS.md, CLAUDE.md (compliant)
- ❌ **`/docs` exceeds 7×7 rule** - 16 folders instead of 7, multiple folders with >7 files
- ⚠️ **Action needed** - See FAZIT for consolidation plan (16 folders → 7 folders)

### Proposed 7-Folder Structure
1. `01_architecture/` - System design, API landscape, PWA audit
2. `02_concepts/` - Journal, Oracle, AI roadmap, design tokens
3. `03_specs/` - Tickets, bugs, feature specs
4. `04_process/` - CI/CD, QA, workflows, lint rules
5. `05_guides/` - Setup, deployment, onboarding
6. `06_decisions/` - Lore, ADRs, metrics, pitch deck
7. `07_archive/` - Historical docs, obsolete files

---

## 🎨 Design System Documentation (2025-12-04)

### Design System Files
- **`docs/design/DESIGN_SYSTEM.md`** (36K) - Complete design specification with colors, typography, spacing, animations, gestures, and component specs
- **`docs/design/DESIGN_MODULE_SPEC.md`** (44K) - Module architecture, implementation roadmap, and detailed brief for Codex (Implementation Agent)

### Overview
The Design System establishes the "Alchemical Trading Interface" aesthetic:
- **Color Palette**: Spark (cyan), Void (deep black), mystical accents (violet, ember, gold)
- **Typography**: Space Grotesk (display), Inter (body), JetBrains Mono (code/data)
- **Components**: Button, Card, Badge, Alert, Modal, Input, Tooltip, BottomSheet
- **Mobile Gestures**: Swipe-to-action, pull-to-refresh, drag-to-reorder
- **Animation**: Framer Motion with mystical glow effects

### Implementation Status
- ⚠️ **Gap Identified**: Current implementation uses emerald/zinc palette, design spec requires Spark/Void
- 📋 **Module Spec Ready**: Complete architecture and token structure defined
- 🎯 **For Codex**: DESIGN_MODULE_SPEC.md contains full implementation checklist with 60+ tasks

---

## 📋 Launch-Ready Product Documentation (2025-12-11)

### Product & Technical Documentation
- **`docs/product/launch-ready-documentation.md`** (50K+) - Comprehensive product specification for controlled feature rollout

### Contents
The launch-ready documentation provides:
1. **Informationsarchitektur** - Complete mapping of all 12 pages/tabs with feature matrices (MVP, Release 1, Release 2)
2. **Funktionskatalog** - Detailed feature list per page with user actions, use cases, AI dependencies, and release targets
3. **Core User Journeys** - 6 step-by-step user flows (quick trade logging, alerts, chart analysis, performance review, watchlist monitoring, market sentiment)
4. **AI & Provider Integrations** - Complete provider chain (Moralis → DexPaprika → DexScreener), OpenAI integration, GrokPulse sentiment engine
5. **Data Flows & Dependencies** - Architecture diagrams for journal creation, alerts, chart rendering, watchlist updates, and GrokPulse analysis
6. **UI/UX Flows & Interaction Patterns** - Layout specifications, interaction patterns, modal designs, and visual journey flows
7. **Release Roadmap** - Feature matrix by release with timeline estimates and go-to-market strategy

### Target Audience
- 👨‍💼 **Product Managers**: Feature prioritization, release planning, success metrics
- 👨‍💻 **Engineers**: Dependencies, data flows, integration requirements, test coverage needs
- 🎨 **Designers**: UI/UX flows, interaction patterns, responsive layouts
- 👥 **Stakeholders**: MVP scope, release timeline, business value per release

### Key Highlights
- ✅ **MVP Scope**: Core journaling, charting, alerts, watchlist (6–8 weeks)
- 🚀 **Release 1**: AI insights, gamification, GrokPulse, signals (4–6 weeks)
- 📊 **Release 2**: Wallet integration, lessons, advanced replay (4–6 weeks)
- 📈 **Success Metrics**: 60% DAU retention, 5+ journal entries/user/week, 80% alert accuracy
