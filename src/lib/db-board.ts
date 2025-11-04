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

// ===== Interfaces =====

export interface ChartSession {
  id?: number;
  symbol: string; // e.g., "BTC", "SOL"
  timeframe: string; // e.g., "15m", "1h", "4h"
  timestamp: number; // Unix timestamp
  sessionDuration?: number; // Duration in ms
  metadata?: {
    entryPrice?: number;
    exitPrice?: number;
    notes?: string;
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
  }
}

// Singleton instance
export const boardDB = new BoardDatabase();

// ===== Chart Operations =====

export async function saveChartSession(
  session: Omit<ChartSession, 'id'>
): Promise<number> {
  return await boardDB.charts.add(session);
}

export async function getRecentChartSessions(limit = 10): Promise<ChartSession[]> {
  return await boardDB.charts
    .orderBy('timestamp')
    .reverse()
    .limit(limit)
    .toArray();
}

export async function getChartSessionsBySymbol(symbol: string): Promise<ChartSession[]> {
  return await boardDB.charts
    .where('symbol')
    .equals(symbol)
    .reverse()
    .sortBy('timestamp');
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
