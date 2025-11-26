import type { BoardChartSnapshot, ChartTimeframe } from '@/domain/chart';
import { getChartSnapshot, isSnapshotFresh, pruneOldChartSnapshots, putChartSnapshot } from '@/db/chartSnapshots';
import { boardDB } from '@/lib/db-board';

vi.mock('@/lib/db-board', () => {
  const store = new Map<number, BoardChartSnapshot & { id: number }>();
  let idCounter = 1;

  const charts = {
    async add(snapshot: BoardChartSnapshot): Promise<number> {
      const id = idCounter++;
      store.set(id, { ...snapshot, id });
      return id;
    },
    async update(id: number, updates: Partial<BoardChartSnapshot>): Promise<number> {
      const current = store.get(id);
      if (!current) return 0;

      store.set(id, {
        ...current,
        ...updates,
        metadata: { ...current.metadata, ...updates.metadata },
        viewState: { ...current.viewState, ...updates.viewState },
        ohlc: updates.ohlc ?? current.ohlc,
      });

      return 1;
    },
    where(query: any) {
      const records = Array.from(store.values());

      if (typeof query === 'string' && (query === '[symbol+timeframe]' || query === '[address+timeframe]')) {
        return {
          equals(values: [string, ChartTimeframe]) {
            const [symbol, timeframe] = values;
            const match = records.find(
              (record) =>
                (record.symbol === symbol || record.address === symbol) && record.timeframe === timeframe
            );

            return { first: async () => match };
          },
        };
      }

      if (typeof query === 'string' && query === 'metadata.lastFetchedAt') {
        return {
          below(cutoff: number) {
            return {
              delete: async () => {
                const toDelete = records.filter(
                  (record) => (record.metadata?.lastFetchedAt ?? 0) < cutoff
                );
                toDelete.forEach((record) => store.delete(record.id));
                return toDelete.length;
              },
            };
          },
        };
      }

      if (typeof query === 'object') {
        return {
          first: async () =>
            records.find(
              (record) => record.symbol === query.symbol && record.timeframe === query.timeframe
            ),
        };
      }

      return {
        first: async () => records[0],
      };
    },
    async toArray() {
      return Array.from(store.values());
    },
    async delete(id: number) {
      return Number(store.delete(id));
    },
    async clear() {
      store.clear();
      idCounter = 1;
    },
  };

  return { boardDB: { charts } };
});

const defaultViewState = {
  timeframe: '15m' as ChartTimeframe,
  indicators: {},
  visual: { showVolume: true, showGrid: false, candleStyle: 'candle' as const },
};

function buildSnapshot(overrides?: Partial<BoardChartSnapshot>): Omit<BoardChartSnapshot, 'id'> {
  const now = Date.now();
  const base: BoardChartSnapshot = {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    timeframe: '15m',
    ohlc: [
      { t: now - 60_000, o: 100, h: 110, l: 95, c: 105, v: 1200 },
      { t: now, o: 105, h: 115, l: 100, c: 110, v: 900 },
    ],
    viewState: defaultViewState,
    metadata: {
      createdAt: now,
      lastFetchedAt: now,
      fetchedFrom: 'cache',
      candleCount: 2,
    },
  };

  return {
    ...base,
    ...overrides,
    metadata: { ...base.metadata, ...overrides?.metadata },
    viewState: {
      ...base.viewState,
      ...overrides?.viewState,
      indicators: overrides?.viewState?.indicators ?? base.viewState.indicators,
      visual: overrides?.viewState?.visual ?? base.viewState.visual,
    },
    ohlc: overrides?.ohlc ?? base.ohlc,
    timeframe: (overrides?.timeframe as ChartTimeframe) ?? base.timeframe,
    address: overrides?.address ?? base.address,
    symbol: overrides?.symbol ?? base.symbol,
  };
}

beforeEach(async () => {
  await boardDB.charts.clear();
});

describe('chartSnapshots Dexie helpers', () => {
  it('stores and retrieves a snapshot', async () => {
    const snapshot = buildSnapshot();
    const id = await putChartSnapshot(snapshot);
    expect(typeof id).toBe('number');

    const stored = await getChartSnapshot(snapshot.address, snapshot.timeframe);
    expect(stored).toBeTruthy();
    expect(stored?.metadata.candleCount).toBe(snapshot.metadata.candleCount);
    expect(stored?.ohlc.length).toBe(snapshot.ohlc.length);
  });

  it('detects fresh versus stale snapshots', () => {
    const freshSnapshot = buildSnapshot();
    expect(isSnapshotFresh(freshSnapshot)).toBe(true);

    const staleSnapshot = buildSnapshot({
      metadata: {
        ...freshSnapshot.metadata,
        lastFetchedAt: Date.now() - 10 * 60 * 1000,
      },
    });

    expect(isSnapshotFresh(staleSnapshot)).toBe(false);
    expect(isSnapshotFresh(staleSnapshot, 15 * 60 * 1000)).toBe(true);
  });

  it('prunes snapshots older than the max age', async () => {
    const oldSnapshot = buildSnapshot({
      metadata: {
        ...buildSnapshot().metadata,
        createdAt: Date.now() - 48 * 60 * 60 * 1000,
        lastFetchedAt: Date.now() - 48 * 60 * 60 * 1000,
      },
    });
    const recentSnapshot = buildSnapshot();

    await boardDB.charts.add(oldSnapshot);
    await boardDB.charts.add(recentSnapshot);

    const deleted = await pruneOldChartSnapshots(24 * 60 * 60 * 1000);
    expect(deleted).toBe(1);

    const remaining = await boardDB.charts.toArray();
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.symbol).toBe(recentSnapshot.symbol);
  });
});
