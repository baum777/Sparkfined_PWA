import { useMemo } from "react";
import type { JournalEntry } from "@/store/journalStore";
import type { Alert } from "@/store/alertsStore";
import {
  calculateJournalStreak,
  calculateNetPnL,
  calculateWinRate,
} from "@/lib/dashboard/calculateKPIs";
import type { TradeEntry } from "@/lib/db";
import type { TradeEventInboxItem } from "@/features/journal/useLogEntryAvailability";
import type { KPIDeltaDirection, KPIItem } from "@/features/dashboard/KPIBar";
import Activity from "lucide-react/dist/esm/icons/activity";
import Bell from "lucide-react/dist/esm/icons/bell";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Target from "lucide-react/dist/esm/icons/target";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";

interface DashboardKpiItemsAdapterInput {
  journalEntries: JournalEntry[];
  alerts: Alert[];
  tradeEntries: TradeEntry[];
  inboxEvents: TradeEventInboxItem[] | null | undefined;
  unconsumedCount: number | undefined;
  isInboxLoading: boolean;
  hasData: boolean;
}

export function useDashboardKpiItemsAdapter({
  journalEntries,
  alerts,
  tradeEntries,
  inboxEvents,
  unconsumedCount,
  isInboxLoading,
  hasData,
}: DashboardKpiItemsAdapterInput): KPIItem[] {
  return useMemo<KPIItem[]>(() => {
    const armedAlertsCount = alerts.filter((alert) => alert.status === "armed").length;
    const netPnLValue = calculateNetPnL(journalEntries);
    const winRateValue = calculateWinRate(journalEntries, 30);
    const streakValue = calculateJournalStreak(journalEntries);
    const tradesTracked = tradeEntries.length;
    const inboxCount = Array.isArray(inboxEvents) ? inboxEvents.length : 0;
    const reviewCount =
      typeof unconsumedCount === "number" && Number.isFinite(unconsumedCount) ? unconsumedCount : 0;

    const netTrend: KPIDeltaDirection =
      netPnLValue === "N/A" || netPnLValue === "0%"
        ? "flat"
        : netPnLValue.startsWith("-")
          ? "down"
          : "up";

    const winRateTrend: KPIDeltaDirection =
      winRateValue === "N/A" ? "flat" : Number.parseInt(winRateValue, 10) >= 50 ? "up" : "down";

    const alertsTrend: KPIDeltaDirection = armedAlertsCount > 0 ? "up" : "flat";
    const streakTrend: KPIDeltaDirection = streakValue === "0 days" ? "flat" : "up";
    const inboxTrend: KPIDeltaDirection = isInboxLoading ? "flat" : reviewCount > 0 ? "up" : "flat";

    return [
      {
        label: "Net P&L",
        value: netPnLValue,
        delta: {
          value: netPnLValue === "N/A" ? "Awaiting trades" : netPnLValue,
          direction: netTrend,
          srLabel: "Net profitability",
        },
        icon: <TrendingUp size={18} />,
      },
      {
        label: "Win Rate",
        value: winRateValue,
        delta: {
          value: "30d window",
          direction: winRateTrend,
          srLabel: "Win rate momentum",
        },
        icon: <Target size={18} />,
      },
      {
        label: "Alerts Armed",
        value: String(armedAlertsCount),
        delta: {
          value: reviewCount > 0 ? `${reviewCount} to review` : "Standing by",
          direction: alertsTrend,
          srLabel: "Alerts readiness",
        },
        icon: <Bell size={18} />,
      },
      {
        label: "Journal Streak",
        value: streakValue,
        delta: {
          value: hasData ? "Keep it going" : "Start logging",
          direction: streakTrend,
          srLabel: "Journal consistency",
        },
        icon: <FileText size={18} />,
      },
      {
        label: "Trade Inbox",
        value: String(tradesTracked),
        delta: {
          value: isInboxLoading ? "Syncing..." : `${inboxCount} new`,
          direction: inboxTrend,
          srLabel: "Trade events queued",
        },
        icon: <Activity size={18} />,
      },
    ];
  }, [alerts, hasData, inboxEvents, isInboxLoading, journalEntries, tradeEntries.length, unconsumedCount]);
}

