/**
 * Board Database Schema (Dexie)
 * 
 * IndexedDB tables for Board-specific data:
 * 1. Charts — Recent chart sessions (symbol, timeframe, timestamp)
 * 2. Rules — Price alerts & conditions (symbol, rule, status)
 * 3. FeedCache — Cached feed events (for offline support)
 * 4. KPICache — Cached KPI data (for offline support)
 * 
 * Uses Dexie for type-safe queries and better DX.
 * Extends existing `sparkfined-ta-pwa` database with new tables.
 */

import Dexie, { type Table } from 'dexie';
import type { BoardChartSnapshot, ChartTimeframe, ChartViewState } from '@/domain/chart';

// ===== Interfaces =====

export type ChartSession = BoardChartSnapshot & { timestamp?: number };

const KNOWN_TIMEFRAMES: ChartTimeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];

const DEFAULT_VISUAL_SETTINGS: ChartViewState['visual'] = {
  showVolume: true,
  showGrid: false,
  candleStyle: 'candle',
};

function coerceTimeframe(timeframe?: string | ChartTimeframe): ChartTimeframe {
  if (timeframe && KNOWN_TIMEFRAMES.includes(timeframe as ChartTimeframe)) {
    return timeframe as ChartTimeframe;
  }

  return '15m';
}

function createDefaultViewState(timeframe: ChartTimeframe): ChartViewState {
  return {
    timeframe,
    indicators: {},
    visual: { ...DEFAULT_VISUAL_SETTINGS },
  };
}

function withSnapshotDefaults(snapshot: Omit<ChartSession, 'id'>): Omit<ChartSession, 'id'> {
  const timeframe = coerceTimeframe(snapshot.timeframe);
  const createdAt = snapshot.metadata?.createdAt ?? Date.now();
  const lastFetchedAt = snapshot.metadata?.lastFetchedAt ?? createdAt;

  return {
    ...snapshot,
    address: snapshot.address ?? snapshot.symbol,
    timeframe,
    ohlc: snapshot.ohlc ?? [],
    timestamp: snapshot.timestamp ?? lastFetchedAt,
    viewState: snapshot.viewState ?? createDefaultViewState(timeframe),
    metadata: {
      fetchedFrom: snapshot.metadata?.fetchedFrom ?? 'cache',
      candleCount: snapshot.metadata?.candleCount ?? snapshot.ohlc?.length ?? 0,
      createdAt,
      lastFetchedAt,
    },
  };
}

export interface AlertRule {
  id?: number;
  symbol: string;
  condition: 'above' | 'below' | 'cross_up' | 'cross_down';
  targetPrice: number;
  status: 'active' | 'triggered' | 'disabled';
  createdAt: number;
  triggeredAt?: number;
  metadata?: {
    message?: string;
    notificationSent?: boolean;
  };
}

export interface FeedEventCache {
  id: string; // UUID from server
  type: 'alert' | 'analysis' | 'journal' | 'export' | 'error';
  text: string;
  timestamp: number;
  unread: boolean;
  cachedAt: number; // When cached locally
  metadata?: {
    symbol?: string;
    timeframe?: string;
    pnl?: number;
    alertId?: string;
  };
}

export interface KPICache {
  id: string; // KPI identifier (e.g., "pnl-today", "active-alerts")
  label: string;
  value: string | number;
  type: 'numeric' | 'count' | 'status' | 'timestamp';
  direction?: 'up' | 'down' | 'neutral';
  trend?: string;
  icon?: string;
  timestamp?: number;
  cachedAt: number; // When cached locally
}

// ===== Dexie Database =====

export class BoardDatabase extends Dexie {
  charts!: Table<ChartSession, number>;
  rules!: Table<AlertRule, number>;
  feedCache!: Table<FeedEventCache, string>;
  kpiCache!: Table<KPICache, string>;

  constructor() {
    super('sparkfined-board');

    this.version(1).stores({
      charts: '++id, symbol, timeframe, timestamp',
      rules: '++id, symbol, status, createdAt',
      feedCache: 'id, type, timestamp, cachedAt',
      kpiCache: 'id, cachedAt',
    });

    this.version(2)
      .stores({
        charts: '++id, symbol, address, timeframe, [address+timeframe], metadata.lastFetchedAt',
        rules: '++id, symbol, status, createdAt',
        feedCache: 'id, type, timestamp, cachedAt',
        kpiCache: 'id, cachedAt',
      })
      .upgrade(async (tx) => {
        await tx.table('charts').toCollection().modify((chart: ChartSession) => {
          const timeframe = coerceTimeframe(chart.timeframe as ChartTimeframe);

          chart.address = chart.address ?? chart.symbol;
          chart.ohlc = Array.isArray(chart.ohlc) ? chart.ohlc : [];
          chart.viewState = chart.viewState ?? createDefaultViewState(timeframe);
          chart.metadata = {
            createdAt: chart.metadata?.createdAt ?? chart.timestamp ?? Date.now(),
            lastFetchedAt: chart.metadata?.lastFetchedAt ?? chart.timestamp ?? Date.now(),
            fetchedFrom: chart.metadata?.fetchedFrom ?? 'cache',
            candleCount: chart.metadata?.candleCount ?? chart.ohlc.length ?? 0,
          };
        });
      });
  }
}

// Singleton instance
export const boardDB = new BoardDatabase();

// ===== Chart Operations =====

export async function saveChartSession(
  session: Omit<ChartSession, 'id'>
): Promise<number> {
  const snapshot = withSnapshotDefaults(session);
  return await boardDB.charts.add(snapshot);
}

export async function getRecentChartSessions(limit = 10): Promise<ChartSession[]> {
  return await boardDB.charts
    .orderBy('metadata.lastFetchedAt')
    .reverse()
    .limit(limit)
    .toArray();
}

export async function getChartSessionsBySymbol(symbol: string): Promise<ChartSession[]> {
  return await boardDB.charts
    .where('symbol')
    .equals(symbol)
    .reverse()
    .sortBy('metadata.lastFetchedAt');
}

export async function deleteChartSession(id: number): Promise<void> {
  await boardDB.charts.delete(id);
}

// ===== Alert Rule Operations =====

export async function saveAlertRule(rule: Omit<AlertRule, 'id'>): Promise<number> {
  return await boardDB.rules.add(rule);
}

export async function getActiveAlerts(): Promise<AlertRule[]> {
  return await boardDB.rules
    .where('status')
    .equals('active')
    .toArray();
}

export async function getAllAlerts(): Promise<AlertRule[]> {
  return await boardDB.rules
    .orderBy('createdAt')
    .reverse()
    .toArray();
}

export async function triggerAlert(id: number): Promise<void> {
  await boardDB.rules.update(id, {
    status: 'triggered',
    triggeredAt: Date.now(),
  });
}

export async function disableAlert(id: number): Promise<void> {
  await boardDB.rules.update(id, { status: 'disabled' });
}

export async function deleteAlert(id: number): Promise<void> {
  await boardDB.rules.delete(id);
}

// ===== Feed Cache Operations =====

export async function cacheFeedEvents(events: FeedEventCache[]): Promise<void> {
  await boardDB.feedCache.bulkPut(events);
}

export async function getCachedFeedEvents(limit = 20): Promise<FeedEventCache[]> {
  return await boardDB.feedCache
    .orderBy('timestamp')
    .reverse()
    .limit(limit)
    .toArray();
}

export async function clearOldFeedCache(olderThan: number): Promise<number> {
  return await boardDB.feedCache
    .where('cachedAt')
    .below(olderThan)
    .delete();
}

// ===== KPI Cache Operations =====

export async function cacheKPIs(kpis: KPICache[]): Promise<void> {
  await boardDB.kpiCache.bulkPut(kpis);
}

export async function getCachedKPIs(): Promise<KPICache[]> {
  return await boardDB.kpiCache.toArray();
}

export async function getCachedKPI(id: string): Promise<KPICache | undefined> {
  return await boardDB.kpiCache.get(id);
}

export async function clearKPICache(): Promise<void> {
  await boardDB.kpiCache.clear();
}

// ===== Utility: Clear All Board Data =====

export async function clearAllBoardData(): Promise<void> {
  await Promise.all([
    boardDB.charts.clear(),
    boardDB.rules.clear(),
    boardDB.feedCache.clear(),
    boardDB.kpiCache.clear(),
  ]);
}

// ===== Utility: Export Board Data (JSON) =====

export async function exportBoardDataJSON(): Promise<string> {
  const [charts, rules, feed, kpis] = await Promise.all([
    boardDB.charts.toArray(),
    boardDB.rules.toArray(),
    boardDB.feedCache.toArray(),
    boardDB.kpiCache.toArray(),
  ]);

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      version: 1,
      data: {
        charts,
        rules,
        feedCache: feed,
        kpiCache: kpis,
      },
    },
    null,
    2
  );
}

/**
 * Usage Examples:
 * 
 * // Save chart session
 * await saveChartSession({
 *   symbol: 'BTC',
 *   timeframe: '15m',
 *   timestamp: Date.now(),
 *   sessionDuration: 1200000,
 * });
 * 
 * // Get recent charts
 * const recentCharts = await getRecentChartSessions(5);
 * 
 * // Create price alert
 * await saveAlertRule({
 *   symbol: 'ETH',
 *   condition: 'above',
 *   targetPrice: 3000,
 *   status: 'active',
 *   createdAt: Date.now(),
 * });
 * 
 * // Get active alerts
 * const activeAlerts = await getActiveAlerts();
 * 
 * // Cache KPIs (for offline support)
 * await cacheKPIs([
 *   { id: 'pnl-today', label: "Today's P&L", value: '+$247', ... },
 * ]);
 * 
 * // Get cached KPIs
 * const cachedKPIs = await getCachedKPIs();
 */
