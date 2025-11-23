# 🎯 Codex Handover: Advanced Charts Implementation (Lightweight Charts)

**Version:** 1.0
**Datum:** 2025-11-23
**Ziel-Branch:** `codex/advanced-charts-lightweight`
**Geschätzter Aufwand:** 3-5 Tage
**Status:** 🟢 Ready for Implementation

---

## 📋 Kurzkontext

### Was ist das Ziel?

Implementierung des **Advanced Charts Stack** als R0-Core-Feature für Sparkfined PWA mit:
- **Lightweight Charts** (TradingView-Library) als Chart-Engine
- **OHLC-Daten** von `/api/data/ohlc` (DexPaprika → Moralis → Dexscreener Fallback)
- **Offline-First**: Dexie-Cache für OHLC + Chart-Snapshots
- **Replay-Integration**: Gleicher Chart-Stack für ChartPageV2 + ReplayPage
- **Production-Ready**: TypeScript strict mode, Tests, PWA-kompatibel

### Warum ist es wichtig?

- **R0-Blocker**: Advanced Charts ist als "Production-Ready" dokumentiert, aber aktuell nur Stub
- **User-Journey**: Chart ist zentrales Feature für Token-Analyse + Journal-Integration
- **Architektur**: Offline-First-Architektur erfordert konsistenten Cache-Layer
- **Testing**: Ohne Chart-Implementation sind E2E-Tests unvollständig

---

## 🎯 Definition of Done (DoD)

### Funktional

- [ ] ChartPageV2 rendert interaktive Lightweight-Charts (Candlestick + Volume)
- [ ] Timeframe-Switcher funktioniert (15m, 1h, 4h, 1d)
- [ ] Indicators-Panel: SMA, EMA, RSI, Bollinger Bands togglebar
- [ ] ReplayPage nutzt gleichen Chart-Stack (Replay-Mode mit Frame-Sync)
- [ ] Offline-Modus: Cached OHLC-Daten werden gerendert (wenn verfügbar)
- [ ] Chart-Snapshots: User kann Chart-State speichern + wiederherstellen

### Code-Qualität

- [ ] TypeScript-Strict-Mode: Keine `any` ohne `// @ts-expect-error` Begründung
- [ ] ESLint: Keine Errors (`pnpm lint` grün)
- [ ] Typecheck: Keine Errors (`pnpm typecheck` grün)
- [ ] Build: Erfolgreicher Produktiv-Build (`pnpm build`)

### Tests

- [ ] Unit: `useOhlcData` Hook (Cache Hit/Miss, Network Failure, Refresh)
- [ ] Unit: `chartSnapshots` Helper (put/get/isSnapshotFresh/prune)
- [ ] Component: `ChartPageV2` (Timeframe-Wechsel, Loading/Error-States)
- [ ] E2E: "Advanced Charts öffnen & Timeframe switchen" (Playwright)
- [ ] E2E: "Offline Chart mit Snapshot" (Playwright)

### Dokumentation

- [ ] Inline-Kommentare für komplexe Chart-Logik
- [ ] JSDoc für alle exported functions/types
- [ ] TODO-Comments mit `TODO[Prio]:` Format für bekannte Tech-Debt

---

## 🏗️ Dateistruktur & Implementierungsplan

### Phase 1: Domain-Typen & Dexie-Schema

#### 1.1 Domain-Typen definieren

**Datei:** `src/domain/chart.ts` (neu erstellen)

```typescript
/**
 * Chart-Domain-Typen für Sparkfined PWA
 * Konsolidiert Chart + Replay + OHLC in einem Typ-System
 */

// ===== Timeframes =====
export type ChartTimeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

export const TIMEFRAME_LABELS: Record<ChartTimeframe, string> = {
  '1m': '1 Minute',
  '5m': '5 Minutes',
  '15m': '15 Minutes',
  '1h': '1 Hour',
  '4h': '4 Hours',
  '1d': '1 Day',
  '1w': '1 Week',
};

export const TIMEFRAME_ORDER: ChartTimeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];

// ===== OHLC Candle =====
export interface OhlcCandle {
  /** Unix timestamp in milliseconds */
  t: number;
  /** Open price */
  o: number;
  /** High price */
  h: number;
  /** Low price */
  l: number;
  /** Close price */
  c: number;
  /** Volume (optional) */
  v?: number;
}

// ===== Chart View State =====
export interface ChartViewState {
  /** Selected timeframe */
  timeframe: ChartTimeframe;
  /** Active indicators */
  indicators: {
    sma?: { period: number; color: string };
    ema?: { period: number; color: string };
    rsi?: { period: number; overbought: number; oversold: number };
    bollinger?: { period: number; stdDev: number };
  };
  /** Chart visual settings */
  visual: {
    showVolume: boolean;
    showGrid: boolean;
    candleStyle: 'candle' | 'hollow' | 'line';
  };
  /** Zoom & Pan state */
  viewport?: {
    fromTime?: number;
    toTime?: number;
    scale?: number;
  };
}

// ===== Chart Snapshot (für Dexie-Cache) =====
export interface BoardChartSnapshot {
  id?: number; // Auto-increment
  /** Solana token address */
  address: string;
  /** Symbol (e.g. "SOL", "BONK") */
  symbol: string;
  /** Timeframe */
  timeframe: ChartTimeframe;
  /** Cached OHLC data */
  ohlc: OhlcCandle[];
  /** Chart view state (indicators, zoom, etc.) */
  viewState: ChartViewState;
  /** Snapshot metadata */
  metadata: {
    createdAt: number;
    lastFetchedAt: number;
    fetchedFrom: 'dexpaprika' | 'moralis' | 'dexscreener' | 'cache';
    /** Number of candles */
    candleCount: number;
  };
}

// ===== OHLC Fetch Status =====
export type OhlcFetchStatus =
  | { status: 'idle' }
  | { status: 'loading'; progress?: number }
  | { status: 'success'; data: OhlcCandle[]; provider: string; cachedAt: number }
  | { status: 'error'; error: Error; lastSuccessfulData?: OhlcCandle[] };

// ===== Replay-spezifische Typen =====
export interface ReplayChartState extends ChartViewState {
  /** Current frame index */
  currentFrame: number;
  /** Total frames available */
  totalFrames: number;
  /** Playback speed multiplier */
  speed: 1 | 2 | 4 | 8;
  /** Is playing */
  isPlaying: boolean;
}
```

---

#### 1.2 Dexie-Schema erweitern

**Datei:** `src/db/chartSnapshots.ts` (neu erstellen)

```typescript
/**
 * Chart Snapshots Dexie Layer
 * Persistiert Chart-Snapshots für Offline-Modus + schnelle Wiederherstellung
 */

import { boardDB } from '@/lib/db-board';
import type { BoardChartSnapshot, ChartTimeframe, OhlcCandle } from '@/domain/chart';

// ===== CRUD Operations =====

/**
 * Speichert oder aktualisiert Chart-Snapshot
 */
export async function putChartSnapshot(snapshot: Omit<BoardChartSnapshot, 'id'>): Promise<number> {
  // Check if snapshot exists (by address + timeframe)
  const existing = await boardDB.charts
    .where('[symbol+timeframe]')
    .equals([snapshot.symbol, snapshot.timeframe])
    .first();

  if (existing?.id) {
    // Update existing
    await boardDB.charts.update(existing.id, {
      ...snapshot,
      metadata: {
        ...snapshot.metadata,
        createdAt: existing.metadata?.createdAt || Date.now(),
        lastFetchedAt: Date.now(),
      },
    });
    return existing.id;
  } else {
    // Insert new
    return await boardDB.charts.add({
      ...snapshot,
      metadata: {
        ...snapshot.metadata,
        createdAt: Date.now(),
        lastFetchedAt: Date.now(),
      },
    } as any);
  }
}

/**
 * Lädt Chart-Snapshot (falls vorhanden)
 */
export async function getChartSnapshot(
  address: string,
  timeframe: ChartTimeframe
): Promise<BoardChartSnapshot | undefined> {
  return await boardDB.charts
    .where({ symbol: address, timeframe })
    .first() as BoardChartSnapshot | undefined;
}

/**
 * Prüft, ob Snapshot "frisch" ist (< 5 Minuten alt)
 */
export function isSnapshotFresh(snapshot: BoardChartSnapshot, maxAgeMs: number = 5 * 60 * 1000): boolean {
  const age = Date.now() - snapshot.metadata.lastFetchedAt;
  return age < maxAgeMs;
}

/**
 * Löscht alte Chart-Snapshots (> 24h)
 */
export async function pruneOldChartSnapshots(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<number> {
  const cutoff = Date.now() - maxAgeMs;
  return await boardDB.charts
    .where('metadata.lastFetchedAt')
    .below(cutoff)
    .delete();
}

/**
 * Exportiert alle Chart-Snapshots als JSON (für Debugging)
 */
export async function exportChartSnapshotsJSON(): Promise<string> {
  const snapshots = await boardDB.charts.toArray();
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      count: snapshots.length,
      snapshots,
    },
    null,
    2
  );
}
```

**Hinweis:** Die `ChartSession` Table in `db-board.ts` muss erweitert werden, um `BoardChartSnapshot`-Schema zu unterstützen. Codex sollte das bestehende Schema anpassen:

```diff
// In src/lib/db-board.ts

export interface ChartSession {
  id?: number;
  symbol: string;
  timeframe: string;
  timestamp: number;
- sessionDuration?: number;
+ ohlc?: OhlcCandle[]; // Neu: OHLC-Daten
+ viewState?: ChartViewState; // Neu: Chart-View-State
  metadata?: {
-   entryPrice?: number;
-   exitPrice?: number;
-   notes?: string;
+   createdAt: number;
+   lastFetchedAt: number;
+   fetchedFrom: 'dexpaprika' | 'moralis' | 'dexscreener' | 'cache';
+   candleCount: number;
  };
}

// Und Index anpassen:
this.version(2).stores({
- charts: '++id, symbol, timeframe, timestamp',
+ charts: '++id, symbol, timeframe, [symbol+timeframe], metadata.lastFetchedAt',
  // ...
});
```

---

### Phase 2: OHLC-Fetch Hook implementieren

**Datei:** `src/hooks/useOhlcData.ts` (neu erstellen)

```typescript
/**
 * useOhlcData Hook
 * Fetcht OHLC-Daten von /api/data/ohlc mit automatischem Dexie-Cache
 *
 * Features:
 * - Cache-First-Pattern (wenn Snapshot frisch)
 * - Network-First-Pattern (wenn Snapshot veraltet)
 * - Offline-Fallback (cached data wenn verfügbar)
 * - Auto-Refresh bei Timeframe-Wechsel
 */

import { useState, useEffect, useCallback } from 'react';
import type { OhlcCandle, ChartTimeframe, OhlcFetchStatus } from '@/domain/chart';
import { getChartSnapshot, putChartSnapshot, isSnapshotFresh } from '@/db/chartSnapshots';

interface UseOhlcDataOptions {
  /** Solana token address */
  address: string;
  /** Timeframe */
  timeframe: ChartTimeframe;
  /** Max candle count (default: 600) */
  limit?: number;
  /** Auto-fetch on mount (default: true) */
  autoFetch?: boolean;
  /** Cache TTL in ms (default: 5 minutes) */
  cacheTTL?: number;
}

interface UseOhlcDataReturn {
  /** Current fetch status */
  status: OhlcFetchStatus;
  /** OHLC data (from cache or network) */
  data: OhlcCandle[] | null;
  /** Manually trigger refresh */
  refresh: () => Promise<void>;
  /** Is loading */
  isLoading: boolean;
  /** Error object (if any) */
  error: Error | null;
  /** Provider source */
  provider: string | null;
}

export function useOhlcData(options: UseOhlcDataOptions): UseOhlcDataReturn {
  const {
    address,
    timeframe,
    limit = 600,
    autoFetch = true,
    cacheTTL = 5 * 60 * 1000,
  } = options;

  const [status, setStatus] = useState<OhlcFetchStatus>({ status: 'idle' });
  const [data, setData] = useState<OhlcCandle[] | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  const fetchOhlc = useCallback(async () => {
    setStatus({ status: 'loading' });

    try {
      // 1. Check cache first
      const snapshot = await getChartSnapshot(address, timeframe);
      if (snapshot && isSnapshotFresh(snapshot, cacheTTL)) {
        console.log('[useOhlcData] Cache hit (fresh):', snapshot.metadata);
        setData(snapshot.ohlc);
        setProvider(snapshot.metadata.fetchedFrom);
        setStatus({
          status: 'success',
          data: snapshot.ohlc,
          provider: snapshot.metadata.fetchedFrom,
          cachedAt: snapshot.metadata.lastFetchedAt,
        });
        return;
      }

      // 2. Fetch from network
      const secret = import.meta.env.VITE_DATA_PROXY_SECRET || '';
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (secret) {
        headers['Authorization'] = `Bearer ${secret}`;
      }

      const response = await fetch(
        `/api/data/ohlc?address=${encodeURIComponent(address)}&tf=${encodeURIComponent(timeframe)}&limit=${limit}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`OHLC fetch failed: ${response.status} ${response.statusText}`);
      }

      const body = await response.json();
      if (!body.ok || !Array.isArray(body.data)) {
        throw new Error('Invalid OHLC response format');
      }

      const ohlcData: OhlcCandle[] = body.data;
      const fetchedFrom = body.provider || 'unknown';

      // 3. Update cache
      await putChartSnapshot({
        address,
        symbol: address.substring(0, 8), // TODO: Resolve symbol from token registry
        timeframe,
        ohlc: ohlcData,
        viewState: {
          timeframe,
          indicators: {},
          visual: {
            showVolume: true,
            showGrid: true,
            candleStyle: 'candle',
          },
        },
        metadata: {
          createdAt: snapshot?.metadata?.createdAt || Date.now(),
          lastFetchedAt: Date.now(),
          fetchedFrom,
          candleCount: ohlcData.length,
        },
      });

      setData(ohlcData);
      setProvider(fetchedFrom);
      setStatus({
        status: 'success',
        data: ohlcData,
        provider: fetchedFrom,
        cachedAt: Date.now(),
      });
    } catch (error) {
      console.error('[useOhlcData] Fetch failed:', error);
      const err = error instanceof Error ? error : new Error(String(error));

      // Fallback to stale cache if available
      const snapshot = await getChartSnapshot(address, timeframe);
      if (snapshot) {
        console.warn('[useOhlcData] Using stale cache as fallback');
        setData(snapshot.ohlc);
        setProvider(snapshot.metadata.fetchedFrom + ' (stale)');
        setStatus({
          status: 'error',
          error: err,
          lastSuccessfulData: snapshot.ohlc,
        });
      } else {
        setData(null);
        setProvider(null);
        setStatus({ status: 'error', error: err });
      }
    }
  }, [address, timeframe, limit, cacheTTL]);

  // Auto-fetch on mount or when address/timeframe changes
  useEffect(() => {
    if (autoFetch) {
      fetchOhlc();
    }
  }, [autoFetch, fetchOhlc]);

  return {
    status,
    data,
    refresh: fetchOhlc,
    isLoading: status.status === 'loading',
    error: status.status === 'error' ? status.error : null,
    provider,
  };
}
```

---

### Phase 3: Lightweight Charts Wrapper implementieren

**Datei:** `src/components/chart/AdvancedChart.tsx` (neu erstellen)

```typescript
/**
 * AdvancedChart Component
 * Lightweight Charts Wrapper mit Indicators + Replay-Support
 */

import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData } from 'lightweight-charts';
import type { OhlcCandle, ChartViewState } from '@/domain/chart';

interface AdvancedChartProps {
  /** OHLC data */
  data: OhlcCandle[];
  /** Chart view state */
  viewState?: ChartViewState;
  /** Replay mode (highlights current frame) */
  replayMode?: {
    enabled: boolean;
    currentFrame: number;
  };
  /** On chart ready callback */
  onChartReady?: (chart: IChartApi) => void;
}

export function AdvancedChart({ data, viewState, replayMode, onChartReady }: AdvancedChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#0A0F1E' },
        textColor: '#D1D5DB',
      },
      grid: {
        vertLines: { color: '#1F2937', visible: viewState?.visual?.showGrid ?? true },
        horzLines: { color: '#1F2937', visible: viewState?.visual?.showGrid ?? true },
      },
      crosshair: {
        mode: 1,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    if (onChartReady) {
      onChartReady(chart);
    }

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.resize(chartContainerRef.current.clientWidth, 400);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [onChartReady]);

  // Update data
  useEffect(() => {
    if (!candlestickSeriesRef.current || data.length === 0) return;

    const chartData: CandlestickData[] = data.map((candle) => ({
      time: Math.floor(candle.t / 1000) as any, // Convert to seconds
      open: candle.o,
      high: candle.h,
      low: candle.l,
      close: candle.c,
    }));

    candlestickSeriesRef.current.setData(chartData);

    // Auto-fit visible range
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  // Replay mode: highlight current frame
  useEffect(() => {
    if (!replayMode?.enabled || !chartRef.current) return;

    const currentCandle = data[replayMode.currentFrame];
    if (currentCandle) {
      const timestamp = Math.floor(currentCandle.t / 1000);
      chartRef.current.timeScale().scrollToPosition(5, true); // Keep 5 candles ahead visible
    }
  }, [replayMode, data]);

  // TODO: Indicators rendering (SMA, EMA, RSI, Bollinger)
  // TODO: Volume sub-chart

  return (
    <div className="relative">
      <div ref={chartContainerRef} className="rounded-lg overflow-hidden" />
      {replayMode?.enabled && (
        <div className="absolute top-2 left-2 rounded-lg bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
          📹 Replay Mode — Frame {replayMode.currentFrame + 1} / {data.length}
        </div>
      )}
    </div>
  );
}

export default AdvancedChart;
```

**Hinweis:** Indicators (SMA, EMA, RSI, Bollinger) werden in Phase 4 als separate Helper-Functions implementiert und in `AdvancedChart` integriert.

---

### Phase 4: ChartPageV2 verdrahten

**Datei:** `src/pages/ChartPageV2.tsx` (ersetzen)

```typescript
/**
 * ChartPageV2 - Advanced Charts
 * Produktions-Implementation mit Lightweight Charts + OHLC-Fetch + Offline-Support
 */

import React, { useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import ChartHeaderActions from '@/components/chart/ChartHeaderActions';
import AdvancedChart from '@/components/chart/AdvancedChart';
import ChartToolbar from '@/components/chart/ChartToolbar';
import { useOhlcData } from '@/hooks/useOhlcData';
import type { ChartTimeframe, ChartViewState } from '@/domain/chart';

export default function ChartPageV2() {
  // TODO: Get address from URL params or watchlist
  const [address] = useState('So11111111111111111111111111111111111111112'); // SOL
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('15m');
  const [viewState, setViewState] = useState<ChartViewState>({
    timeframe: '15m',
    indicators: {},
    visual: {
      showVolume: true,
      showGrid: true,
      candleStyle: 'candle',
    },
  });

  const { data, isLoading, error, provider, refresh } = useOhlcData({
    address,
    timeframe,
  });

  const handleTimeframeChange = (newTf: ChartTimeframe) => {
    setTimeframe(newTf);
    setViewState((prev) => ({ ...prev, timeframe: newTf }));
  };

  return (
    <DashboardShell
      title="Advanced Charts"
      description="Professional-grade charting with indicators, replay, and offline support."
      actions={<ChartHeaderActions onRefresh={refresh} />}
    >
      <div className="space-y-4">
        {/* Toolbar */}
        <ChartToolbar
          timeframe={timeframe}
          onTimeframeChange={handleTimeframeChange}
          viewState={viewState}
          onViewStateChange={setViewState}
        />

        {/* Chart */}
        <div className="rounded-3xl border border-border-subtle bg-surface p-6">
          {isLoading && (
            <div className="flex h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-2xl">⏳</div>
                <p className="text-sm text-text-secondary">Loading chart...</p>
              </div>
            </div>
          )}

          {error && !data && (
            <div className="flex h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-2xl">⚠️</div>
                <p className="text-sm text-text-primary">Failed to load chart data</p>
                <p className="mt-1 text-xs text-text-secondary">{error.message}</p>
                <button
                  onClick={refresh}
                  className="mt-4 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {data && data.length > 0 && (
            <div>
              <AdvancedChart data={data} viewState={viewState} />
              {provider && (
                <p className="mt-2 text-xs text-text-secondary">
                  Data from: {provider}
                </p>
              )}
            </div>
          )}

          {data && data.length === 0 && (
            <div className="flex h-[400px] items-center justify-center">
              <p className="text-sm text-text-secondary">No chart data available</p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
```

---

### Phase 5: ReplayPage auf neuen Chart-Stack umstellen

**Datei:** `src/pages/ReplayPage.tsx` (anpassen)

Ersetze Mock-Chart-Canvas (Zeilen 263-300) durch:

```typescript
import AdvancedChart from '@/components/chart/AdvancedChart';

// In ReplayPage render:
{session.ohlcCache && session.ohlcCache.length > 0 && (
  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-zinc-200">
        📈 Chart Replay
      </h3>
    </div>

    <AdvancedChart
      data={session.ohlcCache}
      replayMode={{
        enabled: true,
        currentFrame: currentFrame,
      }}
    />
  </div>
)}
```

Entferne `fetchAndCacheOhlc` Mock-Daten-Generierung (Zeilen 106-126) und ersetze durch echten OHLC-Fetch:

```typescript
import { useOhlcData } from '@/hooks/useOhlcData';

// In ReplayPage:
const { data: ohlcData, isLoading: ohlcLoading } = useOhlcData({
  address: session?.address || '',
  timeframe: session?.timeframe as ChartTimeframe || '15m',
  autoFetch: !!session && !session.ohlcCache,
});

useEffect(() => {
  if (ohlcData && session && !session.ohlcCache) {
    cacheOhlcData(session.id, ohlcData).then(setSession);
  }
}, [ohlcData, session]);
```

---

## 🧪 Test-Matrix

### Unit-Tests (Vitest)

#### 1. `tests/chart/useOhlcData.test.ts`

```typescript
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOhlcData } from '@/hooks/useOhlcData';

describe('useOhlcData Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Dexie
    vi.mock('@/db/chartSnapshots', () => ({
      getChartSnapshot: vi.fn(),
      putChartSnapshot: vi.fn(),
      isSnapshotFresh: vi.fn(),
    }));
  });

  test('[UNIT-001] should fetch OHLC data on mount', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: [{ t: 1000, o: 1, h: 2, l: 0.5, c: 1.5, v: 100 }], provider: 'dexpaprika' }),
    });

    const { result } = renderHook(() => useOhlcData({ address: 'SOL', timeframe: '15m' }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.provider).toBe('dexpaprika');
  });

  test('[UNIT-002] should use cached data if fresh', async () => {
    const mockSnapshot = { /* ... */ };
    vi.mocked(getChartSnapshot).mockResolvedValue(mockSnapshot);
    vi.mocked(isSnapshotFresh).mockReturnValue(true);

    const { result } = renderHook(() => useOhlcData({ address: 'SOL', timeframe: '15m' }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(mockSnapshot.ohlc);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('[UNIT-003] should handle network failure gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useOhlcData({ address: 'SOL', timeframe: '15m' }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toContain('Network error');
  });

  test('[UNIT-004] should refresh on manual trigger', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: [], provider: 'dexpaprika' }),
    });

    const { result } = renderHook(() => useOhlcData({ address: 'SOL', timeframe: '15m', autoFetch: false }));

    expect(result.current.isLoading).toBe(false);

    await result.current.refresh();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
```

#### 2. `tests/chart/chartSnapshots.test.ts`

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { putChartSnapshot, getChartSnapshot, isSnapshotFresh, pruneOldChartSnapshots } from '@/db/chartSnapshots';

describe('Chart Snapshots DB', () => {
  beforeEach(async () => {
    // Clear DB
    await boardDB.charts.clear();
  });

  test('[UNIT-010] should store and retrieve snapshot', async () => {
    const snapshot = { /* ... */ };
    const id = await putChartSnapshot(snapshot);
    const retrieved = await getChartSnapshot('SOL', '15m');

    expect(retrieved).toBeDefined();
    expect(retrieved?.address).toBe('SOL');
  });

  test('[UNIT-011] should detect fresh vs stale snapshots', () => {
    const freshSnapshot = { metadata: { lastFetchedAt: Date.now() } };
    const staleSnapshot = { metadata: { lastFetchedAt: Date.now() - 10 * 60 * 1000 } };

    expect(isSnapshotFresh(freshSnapshot, 5 * 60 * 1000)).toBe(true);
    expect(isSnapshotFresh(staleSnapshot, 5 * 60 * 1000)).toBe(false);
  });

  test('[UNIT-012] should prune old snapshots', async () => {
    // Insert old + new snapshots
    await putChartSnapshot({ /* old */ metadata: { lastFetchedAt: Date.now() - 48 * 60 * 60 * 1000 } });
    await putChartSnapshot({ /* new */ metadata: { lastFetchedAt: Date.now() } });

    const deleted = await pruneOldChartSnapshots(24 * 60 * 60 * 1000);

    expect(deleted).toBe(1);
  });
});
```

---

### Component-Tests

#### 3. `tests/chart/ChartPageV2.test.tsx`

```typescript
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChartPageV2 from '@/pages/ChartPageV2';

describe('ChartPageV2', () => {
  test('[COMP-001] should render loading state', () => {
    vi.mock('@/hooks/useOhlcData', () => ({
      useOhlcData: () => ({ isLoading: true, data: null, error: null }),
    }));

    render(<ChartPageV2 />);
    expect(screen.getByText('Loading chart...')).toBeInTheDocument();
  });

  test('[COMP-002] should render error state', () => {
    vi.mock('@/hooks/useOhlcData', () => ({
      useOhlcData: () => ({ isLoading: false, data: null, error: new Error('Fetch failed') }),
    }));

    render(<ChartPageV2 />);
    expect(screen.getByText('Failed to load chart data')).toBeInTheDocument();
  });

  test('[COMP-003] should change timeframe on toolbar click', async () => {
    render(<ChartPageV2 />);

    const timeframeButton = screen.getByText('1h');
    fireEvent.click(timeframeButton);

    // Verify hook re-called with new timeframe
    // (needs vi.spyOn on useOhlcData)
  });
});
```

---

### E2E-Tests (Playwright)

#### 4. `tests/e2e/advanced-charts.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Advanced Charts E2E', () => {
  test('[E2E-001] should load chart and switch timeframes', async ({ page }) => {
    await page.goto('/chart-v2');

    // Wait for chart to load
    await expect(page.locator('text=Loading chart...')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });

    // Switch timeframe
    await page.click('text=1h');
    await expect(page.locator('text=Loading chart...')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });

    // Verify provider label
    await expect(page.locator('text=Data from:')).toBeVisible();
  });

  test('[E2E-002] should work offline with cached data', async ({ page, context }) => {
    // Load chart first (to populate cache)
    await page.goto('/chart-v2');
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });

    // Go offline
    await context.setOffline(true);
    await page.reload();

    // Chart should still render from cache
    await expect(page.locator('canvas')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=stale')).toBeVisible(); // Provider shows "(stale)"
  });

  test('[E2E-003] should integrate with ReplayPage', async ({ page }) => {
    await page.goto('/replay');

    // Create replay session (requires Journal entry)
    // TODO: Seed test data

    await expect(page.locator('text=Replay Player')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
  });
});
```

---

## ⚠️ Stolperfallen & Hinweise

### 1. Mock-Daten entfernen

**Wo:** `src/pages/ReplayPage.tsx` (Zeilen 110-117)

```typescript
// ❌ ENTFERNEN:
const mockOhlc = Array.from({ length: 100 }, (_, i) => ({
  t: Date.now() - (100 - i) * 60000,
  o: 0.001 + Math.random() * 0.0001,
  // ...
}));
```

**Ersetzen durch:** Echten `useOhlcData` Hook-Call.

---

### 2. Lightweight Charts Installation

**Package:** `lightweight-charts@^4.1.0`

```bash
pnpm add lightweight-charts
pnpm add -D @types/lightweight-charts
```

**Import:**
```typescript
import { createChart, IChartApi } from 'lightweight-charts';
```

---

### 3. Dexie Version-Migration

**Problem:** Bestehende `boardDB` ist Version 1, neue Chart-Snapshots brauchen Version 2.

**Lösung:**
```typescript
// In src/lib/db-board.ts
this.version(2).stores({
  charts: '++id, symbol, timeframe, [symbol+timeframe], metadata.lastFetchedAt',
  rules: '++id, symbol, status, createdAt',
  feedCache: 'id, type, timestamp, cachedAt',
  kpiCache: 'id, cachedAt',
});
```

**Wichtig:** Dexie migriert automatisch, ABER alte Daten behalten alte Schema. Codex sollte Migration-Skript schreiben, falls nötig.

---

### 4. Offline-First Kompatibilität

**Service Worker:** Bestehende Workbox-Config in `vite.config.ts` cached bereits `/api/data/*`:

```typescript
{
  urlPattern: /^https?:\/\/.*\/api\/(data|moralis|dexpaprika)\/.*/,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'token-api-cache',
    networkTimeoutSeconds: 3,
    expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 },
  },
}
```

**Kein Handlungsbedarf** — funktioniert automatisch.

---

### 5. Fallback-Kette respektieren

**API:** `/api/data/ohlc` hat bereits DexPaprika → Moralis → Dexscreener Fallback implementiert.

**Codex muss NICHT** eigene Fallback-Logik bauen — `useOhlcData` Hook nutzt einfach die API.

---

### 6. TypeScript-Strict-Mode

**Bekanntes Issue:** Lightweight Charts hat manchmal Type-Mismatches bei `time` (number vs. string).

**Lösung:** Explizites Cast + Comment:
```typescript
time: Math.floor(candle.t / 1000) as any, // TS workaround: Lightweight Charts expects number but types say string
```

---

## 📦 Dependency-Checklist

**Neue Packages:**
```json
{
  "dependencies": {
    "lightweight-charts": "^4.1.0"
  },
  "devDependencies": {
    "@types/lightweight-charts": "^3.8.0"
  }
}
```

**Bestehende Packages (müssen vorhanden sein):**
- `dexie@^4.0.0` ✅
- `react@^18.3.0` ✅
- `react-router-dom@^6.20.0` ✅

---

## 🚀 Implementierungs-Reihenfolge (Empfohlen)

1. **Domain-Typen** (`src/domain/chart.ts`) — 30 min
2. **Dexie-Schema** (`src/db/chartSnapshots.ts` + `db-board.ts` anpassen) — 1h
3. **useOhlcData Hook** (`src/hooks/useOhlcData.ts`) — 2h
4. **AdvancedChart Component** (`src/components/chart/AdvancedChart.tsx`) — 3h
5. **ChartToolbar Component** (`src/components/chart/ChartToolbar.tsx`) — 1h
6. **ChartPageV2 verdrahten** (`src/pages/ChartPageV2.tsx`) — 1h
7. **ReplayPage anpassen** (`src/pages/ReplayPage.tsx`) — 1h
8. **Unit-Tests** (`tests/chart/*.test.ts`) — 2h
9. **E2E-Tests** (`tests/e2e/advanced-charts.spec.ts`) — 1h
10. **Polish & Bugfixes** — 2-4h

**Geschätzte Gesamtzeit:** 14-16h (verteilt über 2-3 Tage).

---

## ✅ Abnahme-Kriterien (für User)

Nach Codex-Implementation sollte User folgendes verifizieren können:

1. **Funktional:**
   - [ ] `/chart-v2` Route öffnet interaktiven Chart
   - [ ] Timeframe-Switcher funktioniert (15m → 1h → 4h)
   - [ ] Offline-Modus zeigt cached Chart
   - [ ] ReplayPage zeigt Chart mit Frame-Highlight

2. **Code-Qualität:**
   - [ ] `pnpm lint` — keine Errors
   - [ ] `pnpm typecheck` — keine Errors
   - [ ] `pnpm build` — erfolgreicher Build

3. **Tests:**
   - [ ] `pnpm test` — alle Unit-Tests grün
   - [ ] `pnpm test:e2e` — E2E-Tests grün

---

## 📞 Support & Fragen

Falls Codex während der Implementation auf Blocker stößt:

1. **Unklare API-Response-Formate:** Siehe `api/data/ohlc.ts` (Zeilen 63-72) für `normalize()` Function.
2. **Dexie-Migrations-Fehler:** Siehe Dexie-Docs: https://dexie.org/docs/Tutorial/Design#database-versioning
3. **Lightweight-Charts-Typen:** Siehe Docs: https://tradingview.github.io/lightweight-charts/

---

**Viel Erfolg, Codex! 🚀**
