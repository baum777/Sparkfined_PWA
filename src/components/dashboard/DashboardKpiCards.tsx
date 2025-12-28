import { TrendingUp, Percent, Activity, Flame, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardKpiCardsProps {
  netPnl?: number;
  netPnlPercent?: number;
  winRate30d?: number;
  todayTxs?: number;
  todayAmount?: number;
  journalStreak?: number;
  tradeInboxCount?: number;
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  testId: string;
  highlight?: "positive" | "negative" | "neutral";
}

function KpiCard({ icon, label, value, subValue, testId, highlight = "neutral" }: KpiCardProps) {
  return (
    <div 
      className="card-interactive flex-1 min-w-[140px] py-3 px-4" 
      data-testid={testId}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-text-tertiary">{icon}</span>
        <span className="text-xs text-text-tertiary truncate">{label}</span>
      </div>
      <p className={cn(
        "text-lg font-semibold font-mono tabular-nums",
        highlight === "positive" && "text-sentiment-bull",
        highlight === "negative" && "text-sentiment-bear",
        highlight === "neutral" && "text-text-primary"
      )}>
        {value}
      </p>
      {subValue && (
        <p className="text-xs text-text-secondary font-mono tabular-nums">{subValue}</p>
      )}
    </div>
  );
}

export function DashboardKpiCards({
  netPnl = 0,
  netPnlPercent = 0,
  winRate30d = 0,
  todayTxs = 0,
  todayAmount = 0,
  journalStreak = 0,
  tradeInboxCount = 0,
}: DashboardKpiCardsProps) {
  const formatPnl = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}$${Math.abs(value).toLocaleString()}`;
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div 
      className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin"
      data-testid="dashboard-kpi-cards"
    >
      <KpiCard
        icon={<TrendingUp className="h-4 w-4" />}
        label="Net P&L"
        value={formatPnl(netPnl)}
        subValue={formatPercent(netPnlPercent)}
        testId="kpi-net-pnl"
        highlight={netPnl > 0 ? "positive" : netPnl < 0 ? "negative" : "neutral"}
      />
      <KpiCard
        icon={<Percent className="h-4 w-4" />}
        label="Win-rate (30d)"
        value={`${winRate30d.toFixed(0)}%`}
        testId="kpi-win-rate"
        highlight={winRate30d >= 50 ? "positive" : "neutral"}
      />
      <KpiCard
        icon={<Activity className="h-4 w-4" />}
        label="Today's Activity"
        value={`${todayTxs} txs`}
        subValue={`$${todayAmount.toLocaleString()}`}
        testId="kpi-today-activity"
      />
      <KpiCard
        icon={<Flame className="h-4 w-4" />}
        label="Journal Streak"
        value={`${journalStreak}d`}
        testId="kpi-journal-streak"
        highlight={journalStreak > 0 ? "positive" : "neutral"}
      />
      <KpiCard
        icon={<Inbox className="h-4 w-4" />}
        label="Trade Inbox"
        value={tradeInboxCount > 0 ? `${tradeInboxCount} new` : "—"}
        testId="kpi-trade-inbox"
        highlight={tradeInboxCount > 0 ? "positive" : "neutral"}
      />
    </div>
  );
}
