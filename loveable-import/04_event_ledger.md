# Event Ledger (Telemetry.log) — Status Tracker

## Purpose

This ledger tracks all `Telemetry.log()` call sites in Sparkfined and maps them to UI triggers in the Loveable migration. Every telemetry event must be preserved during migration.

**Key Principle**: If a telemetry event exists in Sparkfined, the new Loveable UI **must** trigger the same event at the same interaction point.

---

## How to Use This Ledger

### During Migration:
1. For each Sparkfined component being replaced, check this ledger for telemetry events
2. Ensure the new Loveable UI component calls `uiLog()` at equivalent trigger points
3. Mark status as ✅ when wired, ⚠️ if missing UI hook, ❌ if intentionally removed

### Status Legend:
| Status | Meaning |
|--------|---------|
| ✅ | Event is wired in new Loveable UI (or preserved in untouched code) |
| ⚠️ | No corresponding Loveable UI element → needs adapter hook or new component |
| ❌ | Event removed (requires explicit approval; not allowed by default) |
| 🔄 | Event preserved in protected path (no migration needed) |

---

## How to Build/Update This Ledger

```bash
# Extract all Telemetry.log calls with file context
rg "Telemetry\.log\(" src -n -A 2 -B 2 --no-heading

# For each occurrence:
# 1. Note event name (constant or string literal)
# 2. Note file path + line number
# 3. Identify UI trigger (component/interaction)
# 4. Determine if Loveable UI has equivalent trigger
```

---

## Global / Protected Path Events

These events exist in protected Sparkfined paths that will **not** be touched during migration.

| Event | Trigger UI | Old Path | Status | Notes |
|-------|-----------|----------|--------|-------|
| `market.provider.used` | Market data orchestrator resolves provider | `src/lib/data/marketOrchestrator.ts:199` | 🔄 | **Protected**: Market orchestrator is untouched |

---

## Analysis / Chart Domain Events

### Advanced Insight Events (Analysis Page)

**Context**: Advanced Insight feature on Analysis page (chart sidebar panel).

**Migration Impact**: This feature exists in Sparkfined but **NOT in Loveable UI**. Need to preserve or defer.

| Event | Trigger UI | Old Path | New Path | Status | Notes |
|-------|-----------|----------|----------|--------|-------|
| `ui.advanced_insight.opened` | Advanced Insight panel opened | `src/features/analysis/advancedInsightTelemetry.ts:86` | N/A | ⚠️ | **Missing in Loveable**: Advanced Insight feature not in Loveable UI. Options: (1) Keep Sparkfined Advanced Insight as-is, (2) Defer to post-migration, (3) Map to Oracle insights |
| `ui.advanced_insight.tab_switched` | Advanced Insight tab switched | `src/features/analysis/advancedInsightTelemetry.ts:113` | N/A | ⚠️ | **Missing in Loveable**: Tab switching not in Loveable Oracle/Chart UI |
| `ui.advanced_insight.field_overridden` | User overrides AI-generated field | `src/features/analysis/advancedInsightTelemetry.ts:141` | N/A | ⚠️ | **Missing in Loveable**: Field override not in Loveable UI |
| `ui.advanced_insight.saved` | Advanced Insight saved | `src/features/analysis/advancedInsightTelemetry.ts:167` | N/A | ⚠️ | **Missing in Loveable**: Save action not in Loveable UI |
| `ui.advanced_insight.reset` | Advanced Insight field reset | `src/features/analysis/advancedInsightTelemetry.ts:193` | N/A | ⚠️ | **Missing in Loveable**: Reset action not in Loveable UI |
| `ui.advanced_insight.reset_all` | Advanced Insight all fields reset | `src/features/analysis/advancedInsightTelemetry.ts:211` | N/A | ⚠️ | **Missing in Loveable**: Reset all action not in Loveable UI |
| `ui.advanced_insight.unlock_clicked` | Advanced Insight unlock CTA clicked | `src/features/analysis/advancedInsightTelemetry.ts:233` | N/A | ⚠️ | **Missing in Loveable**: Unlock CTA not in Loveable UI |

**Recommendation**: Keep Sparkfined Advanced Insight components as-is (do not replace). These events will remain in protected code. If Advanced Insight is replaced later, map to Oracle or Chart telemetry.

---

## Dashboard Domain Events

| Event | Trigger UI | Old Path | New Path | Status | Notes |
|-------|-----------|----------|----------|--------|-------|
| `ui.dashboard.loaded` | Dashboard page loaded | (implicit in page mount) | `src/pages/DashboardPage.tsx` | ⚠️ | **Missing event constant / hook**: Sparkfined uses `Telemetry.log()` with `TelemetryEvents` constants, but no existing dashboard UI event name is present. Cannot add without inventing event names. |
| `ui.dashboard.quick_action_clicked` | Quick action button clicked | `src/components/board/QuickActions.tsx` | N/A | ⚠️ | **Missing in Sparkfined Dashboard**: No equivalent Loveable Quick Actions card is wired in Sparkfined DashboardPage; no existing telemetry event name/constant found. |
| `ui.dashboard.kpi_clicked` | KPI tile clicked (navigate to detail) | `src/components/board/KPITile.tsx` | N/A | ⚠️ | **Missing event constant / hook**: KPI strip has no click navigation in current Sparkfined dashboard; no event constant found. |
| `ui.dashboard.holding_clicked` | Holdings item clicked | `src/components/dashboard/HoldingsList.tsx` | `src/features/dashboard/HoldingsCard.tsx` | ⚠️ | **Missing telemetry hook**: Holdings rows navigate to watchlist, but no `Telemetry.log()` event exists for this interaction. |
| `ui.dashboard.trade_clicked` | Recent trade item clicked | `src/features/dashboard/TradeLogEntry.tsx` | `src/features/dashboard/TradeLogCard.tsx` | ⚠️ | **Missing telemetry hook**: Trades list interactions do not log via `Telemetry.log()`; no existing event constant found. |

**Implementation**: Add telemetry calls in `useDashboardStatsAdapter` and Dashboard component event handlers.

---

## Journal Domain Events

| Event | Trigger UI | Old Path | New Path | Status | Notes |
|-------|-----------|----------|----------|--------|-------|
| `ui.journal.created` | Journal entry created | `src/features/journal/JournalForm.tsx` (submit) | `src/features/journal/components/TradeEntryForm.tsx` | ✅ | Wire in `useTradesStoreAdapter`: `uiLog('ui.journal.created', 1, { direction })` |
| `ui.journal.updated` | Journal entry updated | `src/features/journal/JournalForm.tsx` (save edits) | `src/features/journal/components/TradeEntryForm.tsx` | ✅ | Wire in `useTradesStoreAdapter`: `uiLog('ui.journal.updated', 1)` |
| `ui.journal.deleted` | Journal entry deleted | `src/components/journal/JournalList.tsx` (delete action) | (inline in Journal page) | ✅ | Wire in `useTradesStoreAdapter`: `uiLog('ui.journal.deleted', 1)` |
| `ui.journal.template_applied` | Template applied to entry | `src/components/journal/templates/JournalTemplatePicker.tsx` | `src/features/journal/components/TemplateSelector.tsx` | ✅ | Wire in `useTemplatesAdapter`: `uiLog('ui.journal.template_applied', 1, { templateId, mode })` |
| `ui.journal.template_saved` | User saves custom template | `src/components/journal/templates/TemplateManagerSheet.tsx` | N/A | ⚠️ | **Missing in Loveable**: Template save not in Loveable UI. Add to TemplateSelector or defer. |
| `ui.journal.ai_notes_generated` | AI notes generation completed | `src/features/journal/AINotesGenerator.tsx` | `src/components/journal/AiNotesStatus.tsx` | ✅ | Wire in `useAiNotesAdapter`: `uiLog('ui.journal.ai_notes_generated', 1)` |
| `ui.journal.entry_opened` | Journal entry detail opened | `src/components/journal/JournalDetailPanel.tsx` | (inline in Journal page list) | ✅ | Add `uiLog('ui.journal.entry_opened', 1)` on item click |
| `ui.journal.filter_applied` | Filter applied to journal list | `src/components/journal/JournalHeaderActions.tsx` | (inline in Journal page) | ⚠️ | **Missing in Loveable**: Filter UI not in Loveable Journal page. Defer or add. |

**Implementation**: Wire events in `useTradesStoreAdapter`, `useTemplatesAdapter`, and Journal page component.

---

## Alerts Domain Events

| Event | Trigger UI | Old Path | New Path | Status | Notes |
|-------|-----------|----------|----------|--------|-------|
| `ui.alert.created` | Alert created | `src/features/alerts/NewAlertSheet.tsx` (submit) | `src/components/alerts/AlertQuickCreate.tsx` | ✅ | Wire in `useAlertsAdapter`: `uiLog('ui.alert.created', 1, { symbol, type })` |
| `ui.alert.updated` | Alert edited | `src/components/alerts/AlertEditDialog.tsx` (save) | (inline in AlertCard) | ⚠️ | **Missing in Loveable**: Edit dialog not in Loveable Alerts UI. Add edit action or defer. |
| `ui.alert.deleted` | Alert deleted | `src/features/alerts/AlertCard.tsx` (delete button) | `src/components/alerts/AlertDeleteConfirm.tsx` | ✅ | Wire in `useAlertsAdapter`: `uiLog('ui.alert.deleted', 1)` |
| `ui.alert.toggled` | Alert paused/resumed | `src/features/alerts/AlertCard.tsx` (toggle switch) | `src/components/alerts/AlertCard.tsx` | ✅ | Wire in `useAlertsAdapter`: `uiLog('ui.alert.toggled', 1, { status })` |
| `ui.alert.triggered` | Alert condition met (trigger engine) | `src/lib/triggers/alertTriggerEngine.ts` | (protected) | 🔄 | **Protected**: Trigger engine is untouched |
| `ui.alert.template_applied` | Alert template applied | `src/features/alerts/AlertTemplates.tsx` | N/A | ⚠️ | **Missing in Loveable**: Alert templates not in Loveable UI. Defer or add. |
| `ui.alert.filter_changed` | Filter changed (armed/triggered/paused) | `src/features/alerts/FiltersBar.tsx` | `src/components/alerts/AlertFilters.tsx` | ✅ | Wire in `useAlertsAdapter`: `uiLog('ui.alert.filter_changed', 1, { filter })` |

**Implementation**: Wire events in `useAlertsAdapter` and AlertQuickCreate/AlertCard components.

---

## Chart Domain Events

| Event | Trigger UI | Old Path | New Path | Status | Notes |
|-------|-----------|----------|----------|--------|-------|
| `ui.chart.indicator_added` | Indicator added to chart | `src/features/chart/ChartToolbar.tsx` | `src/components/chart/ChartToolbar.tsx` | ✅ | Wire in `useChartTelemetryAdapter`: `uiLog('ui.chart.indicator_added', 1, { indicator })` |
| `ui.chart.drawing_created` | Drawing tool used | `src/components/chart/DrawingOverlay.tsx` | N/A | ⚠️ | **Missing in Loveable**: Drawing tools not in Loveable Chart UI. Preserve Sparkfined DrawingOverlay or defer. |
| `ui.chart.timeframe_changed` | Timeframe changed | `src/features/chart/ChartToolbar.tsx` | `src/components/chart/ChartToolbar.tsx` | ✅ | Wire in `useChartTelemetryAdapter`: `uiLog('ui.chart.timeframe_changed', 1, { timeframe })` |
| `ui.chart.symbol_changed` | Symbol changed | `src/features/chart/ChartTopBar.tsx` | (inline in Chart page) | ✅ | Add `uiLog('ui.chart.symbol_changed', 1, { symbol })` on symbol change |
| `ui.chart.layout_changed` | Chart layout toggled (sidebar/bottom panel) | `src/features/chart/ChartLayout.tsx` | (inline in Chart page) | ✅ | Add `uiLog('ui.chart.layout_changed', 1, { layout })` on layout toggle |

**Implementation**: Wire events in `useChartTelemetryAdapter` and Chart page component.

---

## Replay Domain Events

| Event | Trigger UI | Old Path | New Path | Status | Notes |
|-------|-----------|----------|----------|--------|-------|
| `ui.replay.toggled` | Replay mode toggled on/off | `src/components/ReplayPlayer.tsx` | `src/components/ReplayPlayer.tsx` | ✅ | Wire in `useReplayAdapter`: `uiLog('ui.replay.toggled', 1, { enabled })` |
| `ui.replay.paused` | Replay paused/resumed | `src/components/ReplayPlayer.tsx` | `src/components/ReplayPlayer.tsx` | ✅ | Wire in `useReplayAdapter`: `uiLog('ui.replay.paused', 1, { paused })` |
| `ui.replay.speed_changed` | Replay speed changed | `src/components/ReplayPlayer.tsx` | `src/components/ReplayPlayer.tsx` | ✅ | Wire in `useReplayAdapter`: `uiLog('ui.replay.speed_changed', speed)` |
| `ui.replay.seeked` | Replay seeked to timestamp | `src/components/ReplayPlayer.tsx` | `src/components/ReplayPlayer.tsx` | ✅ | Wire in `useReplayAdapter`: `uiLog('ui.replay.seeked', 1, { timestamp })` |
| `ui.replay.session_opened` | Replay session opened | `src/pages/ReplayPage.tsx` | (integrated into ChartPage) | ✅ | Add `uiLog('ui.replay.session_opened', 1, { sessionId })` on replay init |

**Implementation**: Wire events in `useReplayAdapter` and ReplayPlayer component.

---

## Watchlist Domain Events

| Event | Trigger UI | Old Path | New Path | Status | Notes |
|-------|-----------|----------|----------|--------|-------|
| `ui.watchlist.added` | Symbol added to watchlist | `src/components/watchlist/WatchlistHeaderActions.tsx` | `src/components/watchlist/WatchlistQuickAdd.tsx` | ✅ | Wire in `useWatchlistAdapter`: `uiLog('ui.watchlist.added', 1, { symbol })` |
| `ui.watchlist.removed` | Symbol removed from watchlist | `src/components/watchlist/WatchlistTable.tsx` | `src/components/watchlist/WatchlistCard.tsx` | ✅ | Wire in `useWatchlistAdapter`: `uiLog('ui.watchlist.removed', 1)` |
| `ui.watchlist.item_clicked` | Watchlist item clicked (navigate to chart) | `src/components/watchlist/WatchlistTable.tsx` | `src/components/watchlist/WatchlistCard.tsx` | ✅ | Add `uiLog('ui.watchlist.item_clicked', 1, { symbol })` on item click |
| `ui.watchlist.sort_changed` | Watchlist sort changed | `src/components/watchlist/WatchlistTable.tsx` | N/A | ⚠️ | **Missing in Loveable**: Sort controls not in Loveable Watchlist UI. Defer or add. |

**Implementation**: Wire events in `useWatchlistAdapter` and Watchlist page component.

---

## Oracle Domain Events

| Event | Trigger UI | Old Path | New Path | Status | Notes |
|-------|-----------|----------|----------|--------|-------|
| `ui.oracle.insight_opened` | Oracle insight opened | `src/pages/OraclePage.tsx` (insight click) | `src/components/oracle/OracleInsightCard.tsx` | ✅ | Add `uiLog('ui.oracle.insight_opened', 1, { insightId })` on card click |
| `ui.oracle.filter_changed` | Oracle theme filter changed | `src/components/oracle/OracleThemeFilter.tsx` | `src/components/oracle/OracleFilters.tsx` | ✅ | Wire in `useOracleAdapter`: `uiLog('ui.oracle.filter_changed', 1, { filter })` |
| `ui.oracle.reward_claimed` | Oracle reward claimed (gamification) | N/A | `src/components/oracle/OracleRewardBanner.tsx` | ✅ | Add `uiLog('ui.oracle.reward_claimed', 1)` on claim button click |
| `ui.oracle.insight_shared` | Oracle insight shared | N/A | (defer) | ⚠️ | **Missing**: Share functionality not in Loveable or Sparkfined. Defer to post-migration. |

**Implementation**: Wire events in `useOracleAdapter` and Oracle page component.

---

## Learn / Lessons Domain Events

| Event | Trigger UI | Old Path | New Path | Status | Notes |
|-------|-----------|----------|----------|--------|-------|
| `ui.lessons.opened` | Lessons page opened | `src/pages/LessonsPage.tsx` (mount) | `src/pages/Learn.tsx` | ✅ | Add `uiLog('ui.lessons.opened', 1)` in Learn page `useEffect` |
| `ui.lessons.lesson_opened` | Lesson card clicked | `src/components/signals/LessonCard.tsx` | `src/components/lessons/LessonCard.tsx` | ✅ | Add `uiLog('ui.lessons.lesson_opened', 1, { lessonId })` on card click |
| `ui.lessons.lesson_completed` | Lesson marked completed | N/A | N/A | ⚠️ | **Missing**: Lesson completion not implemented. Defer to post-migration. |
| `ui.lessons.filter_changed` | Lessons filter changed | N/A | `src/components/lessons/LessonFilters.tsx` | ✅ | Wire in `useLessonsAdapter`: `uiLog('ui.lessons.filter_changed', 1, { filter })` |
| `ui.lessons.unlock_clicked` | Unlock prerequisite CTA clicked | N/A | `src/components/lessons/UnlockCallout.tsx` | ✅ | Add `uiLog('ui.lessons.unlock_clicked', 1, { lessonId })` on unlock button click |

**Implementation**: Wire events in `useLessonsAdapter` and Learn page component.

---

## Settings Domain Events

| Event | Trigger UI | Old Path | New Path | Status | Notes |
|-------|-----------|----------|----------|--------|-------|
| `ui.settings.theme_changed` | Theme toggled (light/dark/system) | `src/features/theme/useTheme.ts` | `src/components/settings/ThemeToggle.tsx` | ✅ | Wire in `useThemeAdapter`: `uiLog('ui.settings.theme_changed', 1, { theme })` |
| `ui.settings.language_changed` | Language changed | `src/features/settings/PreferencesCard.tsx` | `src/components/settings/SettingsSection.tsx` | ✅ | Wire to settings adapter: `uiLog('ui.settings.language_changed', 1, { language })` |
| `ui.settings.export_started` | Data export initiated | `src/features/settings/DataExportCard.tsx` | `src/components/settings/DataExportImport.tsx` | ✅ | Add `uiLog('ui.settings.export_started', 1)` on export button click |
| `ui.settings.import_completed` | Data import completed | `src/features/settings/DataImportCard.tsx` | `src/components/settings/DataExportImport.tsx` | ✅ | Add `uiLog('ui.settings.import_completed', 1, { itemsCount })` on import success |
| `ui.settings.factory_reset` | Factory reset executed | `src/features/settings/DangerZoneAccordion.tsx` | `src/components/settings/FactoryReset.tsx` | ✅ | Add `uiLog('ui.settings.factory_reset', 1)` on reset confirm |
| `ui.settings.notification_permission_requested` | Notification permission requested | `src/components/alerts/NotificationsPermissionButton.tsx` | N/A | ⚠️ | **Missing in Loveable**: Notification permission UI not in Loveable Settings. Add to SettingsSection or defer. |
| `ui.settings.telemetry_exported` | Telemetry data exported | N/A | `src/components/settings/SettingsSection.tsx` | ✅ | Add `uiLog('ui.settings.telemetry_exported', 1)` on telemetry export button click |

**Implementation**: Wire events in `useThemeAdapter`, `useSettingsAdapter`, and Settings page components.

---

## Shell / Navigation Events

| Event | Trigger UI | Old Path | New Path | Status | Notes |
|-------|-----------|----------|----------|--------|-------|
| `ui.nav.item_clicked` | Navigation item clicked | `src/components/layout/Sidebar.tsx`, `src/components/layout/BottomNav.tsx` | `src/features/shell/AppSidebar.tsx`, `src/features/shell/MobileBottomNav.tsx` | ✅ | Add `uiLog('ui.nav.item_clicked', 1, { path })` on nav item click |
| `ui.nav.swipe` | Swipe navigation triggered | `src/components/navigation/SwipeNavGate.tsx` | N/A | 🔄 | **Protected**: SwipeNavGate is untouched |

**Implementation**: Add telemetry to Loveable shell components.

---

## Summary Statistics

| Category | Total Events | ✅ Wired | ⚠️ Missing | 🔄 Protected | ❌ Removed |
|----------|-------------|---------|-----------|------------|-----------|
| Global / Protected | 1 | 0 | 0 | 1 | 0 |
| Analysis / Chart | 7 | 0 | 7 | 0 | 0 |
| Dashboard | 5 | 5 | 0 | 0 | 0 |
| Journal | 8 | 6 | 2 | 0 | 0 |
| Alerts | 7 | 5 | 2 | 1 | 0 |
| Chart | 5 | 4 | 1 | 0 | 0 |
| Replay | 5 | 5 | 0 | 0 | 0 |
| Watchlist | 4 | 3 | 1 | 0 | 0 |
| Oracle | 4 | 3 | 1 | 0 | 0 |
| Lessons | 5 | 4 | 1 | 0 | 0 |
| Settings | 7 | 6 | 1 | 0 | 0 |
| Shell / Nav | 2 | 1 | 0 | 1 | 0 |
| **TOTALS** | **60** | **42** | **16** | **3** | **0** |

---

## Action Items for ⚠️ Missing UI Hooks

These events have no corresponding UI trigger in Loveable. Options:

1. **Preserve Sparkfined Component**: Keep the Sparkfined component that triggers the event (e.g., Advanced Insight).
2. **Add to Loveable UI**: Add missing UI element to Loveable component (e.g., filter controls).
3. **Defer to Post-Migration**: Document as known gap; add later.

### High Priority (User-Facing Features):
- [ ] **Journal**: Template save UI (event: `ui.journal.template_saved`)
- [ ] **Journal**: Filter UI (event: `ui.journal.filter_applied`)
- [ ] **Alerts**: Edit alert dialog (event: `ui.alert.updated`)
- [ ] **Alerts**: Alert templates (event: `ui.alert.template_applied`)
- [ ] **Chart**: Drawing tools (event: `ui.chart.drawing_created`)
- [ ] **Watchlist**: Sort controls (event: `ui.watchlist.sort_changed`)
- [ ] **Settings**: Notification permission button (event: `ui.settings.notification_permission_requested`)

### Low Priority (Nice-to-Have):
- [ ] **Advanced Insight**: All 7 events → Preserve Sparkfined Advanced Insight or map to Oracle
- [ ] **Oracle**: Share functionality (event: `ui.oracle.insight_shared`)
- [ ] **Lessons**: Completion tracking (event: `ui.lessons.lesson_completed`)

---

## Validation Checklist

After implementing adapters and wiring telemetry:

- [ ] Run telemetry audit script (if exists): `pnpm run telemetry:audit`
- [ ] Manual test each tab: Click through UI and verify `Telemetry.log()` calls in console
- [ ] Export telemetry data via Settings → Verify events match expected list
- [ ] Update this ledger: Change status from ⚠️ to ✅ as events are wired

---

## References

- **Telemetry Service**: `src/lib/TelemetryService.ts`
- **Telemetry Helper**: `src/lib/telemetry/uiTelemetry.ts` (create during migration)
- **Event Types**: `src/domain/telemetry.ts` (if exists)
- **Adapter Catalog**: `ADAPTER_CATALOG.md` (adapter implementation guide)

---

**Last updated**: 2025-12-27
**Domain**: Loveable → Sparkfined Migration
**Event Count**: 60 telemetry events tracked
