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

## 📦 Neue Ergänzungen (2025-12-28)

- **Wallet Holdings (WP-013):** New `HoldingsCard` integration in the Dashboard (`src/features/dashboard/HoldingsCard.tsx`) displaying token balances from the connected wallet. Includes `HoldingDTO`, deterministic mock API (`src/api/wallet.ts`), and full loading/error/empty state handling; wired into `src/pages/DashboardPage.tsx`.

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
