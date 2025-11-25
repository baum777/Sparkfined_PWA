/**
 * Chart Snapshots Dexie Layer
 * Persists chart snapshots for offline mode and quick restoration.
 */

import type { BoardChartSnapshot, ChartTimeframe } from '@/domain/chart';
import { boardDB } from '@/lib/db-board';

function resolveMetadata(
  snapshot: Omit<BoardChartSnapshot, 'id'>,
  createdAtFallback: number
): BoardChartSnapshot['metadata'] {
  const createdAt = snapshot.metadata.createdAt ?? createdAtFallback;
  const lastFetchedAt = snapshot.metadata.lastFetchedAt ?? Date.now();
  const candleCount = snapshot.metadata.candleCount ?? snapshot.ohlc.length;
  const fetchedFrom = snapshot.metadata.fetchedFrom ?? 'cache';

  return {
    ...snapshot.metadata,
    createdAt,
    lastFetchedAt,
    fetchedFrom,
    candleCount,
  };
}

/**
 * Stores or updates a chart snapshot.
 */
export async function putChartSnapshot(
  snapshot: Omit<BoardChartSnapshot, 'id'>
): Promise<number> {
  const existing = await boardDB.charts
    .where('[address+timeframe]')
    .equals([snapshot.address, snapshot.timeframe])
    .first();

  const now = Date.now();
  const metadata = resolveMetadata(snapshot, now);

  if (existing?.id) {
    await boardDB.charts.update(existing.id, {
      ...snapshot,
      metadata: {
        ...metadata,
        createdAt: existing.metadata?.createdAt ?? metadata.createdAt,
        lastFetchedAt: Date.now(),
      },
    });
    return existing.id;
  }

  return await boardDB.charts.add({
    ...snapshot,
    metadata: {
      ...metadata,
      createdAt: metadata.createdAt ?? now,
      lastFetchedAt: Date.now(),
    },
  } as BoardChartSnapshot);
}

/**
 * Loads a chart snapshot if available.
 */
export async function getChartSnapshot(
  address: string,
  timeframe: ChartTimeframe
): Promise<BoardChartSnapshot | undefined> {
  return (await boardDB.charts
    .where('[address+timeframe]')
    .equals([address, timeframe])
    .first()) as BoardChartSnapshot | undefined;
}

/**
 * Checks whether a snapshot is considered fresh.
 */
export function isSnapshotFresh(
  snapshot: BoardChartSnapshot,
  maxAgeMs: number = 5 * 60 * 1000
): boolean {
  const age = Date.now() - snapshot.metadata.lastFetchedAt;
  return age < maxAgeMs;
}

/**
 * Deletes stale chart snapshots.
 */
export async function pruneOldChartSnapshots(
  maxAgeMs: number = 24 * 60 * 60 * 1000
): Promise<number> {
  const cutoff = Date.now() - maxAgeMs;
  return await boardDB.charts
    .where('metadata.lastFetchedAt')
    .below(cutoff)
    .delete();
}

/**
 * Exports all chart snapshots for debugging.
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
