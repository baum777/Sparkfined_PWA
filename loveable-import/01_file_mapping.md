# Loveable → Sparkfined File Mapping (UI Replace + Adapter)

## Rules
- Copy UI layout/components from Loveable.
- **DO NOT** copy Loveable feature hooks if they represent business logic; use adapters calling Sparkfined stores/services.
- Sparkfined routes stay: `/dashboard`, `/journal`, `/lessons`, `/chart`, `/alerts`, `/settings`, `/watchlist`, `/oracle`, `/replay` (alias).
- Navigation config: Sparkfined `src/config/navigation.ts` is source of truth. Loveable config is **REFERENCE ONLY**.

---

## Protected Paths (DO NOT TOUCH)

These Sparkfined paths **MUST NOT** be overwritten:

### Stores & State Management
- `src/store/journalStore.ts` - Journal entries state
- `src/store/alertsStore.ts` - Alerts state + trigger engine
- `src/store/watchlistStore.ts` - Watchlist state
- `src/store/oracleStore.ts` - Oracle insights state
- `src/store/gamificationStore.ts` - XP/Journey system
- `src/store/userSettings.ts` - User preferences
- `src/store/chartUiStore.ts` - Chart UI state
- `src/store/walletStore.ts` - Wallet monitoring
- `src/store/eventBus.ts` - Event bus for cross-component communication

### Services & Engines
- `src/lib/TelemetryService.ts` - Telemetry logging (singleton)
- `src/lib/JournalService.ts` - Journal persistence (Dexie)
- `src/lib/data/marketOrchestrator.ts` - Market data fallback chain
- `src/lib/replay/ohlcReplayEngine.ts` - Replay engine

### Core Configuration
- `src/routes/RoutesRoot.tsx` - Router configuration
- `src/config/navigation.ts` - Navigation items (source of truth)
- `tailwind.config.ts` - Design tokens
- `playwright.config.ts` - E2E test config

---

## Tab 1: Dashboard

### Pages
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/pages/Dashboard.tsx` | `src/pages/DashboardPage.tsx` | **[REPLACE UI]** | Replace page structure; wire to Sparkfined stores via adapters |

### Components
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/components/dashboard/DailySnapshotCard.tsx` | `src/components/dashboard/DashboardKpiStrip.tsx` | **[REPLACE UI]** | KPI snapshot widget |
| `src/components/dashboard/QuickActionsCard.tsx` | `src/components/board/QuickActions.tsx` | **[ADAPT via adapter]** | Quick actions (FAB menu equivalent) |
| `src/components/dashboard/InsightCard.tsx` | `src/components/dashboard/InsightTeaser.tsx` | **[REPLACE UI]** | Oracle/AI insight teaser |
| `src/components/dashboard/AlertsSnapshotCard.tsx` | `src/components/dashboard/AlertsSnapshot.tsx` | **[REPLACE UI]** | Alerts overview widget |
| `src/components/dashboard/MasteryProgressCard.tsx` | New component | **[REPLACE UI]** | Add to `src/components/dashboard/` |
| `src/components/dashboard/HoldingsCard.tsx` | `src/components/dashboard/HoldingsList.tsx` | **[REPLACE UI]** | Holdings display |
| `src/components/dashboard/LastTradesCard.tsx` | `src/components/dashboard/TradeLogList.tsx` | **[REPLACE UI]** | Recent journal entries |
| `src/components/dashboard/DashboardEmptyState.tsx` | New component | **[REPLACE UI]** | Empty state when no entries exist |

### Features (Hooks/Logic)
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| N/A (uses `useTradesStore` directly) | `src/store/journalStore.ts` | **[DO NOT TOUCH]** | Adapter required: map `trades` → `entries` |
| N/A | `src/store/gamificationStore.ts` | **[DO NOT TOUCH]** | Adapter required for streak/XP/mastery |

---

## Tab 2: Journal

### Pages
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/pages/Journal.tsx` | `src/pages/JournalPage.tsx` | **[REPLACE UI]** | Replace page structure; wire to `journalStore` + `JournalService` |

### Components
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/features/journal/components/TradeEntryForm.tsx` | `src/features/journal/JournalForm.tsx` | **[REPLACE UI]** | Form for creating/editing entries |
| `src/features/journal/components/TemplateSelector.tsx` | `src/components/journal/templates/JournalTemplatePicker.tsx` | **[ADAPT via adapter]** | Template selection; preserve apply modes (overwrite/merge/suggest) |
| `src/components/journal/JournalProgress.tsx` | `src/components/journal/JournalJourneyBanner.tsx` | **[REPLACE UI]** | Journey progress indicator |
| `src/components/journal/JournalEmptyState.tsx` | New component | **[REPLACE UI]** | Empty state for journal list |
| `src/components/journal/AiNotesStatus.tsx` | `src/features/journal/AINotesGenerator.tsx` | **[ADAPT via adapter]** | AI notes generation status; wire to existing AI pipeline |

### Features (Hooks/Logic)
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/features/journal/useTradesStore.ts` | `src/store/journalStore.ts` | **[DO NOT TOUCH]** | **Adapter required**: `useTradesStoreAdapter()` maps `trades` ↔ `entries` |
| `src/features/journal/types.ts` (Trade) | `src/types/journal.ts` (JournalEntry) | **[REFERENCE ONLY]** | Adapt types in adapter layer |

**NOT ALLOWED TO USE DIRECTLY**:
- ❌ `useTradesStore()` from Loveable - must use adapter wrapper

---

## Tab 3: Learn / Lessons

### Pages
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/pages/Learn.tsx` | `src/pages/LessonsPage.tsx` | **[REPLACE UI]** | Route stays `/lessons`; label can be "Learn" |

### Components
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/components/lessons/LessonCard.tsx` | `src/components/signals/LessonCard.tsx` | **[REPLACE UI]** | Individual lesson card |
| `src/components/lessons/LessonFilters.tsx` | New component | **[REPLACE UI]** | Filter controls for lessons |
| `src/components/lessons/UnlockCallout.tsx` | New component | **[REPLACE UI]** | Unlock prerequisite callout |

### Features (Hooks/Logic)
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/hooks/useLessons.ts` | Existing lessons logic | **[ADAPT via adapter]** | Wire to Sparkfined lesson prerequisites/unlock logic |

---

## Tab 4: Chart + Replay

### Pages
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/pages/Chart.tsx` | `src/pages/ChartPage.tsx` | **[REPLACE UI]** | Chart page with replay mode support |
| `src/pages/Replay.tsx` | (integrated into ChartPage) | **[DO NOT CREATE]** | `/replay` route renders `ChartPage` with `mode="replay"` prop |

### Components
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/features/chart/ChartCanvas.tsx` | `src/features/chart/ChartCanvas.tsx` | **[ADAPT via adapter]** | Chart rendering; preserve existing integrations |
| `src/components/chart/ChartToolbar.tsx` | `src/features/chart/ChartToolbar.tsx` | **[REPLACE UI]** | Toolbar controls |
| `src/components/chart/ChartParamsHint.tsx` | New component | **[REPLACE UI]** | Hint UI for chart params |
| `src/components/chart/LogSetupCTA.tsx` | New component | **[REPLACE UI]** | CTA to create journal entry from chart |
| `src/components/ReplayPlayer.tsx` | `src/components/ReplayPlayer.tsx` | **[ADAPT via adapter]** | Replay controls; wire to `ohlcReplayEngine.ts` |

### Features (Hooks/Logic)
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/features/chart/replay.ts` | `src/lib/replay/ohlcReplayEngine.ts` | **[DO NOT TOUCH]** | **Adapter required**: `useReplayAdapter()` wraps engine |
| N/A | `src/features/chart/ChartLayout.tsx` | **[DO NOT TOUCH]** | Preserve section contract: TopBar, Sidebar, Toolbar, BottomPanel, Canvas |

**NOT ALLOWED TO USE DIRECTLY**:
- ❌ Loveable `replay.ts` logic - must use Sparkfined replay engine via adapter

---

## Tab 5: Alerts

### Pages
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/pages/Alerts.tsx` | `src/pages/AlertsPage.tsx` | **[REPLACE UI]** | Replace page structure; wire to `alertsStore` |

### Components
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/components/alerts/AlertCard.tsx` | `src/features/alerts/AlertCard.tsx` | **[REPLACE UI]** | Individual alert card |
| `src/components/alerts/AlertFilters.tsx` | `src/features/alerts/FiltersBar.tsx` | **[REPLACE UI]** | Filter controls |
| `src/components/alerts/AlertQuickCreate.tsx` | `src/features/alerts/NewAlertSheet.tsx` | **[REPLACE UI]** | Quick create form |
| `src/components/alerts/AlertDeleteConfirm.tsx` | New component | **[REPLACE UI]** | Delete confirmation dialog |
| `src/components/alerts/AlertsEmptyState.tsx` | New component | **[REPLACE UI]** | Empty state |

### Features (Hooks/Logic)
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/features/alerts/useAlerts.ts` | `src/store/alertsStore.ts` | **[DO NOT TOUCH]** | **Adapter required**: `useAlertsAdapter()` wraps store + trigger engine |
| `src/features/alerts/types.ts` | `src/store/alertsStore.ts` (inline types) | **[REFERENCE ONLY]** | Map types in adapter |

**NOT ALLOWED TO USE DIRECTLY**:
- ❌ `useAlerts()` from Loveable - must use adapter wrapper

---

## Tab 6: Settings

### Pages
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/pages/SettingsPage.tsx` | `src/pages/SettingsPage.tsx` + `src/pages/SettingsContent.tsx` | **[REPLACE UI]** | Layout replace; wire to existing stores/services |

### Components
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/components/settings/SettingsSection.tsx` | Existing settings cards | **[REPLACE UI]** | Section wrapper component |
| `src/components/settings/ThemeToggle.tsx` | `src/features/theme/useTheme.ts` | **[ADAPT via adapter]** | Theme switcher |
| `src/components/settings/DataExportImport.tsx` | `src/components/settings/JournalDataControls.tsx` | **[REPLACE UI]** | Export/import controls |
| `src/components/settings/FactoryReset.tsx` | `src/features/settings/DangerZoneAccordion.tsx` | **[REPLACE UI]** | Danger zone (factory reset) |
| `src/components/settings/SetupCompleteness.tsx` | New component | **[REPLACE UI]** | Setup progress indicator |

### Settings Domains (Wire to Existing)
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| Appearance settings | `src/store/userSettings.ts` | **[DO NOT TOUCH]** | Wire UI to existing store |
| Chart preferences | `src/store/chartUiStore.ts` | **[DO NOT TOUCH]** | Wire UI to existing store |
| Notifications | Browser permissions API | **[ADAPT via adapter]** | Wire to existing permission checks |
| Connected wallets | `src/store/walletStore.ts` | **[DO NOT TOUCH]** | Wire UI to existing store |
| Token usage / AI stats | `src/features/settings/TokenUsageCard.tsx` | **[DO NOT TOUCH]** | Wire UI to existing telemetry |
| Telemetry export | `src/lib/TelemetryService.ts` | **[DO NOT TOUCH]** | Wire UI to `Telemetry.dump()`, `Telemetry.exportCSV()` |

**Settings sections must remain functionally identical** (no feature removal).

---

## Tab 7: Watchlist

### Pages
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/pages/Watchlist.tsx` | `src/pages/WatchlistPage.tsx` | **[REPLACE UI]** | Replace page structure; wire to `watchlistStore` |

### Components
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/components/watchlist/WatchlistCard.tsx` | `src/components/watchlist/WatchlistTable.tsx` | **[REPLACE UI]** | List/table of watchlist items |
| `src/components/watchlist/WatchlistQuickAdd.tsx` | New component | **[REPLACE UI]** | Quick add form |
| `src/components/watchlist/WatchlistSymbolDetail.tsx` | `src/components/watchlist/WatchlistDetailPanel.tsx` | **[REPLACE UI]** | Detail panel for selected symbol |
| `src/components/watchlist/TrendPill.tsx` | New component | **[REPLACE UI]** | Trend indicator badge |
| `src/components/watchlist/WatchlistEmptyState.tsx` | New component | **[REPLACE UI]** | Empty state |

### Features (Hooks/Logic)
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/features/watchlist/useWatchlist.ts` | `src/store/watchlistStore.ts` | **[DO NOT TOUCH]** | **Adapter required**: `useWatchlistAdapter()` wraps store |

**NOT ALLOWED TO USE DIRECTLY**:
- ❌ `useWatchlist()` from Loveable - must use adapter wrapper

---

## Tab 8: Oracle

### Pages
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/pages/Oracle.tsx` | `src/pages/OraclePage.tsx` | **[REPLACE UI]** | Replace page structure; wire to `oracleStore` |

### Components
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/components/oracle/OracleInsightCard.tsx` | New component | **[REPLACE UI]** | Individual insight card |
| `src/components/oracle/OracleFilters.tsx` | `src/components/oracle/OracleThemeFilter.tsx` | **[REPLACE UI]** | Filter controls |
| `src/components/oracle/OracleTodayTakeaway.tsx` | New component | **[REPLACE UI]** | Daily takeaway summary |
| `src/components/oracle/OracleRewardBanner.tsx` | New component | **[REPLACE UI]** | Gamification reward banner |
| `src/components/oracle/OracleEmptyState.tsx` | New component | **[REPLACE UI]** | Empty state |

### Features (Hooks/Logic)
| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/features/oracle/useOracle.ts` | `src/store/oracleStore.ts` | **[DO NOT TOUCH]** | **Adapter required**: `useOracleAdapter()` wraps store |

**NOT ALLOWED TO USE DIRECTLY**:
- ❌ `useOracle()` from Loveable - must use adapter wrapper

---

## Shared UI Primitives (shadcn/ui)

| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/components/ui/*` (all primitives) | `src/components/ui/*` | **[REPLACE UI]** | Can replace/merge; **MUST** adapt to Sparkfined design tokens |

**Requirements**:
- No hardcoded colors - use Tailwind utilities from `tailwind.config.ts`
- Use existing `cn()` utility or bridge it
- Match existing component patterns (e.g., `Modal.tsx`, `RightSheet.tsx`)

---

## Shell / Navigation UI

| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/features/shell/AppShell.tsx` | `src/components/layout/AppShell.tsx` | **[REPLACE UI]** | Main app shell layout |
| `src/features/shell/AppSidebar.tsx` | `src/components/layout/Sidebar.tsx` | **[REPLACE UI]** | Desktop sidebar |
| `src/features/shell/AppHeader.tsx` | `src/components/layout/Topbar.tsx` | **[REPLACE UI]** | Top bar / header |
| `src/features/shell/MobileBottomNav.tsx` | `src/components/layout/BottomNav.tsx` | **[REPLACE UI]** | Mobile bottom navigation |
| `src/config/navigation.ts` | `src/config/navigation.ts` | **[DO NOT TOUCH]** | **Sparkfined is source of truth**; use Loveable config as reference only |

**Navigation Configuration**:
- Primary nav items: Dashboard, Journal, Chart, Watchlist, Alerts
- Secondary nav items: Signals, Oracle, Learn (label for `/lessons`), Showcase
- Settings: Separate item (not in primary/secondary groups)
- Route aliases: `/replay` highlights Chart tab

---

## Styles

| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/index.css` | `src/styles/*` | **[ADAPT via merge]** | Merge into Sparkfined global styles; **do not overwrite** existing resets |
| `src/App.css` | N/A | **[REFERENCE ONLY]** | Extract component-specific styles; do not create global App.css |

**Requirements**:
- Keep Sparkfined design tokens as truth
- Map Loveable colors to Sparkfined tokens (see `tailwind.config.ts`)
- Do not introduce new global CSS resets without review

---

## Hooks & Utilities

| Loveable | Sparkfined | Action | Notes |
|----------|-----------|--------|-------|
| `src/hooks/use-mobile.tsx` | `src/hooks/useMediaQuery.ts` (if exists) | **[ADAPT via adapter]** | Mobile detection hook |
| `src/hooks/use-toast.ts` | `src/components/ui/Toast.tsx` | **[ADAPT via adapter]** | Toast notifications; wire to existing toast system |
| `src/lib/utils.ts` | `src/lib/utils/` | **[ADAPT via merge]** | Utility functions; merge with existing utils |

---

## Summary of Action Categories

| Action | Meaning |
|--------|---------|
| **[REPLACE UI]** | Copy Loveable component structure; wire to Sparkfined data sources via adapters |
| **[ADAPT via adapter]** | Create adapter layer to map Loveable API to Sparkfined stores/services |
| **[REFERENCE ONLY]** | Do not import; use as reference to understand structure/patterns |
| **[DO NOT TOUCH]** | Protected Sparkfined path; must be preserved as-is |

---

## Migration Checklist

- [ ] Create adapter hooks for all tabs (see `ADAPTER_CATALOG.md`)
- [ ] Replace page components tab-by-tab
- [ ] Wire adapters to Sparkfined stores/services
- [ ] Update navigation labels (Learn for `/lessons`)
- [ ] Preserve all telemetry events (see `04_event_ledger.md`)
- [ ] Run validation commands after each tab:
  - [ ] `pnpm typecheck`
  - [ ] `pnpm lint`
  - [ ] `pnpm test`
  - [ ] `pnpm test:e2e`

---

**Last updated**: 2025-12-27
**Domain**: Loveable → Sparkfined Migration
