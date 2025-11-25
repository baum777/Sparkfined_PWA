import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AlertTrigger, AlertPerformance } from '@/types/confluence-alerts';

// ============================================================================
// ALERT HISTORY STORE
// ============================================================================

interface AlertHistoryState {
  // State
  triggers: AlertTrigger[];

  // Actions
  addTrigger: (trigger: AlertTrigger) => void;
  updateTriggerOutcome: (
    triggerId: string,
    outcome: 'win' | 'loss' | 'breakeven',
    pnl: number,
    pnlPercent?: number
  ) => void;
  updateTriggerFeedback: (triggerId: string, feedback: 'good' | 'bad' | 'neutral') => void;
  clearHistory: () => void;

  // Analytics
  getPerformanceForRule: (ruleId: string) => AlertPerformance | null;
  getTriggersForRule: (ruleId: string) => AlertTrigger[];
}

export const useAlertHistoryStore = create<AlertHistoryState>()(
  persist(
    (set, get) => ({
      triggers: [],

      // ========== ADD TRIGGER ==========
      addTrigger: (trigger) => {
        set((state) => ({
          triggers: [trigger, ...state.triggers].slice(0, 1000), // Keep last 1000
        }));
      },

      // ========== UPDATE TRIGGER OUTCOME ==========
      updateTriggerOutcome: (triggerId, outcome, pnl, pnlPercent) => {
        set((state) => ({
          triggers: state.triggers.map((t) =>
            t.id === triggerId
              ? { ...t, outcome, pnl, pnlPercent }
              : t
          ),
        }));
      },

      // ========== UPDATE TRIGGER FEEDBACK ==========
      updateTriggerFeedback: (triggerId, feedback) => {
        set((state) => ({
          triggers: state.triggers.map((t) =>
            t.id === triggerId
              ? { ...t, userFeedback: feedback }
              : t
          ),
        }));
      },

      // ========== CLEAR HISTORY ==========
      clearHistory: () => {
        set({ triggers: [] });
      },

      // ========== GET PERFORMANCE FOR RULE ==========
      getPerformanceForRule: (ruleId) => {
        const triggers = get().triggers.filter((t) => t.id.startsWith(ruleId));

        if (triggers.length === 0) {
          return null;
        }

        // Filter triggers with outcomes
        const withOutcome = triggers.filter(
          (t) => t.outcome && t.outcome !== 'pending'
        );

        const wins = withOutcome.filter((t) => t.outcome === 'win').length;
        const losses = withOutcome.filter((t) => t.outcome === 'loss').length;
        const winRate = withOutcome.length > 0 ? (wins / withOutcome.length) * 100 : 0;

        const totalPnl = withOutcome.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const avgPnl = withOutcome.length > 0 ? totalPnl / withOutcome.length : 0;

        // Calculate hit rate (was the alert "right"?)
        const withFeedback = triggers.filter((t) => t.userFeedback);
        const goodFeedback = withFeedback.filter((t) => t.userFeedback === 'good').length;
        const hitRate = withFeedback.length > 0 ? (goodFeedback / withFeedback.length) * 100 : 0;
        const falsePositiveRate = 100 - hitRate;

        return {
          totalTriggers: triggers.length,
          avgTriggersPerDay: 0, // TODO Codex: Calculate based on date range
          linkedJournalEntries: triggers.filter((t) => t.journalEntryId).length,
          winningTrades: wins,
          losingTrades: losses,
          winRate,
          avgPnl,
          totalPnl,
          expectancy: avgPnl, // Simplified
          hitRate,
          falsePositiveRate,
          triggers,
        };
      },

      // ========== GET TRIGGERS FOR RULE ==========
      getTriggersForRule: (ruleId) => {
        return get().triggers.filter((t) => t.id.startsWith(ruleId));
      },
    }),
    {
      name: 'sparkfined-alert-history-store',
      partialize: (state) => ({
        triggers: state.triggers,
      }),
    }
  )
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a new alert trigger
 */
export function createAlertTrigger(
  ruleId: string,
  price: number,
  conditionsMet: string[],
  journalEntryId?: string
): AlertTrigger {
  return {
    id: `${ruleId}-${Date.now()}`,
    timestamp: Date.now(),
    price,
    conditionsMet,
    journalEntryId,
    outcome: 'pending',
  };
}
