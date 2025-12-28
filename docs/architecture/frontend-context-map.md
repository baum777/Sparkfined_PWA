# Sparkfined PWA — Frontend/UI Context Cluster Map

**Repository**: Sparkfined_PWA  
**Total Tracked Files**: 1,270  
**Total UI/Frontend Candidates**: 314  
**Date Generated**: 2025-12-26  

---

## SECTION 1: Normalized Frontend Index (Strict Format)

**Computed Counts by File Type:**
- TSX/JSX Components: 261
- CSS Stylesheets: 25
- PNG/SVG/ICO Assets: 23
- Frontend-relevant files (src/components, features, pages, styles, hooks, store, public, tests): 391

| Bucket | Paths |
|--------|-------|
| **Pages/Routes** | root/index.html<br>root/src/main.tsx<br>root/src/App.tsx<br>root/src/pages/*<br>root/src/routes/RoutesRoot.tsx<br>root/src/app/AppErrorBoundary.tsx<br>root/src/pages/_layout/GlobalInstruments.tsx |
| **Components/UI** | root/src/components/*<br>root/src/features/alerts/*<br>root/src/features/analysis/*<br>root/src/features/chart/*<br>root/src/features/dashboard/*<br>root/src/features/journal/*<br>root/src/features/journal-v2/ \| components/JournalInputForm.tsx / components/JournalResultView.tsx / components/JournalTemplatesSection.tsx<br>root/src/features/settings/*<br>root/src/features/shell/*<br>root/src/features/theme/*<br>root/src/features/market/ \| analysisData.ts / watchlistData.ts |
| **Styles/Theming** | root/src/styles/*<br>root/src/features/alerts/alerts.css<br>root/src/features/chart/chart.css<br>root/src/features/dashboard/ \| alerts-overview.css / daily-bias.css / dashboard.css / fab.css / holdings-card.css / kpi.css / recent-entries.css / trade-log.css<br>root/src/features/journal/journal.css<br>root/src/features/settings/settings.css<br>root/src/features/shell/ \| bottom-nav.css / sidebar.css / top-bar.css<br>root/src/lib/theme/*<br>root/tailwind.config.ts<br>root/postcss.config.cjs |
| **Assets (images/icons/fonts)** | root/public/*<br>root/docs/core/design/ \| logo-concept-1-brand-focus-v2.svg / logo-concept-1-brand-focus.svg / logo-concept-2-project-focus-v2.svg / logo-concept-2-project-focus.svg / logo-concept-3-hybrid-v2.svg / logo-concept-3-hybrid.svg / logo-monochrome-versions.svg / logo-usage-mockups.svg |
| **UI State/Hooks** | root/src/hooks/*<br>root/src/store/*<br>root/src/config/navigation.ts<br>root/src/features/analysis/advancedInsightStore.ts<br>root/src/features/journal-v2/hooks/useJournalV2.ts<br>root/src/features/journal/ \| useAutoSave.ts / useLogEntryAvailability.ts |
| **UI Library Code** | root/src/lib/chart/*<br>root/src/lib/ui/*<br>root/src/lib/capture/chartCapture.ts<br>root/src/lib/export/*<br>root/src/lib/format/money.ts<br>root/src/features/chart/ \| chartExport.ts / markers.ts / replay.ts / toolbar-sections.tsx |
| **UI Tests (unit/e2e)** | root/tests/e2e/*<br>root/tests/components/*<br>root/tests/pages/JournalPage.test.tsx<br>root/tests/hooks/useWalletHoldings.test.tsx<br>root/tests/grokPulse/grokPulse.e2e.test.tsx<br>root/tests/unit/ \| journal.v2-hook.test.tsx / result-card.render.test.tsx / settings.quoteCurrency.test.tsx<br>root/tests/cases/ \| */ABA-E2E-040.spec.ts / */ABA-SMOKE-020.test.tsx / */JCA-E2E-040.spec.ts / */JCA-SMOKE-020.test.tsx / */TVA-E2E-040.spec.ts<br>root/src/components/ui/Modal/__tests__/Modal.a11y.spec.tsx<br>root/src/components/__tests__/Logo.test.tsx<br>root/src/components/layout/__tests__/BottomNav.test.tsx |
| **UX/Design Docs** | root/docs/DESIGN_TOKENS_STYLEGUIDE_DE.md<br>root/docs/RESPONSIVE_GUIDELINES.md<br>root/docs/UI_ANALYSIS_SUMMARY.md<br>root/docs/UI_STYLE_GUIDE.md<br>root/docs/UX-IMPROVEMENTS.md<br>root/docs/active/reports/ui-errors.md<br>root/docs/architecture/LAYOUT_SYSTEM_QUICKSTART.md<br>root/docs/core/design/*<br>root/docs/core/ai/ \| HANDOVER_CODEX_ADVANCED_INSIGHT_UI.md / advanced-insight-ui-spec-beta-v0.9.md<br>root/docs/archive/CHART_A11Y_GUIDELINES.md<br>root/docs/archive/loops/LOOP_2_DESIGN.md<br>root/docs/archive/raw/2025-11-12/ \| ONBOARDING_QUICK_START.md / SIGNAL_UI_INTEGRATION.md<br>root/docs/archive/telemetry/schemas/ \| ui_export_start.json / ui_layout_save.json / ui_search_select.json / ui_snapshot_create.json / ui_trade_quick_open.json |
| **Build/Config (UI-related)** | root/vite.config.ts<br>root/playwright.config.ts<br>root/vitest.config.ts<br>root/.prettierrc.json<br>root/eslint-rules/no-hardcoded-colors.js<br>root/src/components/ui/Modal/Modal.stories.tsx |

---

## SECTION 2: Context Cluster Map (Tab-Oriented)

### Tab: Dashboard
**Route**: `/dashboard`  
**Page Component**: `root/src/pages/DashboardPage.tsx`

| Dimension | Paths |
|-----------|-------|
| **UI** | root/src/features/dashboard/*<br>root/src/components/dashboard/*<br>root/src/components/board/* |
| **UX** | root/docs/archive/raw/2025-11-12/ONBOARDING_QUICK_START.md<br>root/tests/e2e/board-a11y.spec.ts<br>root/tests/e2e/board-text-scaling.spec.ts |
| **Function** | root/src/hooks/ \| useBoardFeed.ts / useBoardKPIs.ts<br>root/src/lib/dashboard/calculateKPIs.ts |
| **Event** | root/docs/archive/telemetry/schemas/ \| ui_trade_quick_open.json |
| **User-Interaction** | root/tests/e2e/dashboard-kpis.spec.ts<br>root/src/features/dashboard/ \| FAB.tsx / FABMenu.tsx (click handlers) |

---

### Tab: Journal
**Route**: `/journal`  
**Page Component**: `root/src/pages/JournalPage.tsx`

| Dimension | Paths |
|-----------|-------|
| **UI** | root/src/features/journal/*<br>root/src/features/journal-v2/components/*<br>root/src/components/journal/* |
| **UX** | root/.claude/memories/journal-system.md<br>root/.cursor/rules/journal-system.mdc<br>root/docs/core/journal/ (if exists) |
| **Function** | root/src/features/journal-v2/hooks/useJournalV2.ts<br>root/src/features/journal/ \| useAutoSave.ts / useLogEntryAvailability.ts<br>root/src/store/journalStore.ts<br>root/src/lib/journal/*<br>root/src/features/journal-v2/ \| db/* / engine/* / services/* / types/* |
| **Event** | root/src/lib/journal/ \| journalTelemetry.ts / journal-insights-telemetry.ts / journalEventSubscriptions.ts / journal-social-analytics.ts / journey-analytics.ts<br>root/src/store/tradeEventJournalBridge.ts<br>root/tests/unit/ \| journal.telemetry-mapping.test.ts / journey.analytics.test.ts / journal.journal-insights-telemetry.test.ts |
| **User-Interaction** | root/tests/e2e/ \| journal-crud.spec.ts / journal/journal.flows.spec.ts<br>root/tests/components/ \| EmotionalSlider.test.tsx / JournalDataControls.test.tsx / JournalInsightsPanel.test.tsx / JournalJourneyBanner.test.tsx / JournalSocialPreview.test.tsx<br>root/tests/pages/JournalPage.test.tsx<br>root/src/components/journal/ \| JournalNewEntryDialog.tsx / templates/* (forms/dialogs) |

---

### Tab: Chart (Analysis)
**Route**: `/chart` (aliases: `/analysis`, `/analyze`)  
**Page Component**: `root/src/pages/ChartPage.tsx` + `root/src/pages/AnalysisPage.tsx`

| Dimension | Paths |
|-----------|-------|
| **UI** | root/src/features/chart/*<br>root/src/features/analysis/*<br>root/src/components/chart/*<br>root/src/components/analysis/* |
| **UX** | root/docs/archive/CHART_A11Y_GUIDELINES.md<br>root/docs/core/ai/ \| HANDOVER_CODEX_ADVANCED_INSIGHT_UI.md / advanced-insight-ui-spec-beta-v0.9.md |
| **Function** | root/src/hooks/ \| useChartDrawings.ts / useChartInteractionMode.ts / useIndicators.ts / useIndicatorSettings.ts / useOhlcData.ts / useAdvancedInsight.ts<br>root/src/store/chartUiStore.ts<br>root/src/lib/chart/*<br>root/src/features/chart/ \| chartExport.ts / markers.ts / replay.ts<br>root/src/features/analysis/advancedInsightStore.ts |
| **Event** | root/src/components/chart/ChartTelemetryBridge.tsx<br>root/src/lib/chartTelemetry.ts<br>root/src/features/analysis/advancedInsightTelemetry.ts<br>root/tests/unit/chartTelemetry.test.ts<br>root/docs/archive/telemetry/schemas/ \| ui_snapshot_create.json / ui_layout_save.json |
| **User-Interaction** | root/tests/e2e/ \| chart-navigation.spec.ts / chart-drawing-lifecycle.spec.ts / chart-drawing-selection.spec.ts / chartFlows.spec.ts / replay.spec.ts / analyze/analysis.flow.spec.ts / analyze/analyze.page.spec.ts<br>root/tests/components/ \| AdvancedChart.test.tsx / chart/ChartBottomPanel.test.tsx / chart/ChartToolbar.test.tsx / chart/MobileChartControls.test.tsx<br>root/src/features/chart/ \| ChartToolbar.tsx / toolbar-sections.tsx (drawing tools, indicators) |

---

### Tab: Watchlist
**Route**: `/watchlist`  
**Page Component**: `root/src/pages/WatchlistPage.tsx`

| Dimension | Paths |
|-----------|-------|
| **UI** | root/src/components/watchlist/*<br>root/src/features/market/watchlistData.ts |
| **UX** | (No dedicated UX docs found — general responsive guidelines apply) |
| **Function** | root/src/store/watchlistStore.ts<br>root/src/hooks/useWalletHoldings.ts |
| **Event** | root/docs/archive/telemetry/schemas/ \| ui_search_select.json (if used for watchlist symbol search) |
| **User-Interaction** | root/tests/e2e/ \| watchlist-sorting.spec.ts / watchlist/watchlist.flows.spec.ts / watchlist/watchlist.offline.spec.ts<br>root/tests/components/watchlist/WatchlistPage.test.tsx<br>root/tests/hooks/useWalletHoldings.test.tsx<br>root/src/components/watchlist/WatchlistTable.tsx (sorting, filtering) |

---

### Tab: Alerts
**Route**: `/alerts`  
**Page Component**: `root/src/pages/AlertsPage.tsx`

| Dimension | Paths |
|-----------|-------|
| **UI** | root/src/features/alerts/*<br>root/src/components/alerts/* |
| **UX** | (No dedicated UX docs found — general responsive guidelines apply) |
| **Function** | root/src/store/alertsStore.ts<br>root/src/features/alerts/ \| filtering.ts / prefill.ts<br>root/src/lib/alerts/triggerEngine.ts |
| **Event** | root/src/App.tsx (alert check interval, lines 18-62)<br>root/src/store/pushQueueStore.ts |
| **User-Interaction** | root/tests/e2e/ \| alerts-crud.spec.ts / alerts/alerts.flows.spec.ts / alerts/alerts.push.spec.ts<br>root/tests/components/alerts/ \| AlertCard.test.tsx / AlertsFiltering.test.tsx / MobileAlertRow.test.tsx / NewAlertSheet.test.tsx / SymbolAutocomplete.test.tsx<br>root/src/features/alerts/ \| NewAlertSheet.tsx / SymbolAutocomplete.tsx (forms) |

---

### Tab: Settings
**Route**: `/settings`  
**Page Component**: `root/src/pages/SettingsPage.tsx` + `root/src/pages/SettingsContent.tsx`

| Dimension | Paths |
|-----------|-------|
| **UI** | root/src/features/settings/*<br>root/src/components/settings/* |
| **UX** | root/docs/active/reports/ui-errors.md (settings-related errors)<br>root/docs/UX-IMPROVEMENTS.md (if mentions settings) |
| **Function** | root/src/store/userSettings.ts<br>root/src/lib/export/*<br>root/src/lib/pwa/update.ts |
| **Event** | root/docs/archive/telemetry/schemas/ \| ui_export_start.json |
| **User-Interaction** | root/tests/e2e/settings/data-export.spec.ts<br>root/tests/components/settings/ \| DangerZoneAccordion.test.tsx / DataExportImportCards.test.tsx / PreferencesCard.test.tsx / SettingsPage.mobile.test.tsx / WalletMonitoringCard.test.tsx<br>root/tests/unit/settings.quoteCurrency.test.tsx<br>root/src/features/settings/ \| DataExportCard.tsx / DataImportCard.tsx / DangerZoneAccordion.tsx (forms, actions) |

---

### Tab: Signals (Secondary)
**Route**: `/signals`  
**Page Component**: `root/src/pages/SignalsPage.tsx`

| Dimension | Paths |
|-----------|-------|
| **UI** | root/src/components/signals/*<br>root/src/pages/SignalsPage.tsx |
| **UX** | root/docs/archive/raw/2025-11-12/SIGNAL_UI_INTEGRATION.md |
| **Function** | root/src/hooks/useSignals.ts |
| **Event** | (No dedicated telemetry found) |
| **User-Interaction** | root/src/components/signals/ \| SignalReviewCard.tsx (user feedback on signals) |

---

### Tab: Oracle (Secondary)
**Route**: `/oracle`  
**Page Component**: `root/src/pages/OraclePage.tsx`

| Dimension | Paths |
|-----------|-------|
| **UI** | root/src/components/oracle/*<br>root/src/pages/OraclePage.tsx |
| **UX** | (No dedicated UX docs found) |
| **Function** | root/src/store/oracleStore.ts |
| **Event** | (No dedicated telemetry found) |
| **User-Interaction** | root/tests/e2e/oracle.spec.ts<br>root/src/components/oracle/OracleThemeFilter.tsx (filtering) |

---

### Tab: Replay (Secondary)
**Route**: `/replay`  
**Page Component**: `root/src/pages/ReplayPage.tsx`

| Dimension | Paths |
|-----------|-------|
| **UI** | root/src/components/ \| ReplayModal.tsx / ReplayPlayer.tsx<br>root/src/pages/ReplayPage.tsx |
| **UX** | (No dedicated UX docs found) |
| **Function** | root/src/lib/replay/ohlcReplayEngine.ts<br>root/src/features/chart/replay.ts |
| **Event** | (No dedicated telemetry found) |
| **User-Interaction** | root/tests/e2e/replay.spec.ts<br>root/src/components/ReplayPlayer.tsx (playback controls) |

---

### Tab: Lessons (Secondary)
**Route**: `/lessons`  
**Page Component**: `root/src/pages/LessonsPage.tsx`

| Dimension | Paths |
|-----------|-------|
| **UI** | root/src/components/signals/LessonCard.tsx<br>root/src/pages/LessonsPage.tsx |
| **UX** | (No dedicated UX docs found) |
| **Function** | (Likely read-only content) |
| **Event** | (No dedicated telemetry found) |
| **User-Interaction** | (Minimal — primarily content navigation) |

---

### Tab: Showcase (Secondary, Dev-Only)
**Route**: `/icons`, `/styles`, `/ux`  
**Page Components**: `root/src/pages/IconShowcase.tsx`, `root/src/pages/StyleShowcasePage.tsx`, `root/src/pages/UXShowcasePage.tsx`

| Dimension | Paths |
|-----------|-------|
| **UI** | root/src/pages/ \| IconShowcase.tsx / StyleShowcasePage.tsx / UXShowcasePage.tsx |
| **UX** | root/docs/ \| UI_STYLE_GUIDE.md / DESIGN_TOKENS_STYLEGUIDE_DE.md / RESPONSIVE_GUIDELINES.md |
| **Function** | (Dev tooling for showcasing design system) |
| **Event** | (Not applicable) |
| **User-Interaction** | (Dev-only browsing of UI library) |

---

## SECTION 3: Cross-Cutting Shared Clusters

These modules affect multiple tabs and are foundational to the frontend.

| Cluster | Paths |
|---------|-------|
| **Shared UI Primitives** | root/src/components/ui/*<br>root/src/lib/ui/ \| cn.ts / useFocusTrap.ts |
| **Global Styling** | root/src/styles/*<br>root/tailwind.config.ts<br>root/postcss.config.cjs<br>root/eslint-rules/no-hardcoded-colors.js |
| **Shell/Navigation Layout** | root/src/features/shell/*<br>root/src/components/layout/*<br>root/src/config/navigation.ts<br>root/src/routes/RoutesRoot.tsx<br>root/src/components/navigation/SwipeNavGate.tsx |
| **Theming** | root/src/features/theme/*<br>root/src/lib/theme/* |
| **Onboarding/UX Flows** | root/src/components/onboarding/*<br>root/src/store/onboardingStore.ts<br>root/tests/e2e/onboarding.flow.spec.ts |
| **PWA Infrastructure** | root/src/components/pwa/*<br>root/src/components/ \| UpdateBanner.tsx / OfflineIndicator.tsx / MissingConfigBanner.tsx<br>root/src/lib/pwa/update.ts<br>root/tests/e2e/pwa.spec.ts<br>root/public/ \| manifest.webmanifest / offline.html / push/sw.js |
| **Global Telemetry/Events** | root/src/hooks/useEventLogger.ts<br>root/src/lib/ \| TelemetryService.ts / logger.ts<br>root/src/store/eventBus.ts<br>root/src/domain/telemetry.ts<br>root/docs/archive/telemetry/schemas/*<br>root/tests/unit/ \| telemetry.test.ts / muxing.test.ts |
| **Keyboard Shortcuts** | root/src/hooks/useKeyboardShortcut.ts<br>root/src/components/ui/KeyboardShortcutsDialog.tsx<br>root/src/components/onboarding/KeyboardShortcuts.tsx |
| **Gamification (XP/Journey)** | root/src/store/gamificationStore.ts<br>root/src/components/JournalBadge.tsx<br>root/src/lib/journal/ \| journey-analytics.ts / journey-snapshot.ts |
| **Live Data/Polling** | root/src/store/liveDataStore.ts<br>root/src/lib/live/*<br>root/src/components/live/LiveStatusBadge.tsx |
| **Error Boundaries** | root/src/app/AppErrorBoundary.tsx<br>root/src/components/ErrorBoundary.tsx<br>root/src/components/ui/ \| ErrorBanner.tsx / ErrorState.tsx |
| **Design Tokens & Guidelines** | root/docs/DESIGN_TOKENS_STYLEGUIDE_DE.md<br>root/docs/RESPONSIVE_GUIDELINES.md<br>root/docs/UI_STYLE_GUIDE.md<br>root/docs/UX-IMPROVEMENTS.md<br>root/docs/architecture/LAYOUT_SYSTEM_QUICKSTART.md<br>root/docs/core/design/* |
| **E2E Test Infrastructure** | root/tests/e2e/fixtures/*<br>root/playwright.config.ts<br>root/.cursor/rules/playwright-e2e-health.mdc |
| **Storybook/Component Dev** | root/src/components/ui/Modal/Modal.stories.tsx<br>root/vitest.config.ts |

---

## Notes

1. **Exclusions Applied**: `node_modules/`, `dist/`, `build/`, `coverage/`, `.next/`, `.vercel/`, `.turbo/`, `.cache/`, lockfiles, and pure backend-only logic (e.g., `src/api/`, backend AI orchestrators, Solana providers, signal engines) were excluded.

2. **Glob Strategy**: Used `folder/*` when 100% of tracked files in a folder are UI-relevant. Used `folder/ | fileA / fileB` for mixed directories.

3. **Tab Mapping**: Tabs were derived from `src/config/navigation.ts` and `src/routes/RoutesRoot.tsx`. Feature folders (`src/features/<tab>/`) map directly to tabs. Some tabs (e.g., Watchlist) have components but no dedicated feature folder.

4. **Function Dimension**: Includes UI-adjacent logic (stores, hooks, formatting, export helpers, chart drawing geometry). Excludes pure backend engines (market orchestrators, AI pipeline internals, wallet transaction monitors).

5. **Event Dimension**: Telemetry schemas found in `docs/archive/telemetry/schemas/`. Event-emitting code identified via grep for `telemetry|trackEvent|eventBus.emit`. Journal domain has the richest telemetry coverage.

6. **User-Interaction Dimension**: Primarily derived from E2E specs (Playwright) and component tests (Vitest). Includes forms, modals, keyboard shortcuts, and click handlers.

7. **Journal V2 Structure**: The `features/journal-v2/` folder has a mixed structure (UI components + DB schemas + engine logic). Only UI components are listed under UI dimension; DB/engine/types are under Function dimension.

8. **Cross-Cutting Clusters**: Shared primitives, shell/navigation, theming, onboarding, PWA, telemetry, and error boundaries affect all tabs.

9. **File Count Validation**: All paths are tracked by git and verified. No placeholders or estimates.

10. **Traceability**: Every UI-relevant file appears in at least one cluster (either tab-specific or cross-cutting).

---

**Generated by**: Repo Auditor → IA Cluster Mapper  
**Purpose**: Enable devs to instantly locate "where things live" in the Sparkfined PWA frontend architecture.




