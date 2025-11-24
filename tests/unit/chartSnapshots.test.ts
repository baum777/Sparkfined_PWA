import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { BoardChartSnapshot } from '@/domain/chart';

vi.mock('@/lib/db-board', () => {
  type SnapshotRecord = BoardChartSnapshot & { id: number };
  const store: SnapshotRecord[] = [];
  let idCounter = 1;

  const where = () => ({
    equals: ([address, timeframe]: [string, string]) => ({
      async first() {
        return store.find((item) => item.address === address && item.timeframe === timeframe);
      },
    }),
  });

  return {
    boardDB: {
      chartSnapshots: {
        async add(snapshot: Omit<BoardChartSnapshot, 'id'>) {
          const record: SnapshotRecord = { ...snapshot, id: idCounter++ };
          store.push(record);
          return record.id;
        },
        async update(id: number, data: Omit<BoardChartSnapshot, 'id'> & { id?: number }) {
          const idx = store.findIndex((item) => item.id === id);
          if (idx >= 0) {
            store[idx] = { ...store[idx], ...data, id } as SnapshotRecord;
          }
        },
        where,
        async toArray() {
          return [...store];
        },
        async bulkDelete(ids: number[]) {
          ids.forEach((id) => {
            const idx = store.findIndex((item) => item.id === id);
            if (idx >= 0) {
              store.splice(idx, 1);
            }
          });
        },
        async clear() {
          store.length = 0;
          idCounter = 1;
        },
      },
    },
  };
});

import {
  getChartSnapshot,
  isSnapshotFresh,
  pruneOldChartSnapshots,
  putChartSnapshot,
} from '@/db/chartSnapshots';
import { boardDB } from '@/lib/db-board';

const baseSnapshot: Omit<BoardChartSnapshot, 'id'> = {
  address: 'So11111111111111111111111111111111111111112',
  symbol: 'SOL',
  timeframe: '15m',
  ohlc: [
    { t: 1_700_000_000_000, o: 10, h: 12, l: 9, c: 11, v: 100 },
    { t: 1_700_000_900_000, o: 11, h: 13, l: 10, c: 12, v: 120 },
  ],
  viewState: {
    timeframe: '15m',
    indicators: {},
    visual: { showGrid: true, showVolume: true, candleStyle: 'candle' },
  },
  metadata: {
    createdAt: 1_700_000_000_000,
    lastFetchedAt: 1_700_000_000_000,
    fetchedFrom: 'dexpaprika',
    candleCount: 2,
  },
};

describe('chartSnapshots', () => {
  beforeEach(async () => {
    await boardDB.chartSnapshots.clear();
    vi.useRealTimers();
  });

  test('stores and retrieves a snapshot', async () => {
    const id = await putChartSnapshot(baseSnapshot);
    const loaded = await getChartSnapshot(baseSnapshot.address, baseSnapshot.timeframe);

    expect(id).toBeDefined();
    expect(loaded?.symbol).toBe(baseSnapshot.symbol);
    expect(loaded?.ohlc.length).toBe(2);
  });

  test('determines freshness based on lastFetchedAt', () => {
    vi.setSystemTime(new Date(1_700_000_300_000));
    expect(isSnapshotFresh(baseSnapshot, 5 * 60 * 1000)).toBe(true);

    vi.setSystemTime(new Date(1_700_001_000_000));
    expect(isSnapshotFresh(baseSnapshot, 5 * 60 * 1000)).toBe(false);
  });

  test('prunes older snapshots per address/timeframe pair', async () => {
    const newer = { ...baseSnapshot, metadata: { ...baseSnapshot.metadata, lastFetchedAt: 1_700_000_500_000 } };
    const oldest = { ...baseSnapshot, metadata: { ...baseSnapshot.metadata, lastFetchedAt: 1_699_999_500_000 } };
    await putChartSnapshot(baseSnapshot);
    await putChartSnapshot(newer);
    await putChartSnapshot(oldest);

    const deleted = await pruneOldChartSnapshots({ maxPerPair: 2 });
    const remaining = await boardDB.chartSnapshots.toArray();

    expect(deleted).toBe(1);
    expect(remaining).toHaveLength(2);
    const lastFetchedValues = remaining.map((item) => item.metadata.lastFetchedAt).sort();
    expect(lastFetchedValues).toEqual([1_700_000_000_000, 1_700_000_500_000]);
  });
});
