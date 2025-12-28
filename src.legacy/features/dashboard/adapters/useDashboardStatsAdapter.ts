import { useMemo } from "react";
import { useJournalStore } from "@/store/journalStore";
import { useAlertsStore } from "@/store/alertsStore";
import { useGamificationStore } from "@/store/gamificationStore";
import { useLogEntryAvailability } from "@/features/journal/useLogEntryAvailability";

export interface DashboardStatsAdapter {
  totalTrades: number;
  alertsArmed: number;
  alertsTriggered: number;
  currentStreak: number;
  totalXP: number;
  masteryLevel: string;
  logEntryAvailable: boolean;
  logEntryDisabledReason?: string;
  logEntryBadgeCount: number;
}

export function useDashboardStatsAdapter(): DashboardStatsAdapter {
  const journalEntries = useJournalStore((state) => state.entries);
  const alerts = useAlertsStore((state) => state.alerts);
  const xp = useGamificationStore((state) => state.xp);
  const phase = useGamificationStore((state) => state.phase);
  const journalStreak = useGamificationStore((state) => state.streaks.journal);

  const {
    pendingCount: unconsumedCount,
    hasBuySignal,
  } = useLogEntryAvailability();

  return useMemo(() => {
    const armedCount = alerts.filter((alert) => alert.status === "armed").length;
    const triggeredCount = alerts.filter((alert) => alert.status === "triggered").length;
    const badgeCount = Number.isFinite(unconsumedCount) ? unconsumedCount : 0;

    return {
      totalTrades: journalEntries.length,
      alertsArmed: armedCount,
      alertsTriggered: triggeredCount,
      currentStreak: journalStreak,
      totalXP: xp,
      masteryLevel: phase,
      logEntryAvailable: Boolean(hasBuySignal),
      logEntryDisabledReason: hasBuySignal ? undefined : "Enabled when a BUY signal is detected",
      logEntryBadgeCount: badgeCount,
    };
  }, [alerts, hasBuySignal, journalEntries.length, journalStreak, phase, unconsumedCount, xp]);
}

