import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OracleReport } from '@/types/oracle';

const getOracleReportByDate = vi.fn();
const getOracleReportsSince = vi.fn();
const upsertOracleReport = vi.fn();
const markOracleReportAsRead = vi.fn();
const markOracleReportAsNotified = vi.fn();

vi.mock('@/lib/db-oracle', () => ({
  getOracleReportByDate,
  getOracleReportsSince,
  upsertOracleReport,
  markOracleReportAsRead,
  markOracleReportAsNotified,
}));

const addEntryMock = vi.fn();
const createQuickJournalEntry = vi.fn();

vi.mock('@/store/journalStore', () => ({
  createQuickJournalEntry,
  useJournalStore: {
    getState: () => ({
      addEntry: addEntryMock,
    }),
  },
}));

const gamificationState = {
  addXP: vi.fn(),
  incrementOracleStreak: vi.fn(() => {
    gamificationState.streaks.oracle += 1;
  }),
  addBadge: vi.fn((badge: string) => {
    if (!gamificationState.badges.includes(badge)) {
      gamificationState.badges.push(badge);
    }
  }),
  badges: [] as string[],
  streaks: { journal: 0, oracle: 0, analysis: 0 },
};

vi.mock('@/store/gamificationStore', () => ({
  useGamificationStore: {
    getState: () => gamificationState,
  },
}));

import {
  grantOracleReadRewards,
  maybeNotifyHighScore,
  useOracleStore,
} from '@/store/oracleStore';

const originalFetch = global.fetch;

function resetStoreState() {
  useOracleStore.setState({
    reports: [],
    todayReport: undefined,
    loading: false,
    error: undefined,
    lastFetchTimestamp: undefined,
  });
}

function buildReport(overrides?: Partial<OracleReport>): OracleReport {
  return {
    id: overrides?.id ?? 1,
    date: overrides?.date ?? '2025-12-04',
    score: overrides?.score ?? 5,
    topTheme: overrides?.topTheme ?? 'Gaming',
    fullReport: overrides?.fullReport ?? 'Oracle payload',
    read: overrides?.read ?? false,
    notified: overrides?.notified ?? false,
    timestamp: overrides?.timestamp ?? Date.now(),
  };
}

describe('oracleStore', () => {
  beforeEach(() => {
    resetStoreState();
    vi.clearAllMocks();
    gamificationState.badges = [];
    gamificationState.streaks = { journal: 0, oracle: 0, analysis: 0 };
    global.fetch = vi.fn() as unknown as typeof fetch;
    createQuickJournalEntry.mockResolvedValue({
      id: 'oracle-entry',
      title: 'Oracle 5/7',
      date: '2025-12-04',
      direction: 'long',
      notes: 'auto',
      isAuto: true,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete (globalThis as { Notification?: unknown }).Notification;
  });

  it('loads today report from cache without hitting the API', async () => {
    const cached = buildReport();
    getOracleReportByDate.mockResolvedValue(cached);

    await useOracleStore.getState().loadTodayReport();

    expect(global.fetch).not.toHaveBeenCalled();
    expect(useOracleStore.getState().todayReport?.fullReport).toBe(cached.fullReport);
  });

  it('fetches from /api/oracle when cache is empty', async () => {
    const saved = buildReport();
    getOracleReportByDate
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(saved);

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        report: saved.fullReport,
        score: saved.score,
        theme: saved.topTheme,
        timestamp: saved.timestamp,
        date: saved.date,
      }),
    });

    await useOracleStore.getState().loadTodayReport({ forceRefresh: true });

    expect(upsertOracleReport).toHaveBeenCalledWith({
      date: saved.date,
      score: saved.score,
      topTheme: saved.topTheme,
      fullReport: saved.fullReport,
      read: false,
      notified: false,
      timestamp: saved.timestamp,
    });
    expect(useOracleStore.getState().todayReport?.date).toBe(saved.date);
  });

  it('loads history and sorts descending by date', async () => {
    getOracleReportsSince.mockResolvedValue([
      buildReport({ date: '2025-12-02', id: 1 }),
      buildReport({ date: '2025-12-01', id: 2 }),
    ]);

    await useOracleStore.getState().loadHistory(30);

    const dates = useOracleStore.getState().reports.map((r) => r.date);
    expect(dates).toEqual(['2025-12-02', '2025-12-01']);
  });

  it('grants rewards, badges, and logs a journal entry', async () => {
    gamificationState.streaks.oracle = 20;
    const report = buildReport({ read: false });

    const updated = await grantOracleReadRewards(report);

    expect(markOracleReportAsRead).toHaveBeenCalledWith(report.date);
    expect(gamificationState.addXP).toHaveBeenCalledWith(50);
    expect(gamificationState.incrementOracleStreak).toHaveBeenCalled();
    expect(gamificationState.badges).toContain('oracle-master');
    expect(createQuickJournalEntry).toHaveBeenCalledWith({
      title: expect.stringContaining(`${report.score}/7`),
      notes: expect.stringContaining(report.topTheme),
    });
    expect(addEntryMock).toHaveBeenCalled();
    expect(updated?.read).toBe(true);
  });

  it('skips duplicate notifications in maybeNotifyHighScore', async () => {
    Object.defineProperty(globalThis, 'Notification', {
      value: class {
        static permission = 'granted';
        constructor() {
          // noop
        }
      },
      configurable: true,
    });

    const report = buildReport({ score: 6, notified: false });
    await maybeNotifyHighScore(report);
    expect(markOracleReportAsNotified).toHaveBeenCalledWith(report.date);
  });
});
