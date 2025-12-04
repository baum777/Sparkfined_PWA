/**
 * Oracle Store
 * 
 * Manages Oracle report state and actions.
 * Handles fetching, caching, and reading Oracle reports.
 */

import { create } from 'zustand';
import type { OracleReport } from '@/types/oracle';
import {
  upsertOracleReport,
  getOracleReportByDate,
  getTodayReport,
  getLast30DaysReports,
  markOracleReportAsRead,
  markOracleReportAsNotified,
} from '@/lib/db-oracle';

// ===== State Interface =====

export interface OracleState {
  // Data
  reports: OracleReport[];
  todayReport: OracleReport | null;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Metadata
  lastFetchTimestamp: number | null;

  // Actions
  loadTodayReport: (options?: { forceRefresh?: boolean }) => Promise<void>;
  loadHistory: (days?: number) => Promise<void>;
  markTodayAsRead: () => Promise<void>;
  markReportAsNotified: (date: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

// ===== Initial State =====

const initialState = {
  reports: [],
  todayReport: null,
  isLoading: false,
  error: null,
  lastFetchTimestamp: null,
};

// ===== Store =====

export const useOracleStore = create<OracleState>((set, get) => ({
  ...initialState,

  /**
   * Load today's Oracle report
   * @param options.forceRefresh - Force fetch from API even if cached
   */
  loadTodayReport: async (options = {}) => {
    const { forceRefresh = false } = options;
    const today = new Date().toISOString().split('T')[0];

    set({ isLoading: true, error: null });

    try {
      // Try to load from Dexie first
      if (!forceRefresh) {
        const cached = await getTodayReport();
        if (cached) {
          set({
            todayReport: cached,
            isLoading: false,
            lastFetchTimestamp: Date.now(),
          });
          return;
        }
      }

      // Fetch from API
      const response = await fetch('/api/oracle', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Oracle report: ${response.status}`);
      }

      const data = await response.json();

      // Save to Dexie
      await upsertOracleReport({
        date: data.date || today,
        score: data.score,
        topTheme: data.theme,
        fullReport: data.report,
        read: false,
        notified: false,
        timestamp: data.timestamp || Date.now(),
        createdAt: Date.now(),
      });

      // Reload from Dexie to get full record with ID
      const savedReport = await getTodayReport();
      
      set({
        todayReport: savedReport || null,
        isLoading: false,
        lastFetchTimestamp: Date.now(),
      });
    } catch (error) {
      console.error('[OracleStore] Failed to fetch report:', error);

      // Fallback: Load last available report from Dexie
      const fallback = await getTodayReport();
      
      set({
        todayReport: fallback || null,
        error: fallback 
          ? 'Could not load latest report. Showing cached data.' 
          : 'Could not load Oracle report. Please try again later.',
        isLoading: false,
      });
    }
  },

  /**
   * Load Oracle report history
   * @param days - Number of days to load (default: 30)
   */
  loadHistory: async (days = 30) => {
    set({ isLoading: true, error: null });

    try {
      const reports = await getLast30DaysReports();
      
      set({
        reports,
        isLoading: false,
      });
    } catch (error) {
      console.error('[OracleStore] Failed to fetch history:', error);
      
      set({
        error: 'Failed to load Oracle history.',
        isLoading: false,
      });
    }
  },

  /**
   * Mark today's Oracle report as read
   * Triggers XP grant and streak increment via grantOracleReadRewards
   */
  markTodayAsRead: async () => {
    const { todayReport } = get();
    
    if (!todayReport || todayReport.read) {
      return; // Already read or no report
    }

    try {
      // Mark as read in Dexie
      await markOracleReportAsRead(todayReport.date);

      // Update local state
      set((state) => ({
        todayReport: state.todayReport 
          ? { ...state.todayReport, read: true }
          : null,
      }));

      // Grant rewards (XP, streak, badge)
      await grantOracleReadRewards(todayReport);
    } catch (error) {
      console.error('[OracleStore] Failed to mark as read:', error);
      set({ error: 'Failed to mark report as read.' });
    }
  },

  /**
   * Mark a report as notified (prevents duplicate notifications)
   */
  markReportAsNotified: async (date: string) => {
    try {
      await markOracleReportAsNotified(date);

      // Update local state if it's today's report
      set((state) => ({
        todayReport: state.todayReport?.date === date
          ? { ...state.todayReport, notified: true }
          : state.todayReport,
      }));
    } catch (error) {
      console.error('[OracleStore] Failed to mark as notified:', error);
    }
  },

  /**
   * Set error message
   */
  setError: (error: string | null) => {
    set({ error });
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set(initialState);
  },
}));

// ===== Integration Helper =====

/**
 * Grant rewards for reading an Oracle report
 * - XP: 50 points
 * - Streak: Increment Oracle streak
 * - Badge: Unlock after 7/21 day streaks
 */
async function grantOracleReadRewards(report: OracleReport): Promise<void> {
  try {
    // Dynamic import to avoid circular dependency
    const { useGamificationStore } = await import('./gamificationStore');

    // Grant XP (50 points for reading Oracle)
    useGamificationStore.getState().addXP(50);

    // Increment Oracle streak
    useGamificationStore.getState().incrementStreak('oracle');

    // Check for streak badges
    const { streaks, badges } = useGamificationStore.getState();
    
    // 7-day streak badge
    if (streaks.oracle === 7 && !badges.includes('oracle-week')) {
      useGamificationStore.getState().addBadge('oracle-week');
    }
    
    // 21-day streak badge
    if (streaks.oracle === 21 && !badges.includes('oracle-master')) {
      useGamificationStore.getState().addBadge('oracle-master');
    }

    console.log(`[OracleStore] Granted rewards: +50 XP, streak: ${streaks.oracle}`);
  } catch (error) {
    console.error('[OracleStore] Failed to grant rewards:', error);
  }
}

// ===== Selectors (for derived state) =====

/**
 * Get unread report count
 */
export const selectUnreadCount = (state: OracleState): number => {
  return state.reports.filter((r) => !r.read).length;
};

/**
 * Get reports by theme
 */
export const selectReportsByTheme = (state: OracleState, theme: string): OracleReport[] => {
  if (theme === 'All') return state.reports;
  return state.reports.filter((r) => r.topTheme === theme);
};

/**
 * Get high-score reports (score >= 6)
 */
export const selectHighScoreReports = (state: OracleState): OracleReport[] => {
  return state.reports.filter((r) => r.score >= 6);
};
