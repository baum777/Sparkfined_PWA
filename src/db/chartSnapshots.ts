/**
 * Chart Snapshots Dexie Layer
 * Persistiert Chart-Snapshots für Offline-Modus + schnelle Wiederherstellung
 */

import { boardDB } from '@/lib/db-board';
import type { BoardChartSnapshot, ChartTimeframe } from '@/domain/chart';

const DEFAULT_MAX_AGE_MS = 5 * 60 * 1000;

/**
 * Speichert oder aktualisiert Chart-Snapshot
 */
export async function putChartSnapshot(snapshot: Omit<BoardChartSnapshot, 'id'>): Promise<number> {
  const existing = await boardDB.chartSnapshots
    .where('[address+timeframe]')
    .equals([snapshot.address, snapshot.timeframe])
    .first();

  if (existing?.id) {
    await boardDB.chartSnapshots.update(existing.id, { ...snapshot, id: existing.id });
    return existing.id;
  }

  return boardDB.chartSnapshots.add(snapshot);
}

/**
 * Holt einen Snapshot anhand von Address + Timeframe
 */
export async function getChartSnapshot(
  address: string,
  timeframe: ChartTimeframe
): Promise<BoardChartSnapshot | undefined> {
  return boardDB.chartSnapshots
    .where('[address+timeframe]')
    .equals([address, timeframe])
    .first();
}

/**
 * Prüft, ob Snapshot noch frisch ist (Default 5 Minuten)
 */
export function isSnapshotFresh(snapshot: BoardChartSnapshot, maxAgeMs = DEFAULT_MAX_AGE_MS): boolean {
  const now = Date.now();
  return now - snapshot.metadata.lastFetchedAt < maxAgeMs;
}

interface PruneOptions {
  maxPerPair?: number;
}

/**
 * Entfernt alte Snapshots pro Address + Timeframe Paar
 */
export async function pruneOldChartSnapshots(options: PruneOptions = {}): Promise<number> {
  const maxPerPair = options.maxPerPair ?? 3;
  const allSnapshots = await boardDB.chartSnapshots.toArray();

  const grouped = new Map<string, BoardChartSnapshot[]>();
  allSnapshots.forEach((snapshot) => {
    const key = `${snapshot.address}-${snapshot.timeframe}`;
    const list = grouped.get(key) ?? [];
    list.push(snapshot);
    grouped.set(key, list);
  });

  const deletions: number[] = [];
  for (const snapshots of grouped.values()) {
    const sorted = snapshots.sort(
      (a, b) => b.metadata.lastFetchedAt - a.metadata.lastFetchedAt
    );
    const stale = sorted.slice(maxPerPair);
    for (const item of stale) {
      if (item.id !== undefined) {
        deletions.push(item.id);
      }
    }
  }

  if (!deletions.length) return 0;
  await boardDB.chartSnapshots.bulkDelete(deletions);
  return deletions.length;
}
