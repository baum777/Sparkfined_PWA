import { create } from 'zustand';
import type { OracleAPIResponse, OracleReport } from '@/types/oracle';
import {
  getOracleReportByDate,
  getOracleReportsSince,
  markOracleReportAsRead,
  upsertOracleReport,
} from '@/lib/db-oracle';
import { useGamificationStore } from './gamificationStore';

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

      set((state) => ({
        reports: resolvedReport ? upsertReport(state.reports, resolvedReport) : state.reports,
        todayReport: resolvedReport ?? state.todayReport,
        loading: false,
        error: undefined,
        lastFetchTimestamp: resolvedReport?.timestamp ?? state.lastFetchTimestamp,
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
    if (!report || report.read) {
      return;
    }

    try {
      await markOracleReportAsRead(report.date);
      await grantOracleReadRewards(report);

      const updatedReport: OracleReport = { ...report, read: true };
      set((state) => ({
        reports: upsertReport(state.reports, updatedReport),
        todayReport: updatedReport,
      }));
    } catch (error) {
      console.error('[oracleStore] Failed to mark report as read', error);
      set((state) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Unable to update read flag',
      }));
    }
  },
}));

export async function grantOracleReadRewards(report: OracleReport): Promise<void> {
  if (report.read) {
    return;
  }

  const gamification = useGamificationStore.getState();
  gamification.addXP(50);
  gamification.incrementOracleStreak();
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
