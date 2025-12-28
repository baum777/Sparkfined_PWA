# Adapter Catalog (Loveable UI API → Sparkfined Stores/Engines)

## Why Adapters?

Loveable UI expects hooks and data shapes from `loveable/src/features/*`.
Sparkfined **must keep** existing stores/engines (protected paths).
Adapters provide Loveable-compatible interfaces backed by Sparkfined business logic.

**Principle**: Loveable UI components remain unchanged; adapters translate between Loveable API expectations and Sparkfined reality.

---

## Global Adapters

### 1. Telemetry Helper (uiTelemetry)

**Purpose**: Simplify telemetry logging for UI components

**Location**: `src/lib/telemetry/uiTelemetry.ts` (new file)

**Contract**:
```typescript
export function uiLog(
  eventName: string, 
  value: number, 
  metadata?: Record<string, unknown>
): void;
```

**Implementation**:
```typescript
import { Telemetry } from '@/lib/TelemetryService';

export function uiLog(
  eventName: string, 
  value: number, 
  metadata?: Record<string, unknown>
): void {
  Telemetry.log(eventName, value, metadata);
}
```

**Usage**:
```typescript
import { uiLog } from '@/lib/telemetry/uiTelemetry';

// In UI component
uiLog('ui.alert.created', 1, { symbol: 'BTC', type: 'price-above' });
```

---

### 2. Navigation Helper

**Purpose**: Provide navigation utilities matching Loveable patterns

**Location**: `src/lib/navigation/navigationAdapter.ts` (new file)

**Contract**:
```typescript
export interface NavItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  testId: string;
  activeRoutes?: string[];
}

export function getPrimaryNavItems(): NavItem[];
export function getSecondaryNavItems(): NavItem[];
export function isActiveRoute(pathname: string, item: NavItem): boolean;
```

**Implementation**:
Maps Sparkfined `src/config/navigation.ts` to Loveable shape (if needed).

---

## Tab 1: Dashboard Adapters

### useDashboardStatsAdapter

**Purpose**: Provide KPI stats for dashboard cards

**Location**: `src/adapters/useDashboardStatsAdapter.ts` (new file)

**Expected API (Loveable expects)**:
```typescript
interface DashboardStats {
  totalTrades: number;
  alertsArmed: number;
  alertsTriggered: number;
  currentStreak: number;
  totalXP: number;
  masteryLevel: string;
  logEntryAvailable: boolean;
  logEntryDisabledReason?: string;
}

function useDashboardStatsAdapter(): DashboardStats;
```

**Sparkfined Sources**:
- `useJournalStore()` → `entries.length` (totalTrades)
- `useAlertsStore()` → `alerts.filter(a => a.status === 'armed').length` (alertsArmed)
- `useAlertsStore()` → `alerts.filter(a => a.status === 'triggered').length` (alertsTriggered)
- `useGamificationStore()` → `streak`, `xp`, `journeyPhase` (currentStreak, totalXP, masteryLevel)
- `useLogEntryAvailability()` → availability logic (logEntryAvailable, reason)

**Implementation Template**:
```typescript
import { useJournalStore } from '@/store/journalStore';
import { useAlertsStore } from '@/store/alertsStore';
import { useGamificationStore } from '@/store/gamificationStore';
import { useLogEntryAvailability } from '@/features/journal/useLogEntryAvailability';

export function useDashboardStatsAdapter() {
  const { entries } = useJournalStore();
  const { alerts } = useAlertsStore();
  const { streak, xp, journeyPhase } = useGamificationStore();
  const { available, reason } = useLogEntryAvailability();

  return {
    totalTrades: entries.length,
    alertsArmed: alerts.filter(a => a.status === 'armed').length,
    alertsTriggered: alerts.filter(a => a.status === 'triggered').length,
    currentStreak: streak,
    totalXP: xp,
    masteryLevel: journeyPhase,
    logEntryAvailable: available,
    logEntryDisabledReason: reason,
  };
}
```

---

### useHoldingsAdapter

**Purpose**: Provide holdings data for HoldingsCard

**Location**: `src/adapters/useHoldingsAdapter.ts` (new file)

**Expected API**:
```typescript
interface Holding {
  symbol: string;
  amount: number;
  value: number;
  change24h: number;
}

interface HoldingsData {
  holdings: Holding[];
  loading: boolean;
  error: string | null;
}

function useHoldingsAdapter(): HoldingsData;
```

**Sparkfined Sources**:
- `useWalletStore()` → connected wallets + holdings
- Existing holdings fetch logic (if exists in Dashboard components)

**Implementation Template**:
```typescript
import { useWalletStore } from '@/store/walletStore';

export function useHoldingsAdapter() {
  const { holdings, loading, error } = useWalletStore();

  // Transform Sparkfined holdings to Loveable shape if needed
  return {
    holdings: holdings.map(h => ({
      symbol: h.symbol,
      amount: h.amount,
      value: h.value,
      change24h: h.change24h ?? 0,
    })),
    loading,
    error,
  };
}
```

---

### useLastTradesAdapter

**Purpose**: Provide recent journal entries for LastTradesCard

**Location**: `src/adapters/useLastTradesAdapter.ts` (new file)

**Expected API**:
```typescript
interface Trade {
  id: string;
  title: string;
  date: string;
  direction: 'long' | 'short';
  pnl?: string;
}

function useLastTradesAdapter(count?: number): Trade[];
```

**Sparkfined Sources**:
- `useJournalStore()` → `entries.slice(0, count)`

**Implementation Template**:
```typescript
import { useJournalStore } from '@/store/journalStore';

export function useLastTradesAdapter(count = 5) {
  const { entries } = useJournalStore();

  return entries.slice(0, count).map(entry => ({
    id: entry.id,
    title: entry.title,
    date: entry.date,
    direction: entry.direction,
    pnl: entry.pnl,
  }));
}
```

---

## Tab 2: Journal Adapters

### useTradesStoreAdapter

**Purpose**: Map Sparkfined `journalStore` to Loveable `useTradesStore` API

**Location**: `src/adapters/useTradesStoreAdapter.ts` (new file)

**Expected API (Loveable expects)**:
```typescript
interface Trade {
  id: string;
  symbol?: string;
  direction: 'long' | 'short';
  entryPrice?: number;
  exitPrice?: number;
  notes?: string;
  tags?: string[];
  createdAt: string;
}

interface TradesStore {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'createdAt'>) => void;
  updateTrade: (id: string, updates: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  hasTrades: boolean;
  getRecentTrades: (count: number) => Trade[];
}

function useTradesStoreAdapter(): TradesStore;
```

**Sparkfined Sources**:
- `useJournalStore()` → `entries`, `addEntry`, `updateEntry`, `removeEntry`

**Type Mapping**:
| Loveable | Sparkfined | Transformation |
|----------|-----------|----------------|
| `Trade` | `JournalEntry` | Map fields: title, date, direction, notes, tags |
| `trades` | `entries` | Direct mapping |
| `addTrade` | `addEntry` | Wrap with type conversion |
| `updateTrade` | `updateEntry` | Wrap with partial update support |
| `deleteTrade` | `removeEntry` | Direct mapping |

**Implementation Template**:
```typescript
import { useJournalStore } from '@/store/journalStore';
import type { JournalEntry } from '@/types/journal';
import { uiLog } from '@/lib/telemetry/uiTelemetry';

export function useTradesStoreAdapter() {
  const { entries, addEntry, updateEntry, removeEntry } = useJournalStore();

  return {
    trades: entries.map(entryToTrade),
    addTrade: (trade) => {
      const entry = tradeToEntry(trade);
      addEntry(entry);
      uiLog('ui.journal.created', 1, { direction: trade.direction });
    },
    updateTrade: (id, updates) => {
      const entry = entries.find(e => e.id === id);
      if (entry) {
        updateEntry({ ...entry, ...updates });
        uiLog('ui.journal.updated', 1);
      }
    },
    deleteTrade: async (id) => {
      await removeEntry(id);
      uiLog('ui.journal.deleted', 1);
    },
    hasTrades: entries.length > 0,
    getRecentTrades: (count) => entries.slice(0, count).map(entryToTrade),
  };
}

function entryToTrade(entry: JournalEntry): Trade {
  return {
    id: entry.id,
    symbol: entry.tags?.[0], // First tag as symbol (adapt as needed)
    direction: entry.direction,
    notes: entry.notes,
    tags: entry.tags,
    createdAt: entry.date,
  };
}

function tradeToEntry(trade: Partial<Trade>): Partial<JournalEntry> {
  return {
    title: trade.symbol || 'Untitled',
    direction: trade.direction || 'long',
    notes: trade.notes,
    tags: trade.tags,
  };
}
```

---

### useTemplatesAdapter

**Purpose**: Provide journal templates with apply modes

**Location**: `src/adapters/useTemplatesAdapter.ts` (new file)

**Expected API**:
```typescript
interface Template {
  id: string;
  name: string;
  fields: Record<string, any>;
}

interface TemplatesAdapter {
  templates: Template[];
  applyTemplate: (
    templateId: string, 
    mode: 'overwrite' | 'merge' | 'suggest'
  ) => void;
}

function useTemplatesAdapter(): TemplatesAdapter;
```

**Sparkfined Sources**:
- `useJournalTemplates()` → existing template logic
- `src/components/journal/templates/template-utils.ts`

**Implementation Template**:
```typescript
import { useJournalTemplates } from '@/components/journal/templates/useJournalTemplates';

export function useTemplatesAdapter() {
  const { templates, applyTemplate: apply } = useJournalTemplates();

  return {
    templates: templates.map(t => ({
      id: t.id,
      name: t.name,
      fields: t.fields,
    })),
    applyTemplate: (templateId, mode) => {
      apply(templateId, mode);
      uiLog('ui.template.applied', 1, { templateId, mode });
    },
  };
}
```

---

### useAiNotesAdapter

**Purpose**: Wire AI notes generation status to existing AI pipeline

**Location**: `src/adapters/useAiNotesAdapter.ts` (new file)

**Expected API**:
```typescript
interface AiNotesStatus {
  status: 'idle' | 'generating' | 'success' | 'error';
  mode: 'demo' | 'offline' | 'real';
  tokensRemaining?: number;
}

function useAiNotesAdapter(): AiNotesStatus;
```

**Sparkfined Sources**:
- Existing AI pipeline status (if exists)
- Token usage tracking

**Implementation Template**:
```typescript
export function useAiNotesAdapter() {
  // Wire to existing AI pipeline
  return {
    status: 'offline', // Adapt based on actual AI pipeline
    mode: 'offline',
    tokensRemaining: undefined,
  };
}
```

---

## Tab 3: Lessons Adapters

### useLessonsAdapter

**Purpose**: Provide lessons with unlock logic

**Location**: `src/adapters/useLessonsAdapter.ts` (new file)

**Expected API**:
```typescript
interface Lesson {
  id: string;
  title: string;
  description: string;
  locked: boolean;
  prerequisite?: string;
}

interface LessonsAdapter {
  lessons: Lesson[];
  filter: string;
  setFilter: (filter: string) => void;
}

function useLessonsAdapter(): LessonsAdapter;
```

**Sparkfined Sources**:
- `src/hooks/useLessons.ts` (if exists)
- Existing lessons logic in `LessonsPage.tsx`

**Implementation Template**:
```typescript
import { useState } from 'react';
// Import existing lessons logic

export function useLessonsAdapter() {
  const [filter, setFilter] = useState('all');
  
  // Wire to Sparkfined lessons logic
  const lessons = []; // Get from existing source

  return {
    lessons,
    filter,
    setFilter,
  };
}
```

---

## Tab 4: Chart + Replay Adapters

### useChartLayoutAdapter

**Purpose**: Preserve ChartLayout section contracts

**Location**: `src/adapters/useChartLayoutAdapter.ts` (new file)

**Expected API**:
```typescript
interface ChartLayoutSections {
  TopBar: React.ComponentType;
  Sidebar: React.ComponentType;
  Toolbar: React.ComponentType;
  BottomPanel: React.ComponentType;
  Canvas: React.ComponentType;
}

function useChartLayoutAdapter(): ChartLayoutSections;
```

**Sparkfined Sources**:
- `src/features/chart/ChartLayout.tsx` → existing section components

**Implementation**: Direct export of existing sections.

---

### useReplayAdapter

**Purpose**: Wire Loveable replay UI to Sparkfined replay engine

**Location**: `src/adapters/useReplayAdapter.ts` (new file)

**Expected API**:
```typescript
interface ReplayControls {
  isReplayMode: boolean;
  isPaused: boolean;
  speed: number;
  currentTimestamp: number;
  sessionId?: string;
  toggleReplay: () => void;
  togglePause: () => void;
  setSpeed: (speed: number) => void;
  seek: (timestamp: number) => void;
}

function useReplayAdapter(): ReplayControls;
```

**Sparkfined Sources**:
- `src/lib/replay/ohlcReplayEngine.ts` (protected; do not edit)
- Existing replay state management

**Implementation Template**:
```typescript
// Wire to existing replay engine
export function useReplayAdapter() {
  // Get state from existing replay engine
  return {
    isReplayMode: false,
    isPaused: false,
    speed: 1,
    currentTimestamp: Date.now(),
    sessionId: undefined,
    toggleReplay: () => {
      uiLog('ui.replay.toggled', 1);
    },
    togglePause: () => {
      uiLog('ui.replay.paused', 1);
    },
    setSpeed: (speed) => {
      uiLog('ui.replay.speed_changed', speed);
    },
    seek: (timestamp) => {
      uiLog('ui.replay.seeked', 1, { timestamp });
    },
  };
}
```

---

### useChartTelemetryAdapter

**Purpose**: Log chart-specific telemetry events

**Location**: `src/adapters/useChartTelemetryAdapter.ts` (new file)

**Expected API**:
```typescript
interface ChartTelemetry {
  logIndicatorAdded: (indicator: string) => void;
  logDrawingCreated: (type: string) => void;
  logTimeframeChanged: (timeframe: string) => void;
}

function useChartTelemetryAdapter(): ChartTelemetry;
```

**Implementation**:
```typescript
import { uiLog } from '@/lib/telemetry/uiTelemetry';

export function useChartTelemetryAdapter() {
  return {
    logIndicatorAdded: (indicator) => {
      uiLog('ui.chart.indicator_added', 1, { indicator });
    },
    logDrawingCreated: (type) => {
      uiLog('ui.chart.drawing_created', 1, { type });
    },
    logTimeframeChanged: (timeframe) => {
      uiLog('ui.chart.timeframe_changed', 1, { timeframe });
    },
  };
}
```

---

## Tab 5: Alerts Adapters

### useAlertsAdapter

**Purpose**: Map Sparkfined `alertsStore` to Loveable `useAlerts` API

**Location**: `src/adapters/useAlertsAdapter.ts` (new file)

**Expected API (Loveable expects)**:
```typescript
interface Alert {
  id: string;
  symbol: string;
  condition: string;
  targetPrice: number;
  status: 'active' | 'triggered' | 'paused';
  createdAt: Date;
}

type FilterType = 'all' | 'active' | 'triggered' | 'paused';

interface AlertsAdapter {
  alerts: Alert[];
  filteredAlerts: Alert[];
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  clearFilter: () => void;
  createAlert: (symbol: string, condition: string, targetPrice: number) => void;
  deleteAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
}

function useAlertsAdapter(): AlertsAdapter;
```

**Sparkfined Sources**:
- `useAlertsStore()` → `alerts`, `createAlert`, `updateAlert`, `deleteAlert`

**Type Mapping**:
| Loveable | Sparkfined | Transformation |
|----------|-----------|----------------|
| `Alert` | `Alert` | Map status: 'armed' → 'active', type: 'price-above' → 'Price above' |
| `filter` | Local state | Manage filter state in adapter |
| `createAlert` | `createAlert` | Map params to Sparkfined format |
| `toggleAlert` | `updateAlert` | Toggle status: active ↔ paused |

**Implementation Template**:
```typescript
import { useState, useMemo } from 'react';
import { useAlertsStore } from '@/store/alertsStore';
import { uiLog } from '@/lib/telemetry/uiTelemetry';

export function useAlertsAdapter() {
  const { alerts, createAlert, updateAlert, deleteAlert } = useAlertsStore();
  const [filter, setFilter] = useState<FilterType>('all');

  const transformedAlerts = useMemo(() => {
    return alerts.map(a => ({
      id: a.id,
      symbol: a.symbol,
      condition: a.type === 'price-above' ? 'Price above' : 'Price below',
      targetPrice: a.threshold,
      status: a.status === 'armed' ? 'active' : a.status,
      createdAt: new Date(a.createdAt),
    }));
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    if (filter === 'all') return transformedAlerts;
    return transformedAlerts.filter(a => a.status === filter);
  }, [transformedAlerts, filter]);

  return {
    alerts: transformedAlerts,
    filteredAlerts,
    filter,
    setFilter,
    clearFilter: () => setFilter('all'),
    createAlert: (symbol, condition, targetPrice) => {
      const type = condition.toLowerCase().includes('above') 
        ? 'price-above' 
        : 'price-below';
      createAlert({
        symbol,
        type,
        condition,
        threshold: targetPrice,
        timeframe: '1h',
      });
      uiLog('ui.alert.created', 1, { symbol, type });
    },
    deleteAlert: (id) => {
      deleteAlert(id);
      uiLog('ui.alert.deleted', 1);
    },
    toggleAlert: (id) => {
      const alert = alerts.find(a => a.id === id);
      if (alert) {
        updateAlert(id, {
          status: alert.status === 'armed' ? 'paused' : 'armed',
        });
        uiLog('ui.alert.toggled', 1, { 
          status: alert.status === 'armed' ? 'paused' : 'armed' 
        });
      }
    },
  };
}
```

---

## Tab 6: Settings Adapters

### useThemeAdapter

**Purpose**: Wire theme toggle to existing theme system

**Location**: `src/adapters/useThemeAdapter.ts` (new file)

**Expected API**:
```typescript
interface ThemeAdapter {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

function useThemeAdapter(): ThemeAdapter;
```

**Sparkfined Sources**:
- `useTheme()` from `src/features/theme/useTheme.ts`

**Implementation Template**:
```typescript
import { useTheme } from '@/features/theme/useTheme';

export function useThemeAdapter() {
  const { theme, setTheme } = useTheme();

  return {
    theme,
    setTheme: (newTheme) => {
      setTheme(newTheme);
      uiLog('ui.settings.theme_changed', 1, { theme: newTheme });
    },
  };
}
```

---

### useSettingsAdapter

**Purpose**: Centralize all settings state access

**Location**: `src/adapters/useSettingsAdapter.ts` (new file)

**Expected API**:
```typescript
interface SettingsAdapter {
  appearance: { theme: string; language: string };
  chart: { defaultTimeframe: string; indicators: string[] };
  notifications: { enabled: boolean; permission: NotificationPermission };
  wallet: { connected: boolean; address?: string };
  tokenUsage: { used: number; limit: number };
  updateAppearance: (updates: Partial<typeof appearance>) => void;
  updateChartPrefs: (updates: Partial<typeof chart>) => void;
  requestNotificationPermission: () => Promise<void>;
}

function useSettingsAdapter(): SettingsAdapter;
```

**Sparkfined Sources**:
- `useUserSettings()` → appearance, language
- `useChartUiStore()` → chart preferences
- Browser permissions API → notifications
- `useWalletStore()` → wallet connection
- Telemetry → token usage

**Implementation**: Wire to multiple Sparkfined stores.

---

## Tab 7: Watchlist Adapters

### useWatchlistAdapter

**Purpose**: Map Sparkfined `watchlistStore` to Loveable API

**Location**: `src/adapters/useWatchlistAdapter.ts` (new file)

**Expected API**:
```typescript
interface WatchlistItem {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
}

interface WatchlistAdapter {
  items: WatchlistItem[];
  addItem: (symbol: string) => void;
  removeItem: (id: string) => void;
  loading: boolean;
}

function useWatchlistAdapter(): WatchlistAdapter;
```

**Sparkfined Sources**:
- `useWatchlistStore()` → watchlist items

**Implementation Template**:
```typescript
import { useWatchlistStore } from '@/store/watchlistStore';
import { uiLog } from '@/lib/telemetry/uiTelemetry';

export function useWatchlistAdapter() {
  const { items, addItem, removeItem, loading } = useWatchlistStore();

  return {
    items: items.map(i => ({
      id: i.id,
      symbol: i.symbol,
      price: i.price,
      change24h: i.change24h ?? 0,
    })),
    addItem: (symbol) => {
      addItem(symbol);
      uiLog('ui.watchlist.added', 1, { symbol });
    },
    removeItem: (id) => {
      removeItem(id);
      uiLog('ui.watchlist.removed', 1);
    },
    loading,
  };
}
```

---

## Tab 8: Oracle Adapters

### useOracleAdapter

**Purpose**: Map Sparkfined `oracleStore` to Loveable API

**Location**: `src/adapters/useOracleAdapter.ts` (new file)

**Expected API**:
```typescript
interface OracleInsight {
  id: string;
  title: string;
  content: string;
  theme: string;
  timestamp: Date;
}

interface OracleAdapter {
  insights: OracleInsight[];
  filter: string;
  setFilter: (filter: string) => void;
  loading: boolean;
}

function useOracleAdapter(): OracleAdapter;
```

**Sparkfined Sources**:
- `useOracleStore()` → oracle insights

**Implementation Template**:
```typescript
import { useState } from 'react';
import { useOracleStore } from '@/store/oracleStore';

export function useOracleAdapter() {
  const { insights, loading } = useOracleStore();
  const [filter, setFilter] = useState('all');

  const filteredInsights = filter === 'all' 
    ? insights 
    : insights.filter(i => i.theme === filter);

  return {
    insights: filteredInsights,
    filter,
    setFilter: (newFilter) => {
      setFilter(newFilter);
      uiLog('ui.oracle.filter_changed', 1, { filter: newFilter });
    },
    loading,
  };
}
```

---

## Adapter Implementation Checklist

For each adapter:
- [ ] Create adapter file in `src/adapters/`
- [ ] Import Sparkfined stores/services (protected paths)
- [ ] Map types: Loveable shape → Sparkfined shape
- [ ] Wrap mutations with telemetry: `uiLog(eventName, value, metadata)`
- [ ] Export single hook with Loveable-compatible API
- [ ] Add JSDoc comments for usage examples
- [ ] Test adapter with Loveable UI components

---

## Testing Adapters

**Unit tests** (recommended):
```typescript
// tests/adapters/useAlertsAdapter.test.ts
import { renderHook } from '@testing-library/react';
import { useAlertsAdapter } from '@/adapters/useAlertsAdapter';

describe('useAlertsAdapter', () => {
  it('maps Sparkfined alerts to Loveable shape', () => {
    const { result } = renderHook(() => useAlertsAdapter());
    expect(result.current.alerts).toBeDefined();
  });

  it('logs telemetry on createAlert', () => {
    const { result } = renderHook(() => useAlertsAdapter());
    result.current.createAlert('BTC', 'Price above', 70000);
    // Assert Telemetry.log was called
  });
});
```

---

## Summary of Adapters

| Tab | Adapter Hook(s) | Sparkfined Source(s) | Status |
|-----|----------------|---------------------|--------|
| Global | `uiLog()`, `navigationAdapter` | `TelemetryService`, `navigation.ts` | Required |
| Dashboard | `useDashboardStatsAdapter`, `useHoldingsAdapter`, `useLastTradesAdapter` | `journalStore`, `alertsStore`, `gamificationStore`, `walletStore` | Required |
| Journal | `useTradesStoreAdapter`, `useTemplatesAdapter`, `useAiNotesAdapter` | `journalStore`, `JournalService`, templates | Required |
| Learn | `useLessonsAdapter` | Existing lessons logic | Required |
| Chart | `useChartLayoutAdapter`, `useReplayAdapter`, `useChartTelemetryAdapter` | `ChartLayout`, `ohlcReplayEngine` | Required |
| Alerts | `useAlertsAdapter` | `alertsStore` | Required |
| Settings | `useThemeAdapter`, `useSettingsAdapter` | `userSettings`, `chartUiStore`, `walletStore` | Required |
| Watchlist | `useWatchlistAdapter` | `watchlistStore` | Required |
| Oracle | `useOracleAdapter` | `oracleStore` | Required |

---

**Implementation Order** (recommended):
1. Global adapters (telemetry, navigation)
2. Journal adapters (most complex type mapping)
3. Alerts adapters (clear CRUD operations)
4. Dashboard adapters (depends on journal/alerts)
5. Settings adapters (multiple stores)
6. Watchlist, Oracle, Learn adapters (simpler)
7. Chart adapters (complex, depends on existing engine)

---

**Last updated**: 2025-12-27
**Domain**: Loveable → Sparkfined Migration
