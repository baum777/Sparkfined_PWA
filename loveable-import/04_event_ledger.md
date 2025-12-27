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
| `ui.dashboard.loaded` | Dashboard page loaded | (implicit in page mount) | `src/pages/DashboardPage.tsx` | ⚠️ | **Missing event constant**: repo has no `TelemetryEvents`/domain constant for this event. Currently logged as string literal `Telemetry.log('ui.dashboard.loaded', 1)`. If you want a constant, follow `AdvancedInsightEvents` pattern (create `DashboardEvents.LOADED` in `src/features/dashboard/*`) or centralize in `src/domain/telemetry.ts`. |
| `ui.dashboard.quick_action_clicked` | Log entry / Create alert quick actions | `src/components/board/QuickActions.tsx` | `src/pages/DashboardPage.tsx` | ⚠️ | **Missing event constant**: currently logged as string literal in `handleOpenLogEntryOverlay()` / `handleOpenCreateAlert()` with `{ action }` metadata. |
| `ui.dashboard.kpi_clicked` | KPI tile clicked (navigate to detail) | `src/components/board/KPITile.tsx` | `src/pages/DashboardPage.tsx` + `src/features/dashboard/KPIBar.tsx` | ⚠️ | **Missing event constant**: currently logged as string literal in `handleKpiClick()` with `{ kpi: item.label }`. |
| `ui.dashboard.holding_clicked` | Holdings row clicked | `src/components/dashboard/HoldingsList.tsx` | `src/features/dashboard/HoldingsCard.tsx` | ⚠️ | **Missing event constant**: currently logged as string literal before navigating with `{ symbol }`. |
| `ui.dashboard.trade_clicked` | Recent trade item clicked | `src/components/dashboard/TradeLogList.tsx` | `src/features/dashboard/TradeLogEntry.tsx` | ⚠️ | **Missing event constant**: currently logged as string literal on click with `{ symbol, tradeId }`. |

**Implementation**: Telemetry is wired directly in Dashboard page + dashboard components (no changes to protected telemetry service).

---

## Journal Domain Events

| Event | Trigger UI | Old Path | New Path | Status | Notes |
|-------|-----------|----------|----------|--------|-------|
| `ui.journal.created` | Journal entry created (Run Journal) | `src/pages/JournalPage.tsx` (submit via `useJournalV2`) | `src/features/journal-v2/hooks/useJournalV2.ts` | ✅ | Logged after successful persist: `Telemetry.log('ui.journal.created', 1, { journalVersion: 2, hasTradeContext })`. |
| `ui.journal.updated` | Journal entry updated | N/A | N/A | ⚠️ | Journal V2 flow currently has no edit/update action exposed. Hook needed when edit/overwrite of a persisted entry is added. |
| `ui.journal.deleted` | Journal entry deleted | N/A | N/A | ⚠️ | Journal V2 flow currently has no delete action exposed. Hook needed if/when history supports deletion. |
| `ui.journal.template_applied` | Template applied to current draft | `src/components/journal/templates/*` | `src/features/journal-v2/components/JournalInputForm.tsx` | ✅ | Logged when merge/overwrite is confirmed: `Telemetry.log('ui.journal.template_applied', 1, { templateId, mode })`. |
| `ui.journal.template_saved` | User saves custom template | `src/components/journal/templates/TemplateManagerSheet.tsx` | `src/components/journal/templates/TemplateManagerSheet.tsx` | ✅ | Logged on create/update: `Telemetry.log('ui.journal.template_saved', 1, { templateId, action })`. |
| `ui.journal.ai_notes_generated` | AI notes generation completed | `src/features/journal/AINotesGenerator.tsx` | `src/features/journal/AINotesGenerator.tsx` | ✅ | Logged on success: `Telemetry.log('ui.journal.ai_notes_generated', 1, { mode })`. |
| `ui.journal.entry_opened` | Journal entry detail opened | N/A | N/A | ⚠️ | Journal V2 history rows are currently non-interactive. Hook needed if history becomes clickable/selectable. |
| `ui.journal.filter_applied` | Filter applied to journal list | N/A | N/A | ⚠️ | Journal V2 page has no filter UI. Hook needed if filters are introduced. |

**Implementation**: Events are wired directly via `Telemetry.log()` in Journal V2 components/hooks (no Loveable store adapters used).

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
| `ui.oracle.insight_opened` | Oracle insight opened | `src/pages/OraclePage.tsx` (view analysis) | `src/components/oracle/OracleInsightCard.tsx` | ✅ | Wired via `Telemetry.log('ui.oracle.insight_opened', 1, { insightId })` when "View full analysis" is opened |
| `ui.oracle.filter_changed` | Oracle filter changed (All/New/Read) | N/A | `src/features/oracle/useOracle.ts` + `src/components/oracle/OracleFilters.tsx` | ✅ | Wired via `Telemetry.log('ui.oracle.filter_changed', 1, { filter })` on filter change |
| `ui.oracle.reward_claimed` | Oracle reward claimed (gamification) | N/A | N/A | ⚠️ | Sparkfined rewards are auto-granted on "Mark as Read" (protected `oracleStore`); no explicit "claim" UI exists in Loveable-style Oracle |
| `ui.oracle.insight_shared` | Oracle insight shared | N/A | (defer) | ⚠️ | **Missing**: Share functionality not in Loveable or Sparkfined. Defer to post-migration. |

**Implementation**: Wire events in `src/features/oracle/useOracle.ts` and Oracle UI components (`src/components/oracle/*`).

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
| `ui.settings.theme_changed` | Theme changed | `src/pages/SettingsContent.tsx` (Theme select) | `src/pages/SettingsContent.tsx` | ✅ | Logged on selection change: `Telemetry.log('ui.settings.theme_changed', 1, { theme })`. |
| `ui.settings.language_changed` | Language changed | N/A | N/A | ⚠️ | No language setting is currently exposed in Sparkfined Settings UI. Hook needed if language is added. |
| `ui.settings.export_started` | Data export initiated | `src/components/settings/JournalDataControls.tsx` (export buttons) | `src/components/settings/JournalDataControls.tsx` | ✅ | Logged for JSON/Markdown/full backup exports: `Telemetry.log('ui.settings.export_started', 1, { export })`. |
| `ui.settings.import_completed` | Data import completed | `src/components/settings/JournalDataControls.tsx` (import success) | `src/components/settings/JournalDataControls.tsx` | ✅ | Logged after successful import: `Telemetry.log('ui.settings.import_completed', 1, { imported, skipped, mode })`. |
| `ui.settings.factory_reset` | Factory reset executed | `src/pages/SettingsContent.tsx` (Danger Zone confirm) | `src/pages/SettingsContent.tsx` | ✅ | Logged after executing factory reset: `Telemetry.log('ui.settings.factory_reset', 1)`. |
| `ui.settings.notification_permission_requested` | Notification permission requested | `src/pages/SettingsContent.tsx` (Enable Browser Notifications) | `src/pages/SettingsContent.tsx` | ✅ | Logged before requesting permission: `Telemetry.log('ui.settings.notification_permission_requested', 1, { supported, previousPermission })`. |
| `ui.settings.telemetry_exported` | Telemetry data exported | N/A | N/A | ⚠️ | No explicit telemetry export action exists in current Settings UI (only queue send). Add export UI if required. |

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
