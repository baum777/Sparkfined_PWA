import { create } from 'zustand';
import type { OracleAPIResponse, OracleReport } from '@/types/oracle';
import {
  getOracleReportByDate,
  getOracleReportsSince,
  markOracleReportAsRead,
  markOracleReportAsNotified,
  upsertOracleReport,
} from '@/lib/db-oracle';
import { useGamificationStore } from './gamificationStore';
import { createQuickJournalEntry, useJournalStore } from './journalStore';

const DEFAULT_HISTORY_DAYS = 30;

interface OracleState {
  reports: OracleReport[];
  todayReport?: OracleReport;
  loading: boolean;
  error?: string;
  lastFetchTimestamp?: number;
  loadTodayReport: (options?: { forceRefresh?: boolean }) => Promise<void>;
  loadHistory: (days?: number) => Promise<void>;
  markTodayAsRead: () => Promise<void>;
}

export const useOracleStore = create<OracleState>((set, get) => ({
  reports: [],
  todayReport: undefined,
  loading: false,
  error: undefined,
  lastFetchTimestamp: undefined,

  loadTodayReport: async (options) => {
    const forceRefresh = options?.forceRefresh ?? false;
    const today = getTodayIsoDate();

    set((state) => ({
      ...state,
      loading: true,
      error: undefined,
    }));

    let cachedReport: OracleReport | undefined;

    try {
      cachedReport = await getOracleReportByDate(today);
      const needsNetworkFetch = forceRefresh || !cachedReport;
      let resolvedReport = cachedReport;

      if (needsNetworkFetch) {
        const apiPayload = await fetchOracleReportFromApi();
        await upsertOracleReport({
          date: apiPayload.date,
          score: apiPayload.score,
          topTheme: apiPayload.theme,
          fullReport: apiPayload.report,
          read: cachedReport?.read ?? false,
          notified: cachedReport?.notified ?? false,
          timestamp: apiPayload.timestamp,
        });

        resolvedReport = (await getOracleReportByDate(apiPayload.date)) ?? {
          date: apiPayload.date,
          score: apiPayload.score,
          topTheme: apiPayload.theme,
          fullReport: apiPayload.report,
          read: false,
          notified: false,
          timestamp: apiPayload.timestamp,
        };
      }

      const finalReport = resolvedReport ? await maybeNotifyHighScore(resolvedReport) : resolvedReport;

      set((state) => ({
        reports: finalReport ? upsertReport(state.reports, finalReport) : state.reports,
        todayReport: finalReport ?? state.todayReport,
        loading: false,
        error: undefined,
        lastFetchTimestamp: finalReport?.timestamp ?? state.lastFetchTimestamp,
      }));
    } catch (error) {
      console.error('[oracleStore] Failed to load today report', error);
      set((state) => ({
        ...state,
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to load Oracle report',
        reports: cachedReport ? upsertReport(state.reports, cachedReport) : state.reports,
        todayReport: cachedReport ?? state.todayReport,
      }));
    }
  },

  loadHistory: async (days = DEFAULT_HISTORY_DAYS) => {
    set((state) => ({
      ...state,
      loading: true,
      error: undefined,
    }));

    try {
      const sinceDate = getIsoDateSince(days);
      const history = await getOracleReportsSince(sinceDate);
      const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
      const today = getTodayIsoDate();
      const todayInHistory = sorted.find((report) => report.date === today);

      set((state) => ({
        reports: sorted,
        todayReport: state.todayReport ?? todayInHistory,
        loading: false,
        error: undefined,
        lastFetchTimestamp:
          state.lastFetchTimestamp ??
          todayInHistory?.timestamp ??
          sorted[0]?.timestamp ??
          state.lastFetchTimestamp,
      }));
    } catch (error) {
      console.error('[oracleStore] Failed to load Oracle history', error);
      set((state) => ({
        ...state,
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to load Oracle history',
      }));
    }
  },

  markTodayAsRead: async () => {
    const report = get().todayReport;
    if (!report) {
      return;
    }

    try {
      const rewardedReport = await grantOracleReadRewards(report);
      if (!rewardedReport) {
        return;
      }

      set((state) => ({
        reports: upsertReport(state.reports, rewardedReport),
        todayReport: rewardedReport,
        error: state.error,
      }));
    } catch (error) {
      console.error('[oracleStore] Failed to apply Oracle rewards', error);
      set((state) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Unable to update read flag',
      }));
    }
  },
}));

export async function grantOracleReadRewards(report: OracleReport): Promise<OracleReport | undefined> {
  if (report.read) {
    return report;
  }

  await markOracleReportAsRead(report.date);

  const gamification = useGamificationStore.getState();
  gamification.addXP(50);
  useGamificationStore.getState().incrementOracleStreak();

  const { streaks, badges, addBadge } = useGamificationStore.getState();
  if (streaks.oracle >= 21 && !badges.includes('oracle-master')) {
    addBadge('oracle-master');
  }

  await createOracleJournalEntry(report);

  return { ...report, read: true };
}

export async function maybeNotifyHighScore(report: OracleReport): Promise<OracleReport> {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return report;
  }

  if (report.score < 6 || report.notified) {
    return report;
  }

  if (Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch (error) {
      console.warn('[oracleStore] Notification permission request failed', error);
    }
  }

  if (Notification.permission !== 'granted') {
    return report;
  }

  try {
    new Notification('Meta-Shift incoming!', {
      body: `Oracle score ${report.score}/7 → ${report.topTheme}`,
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      tag: `oracle-${report.date}`,
    });
  } catch (error) {
    console.warn('[oracleStore] Unable to show Oracle notification', error);
    return report;
  }

  await markOracleReportAsNotified(report.date);
  return { ...report, notified: true };
}

function getTodayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getIsoDateSince(days: number): string {
  const reference = new Date();
  reference.setUTCDate(reference.getUTCDate() - Math.max(0, days - 1));
  return reference.toISOString().split('T')[0];
}

async function fetchOracleReportFromApi(): Promise<OracleAPIResponse> {
  const response = await fetch('/api/oracle', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Oracle report from API');
  }

  return (await response.json()) as OracleAPIResponse;
}

function upsertReport(collection: OracleReport[], report: OracleReport): OracleReport[] {
  const next = collection.filter((item) => item.date !== report.date);
  next.push(report);
  next.sort((a, b) => b.date.localeCompare(a.date));
  return next;
}

async function createOracleJournalEntry(report: OracleReport): Promise<void> {
  const normalizedTheme = normalizeThemeSlug(report.topTheme);
  try {
    const entry = await createQuickJournalEntry({
      title: `Oracle ${report.score}/7`,
      notes: `Oracle ${report.score}/7 → nächster Shift wahrscheinlich ${report.topTheme}`,
    });

    const tags = new Set(entry.tags ?? []);
    tags.add('meta-shift');
    if (normalizedTheme) {
      tags.add(normalizedTheme);
    }

    useJournalStore.getState().addEntry({
      ...entry,
      id: entry.id,
      notes: entry.notes,
      tags: Array.from(tags),
      isAuto: true,
    });
  } catch (error) {
    console.warn('[oracleStore] Failed to create Oracle journal entry', error);
  }
}

function normalizeThemeSlug(theme: string): string {
  return theme.toLowerCase().replace(/\s+/g, '-');
}
