import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  DashboardHeader,
  DailyBiasCard,
  HoldingsCard,
  LastTradesCard,
  InsightCard,
  JournalSnapshotCard,
  AlertsSnapshotCard,
  DashboardEmptyState,
  DashboardFab,
  DashboardKpiCards,
  RecentEntriesCard,
} from "@/components/dashboard";
import { useTradesStore } from "@/features/journal/useTradesStore";
import { useAlerts } from "@/features/alerts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { hasTrades, trades } = useTradesStore();
  const { alerts } = useAlerts();
  const [isRefreshingBias, setIsRefreshingBias] = useState(false);
  
  const triggeredAlerts = alerts.filter(a => a.status === 'triggered').length;

  // Calculate KPIs
  const kpiData = useMemo(() => {
    if (trades.length === 0) {
      return { 
        netPnl: 0, 
        netPnlPercent: 0, 
        winRate30d: 0, 
        todayTxs: 0, 
        todayAmount: 0,
        journalStreak: 0,
        tradeInboxCount: 0,
      };
    }

    const tradesWithPnL = trades.filter(t => t.pnl && parseFloat(t.pnl) !== 0);
    const wins = tradesWithPnL.filter(t => parseFloat(t.pnl!) > 0);
    const winRate = tradesWithPnL.length > 0 ? (wins.length / tradesWithPnL.length) * 100 : 0;
    
    const netPnl = tradesWithPnL.reduce((sum, t) => sum + parseFloat(t.pnl!), 0);
    
    // Today's trades
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTrades = trades.filter(t => new Date(t.createdAt) >= today);

    return {
      netPnl,
      netPnlPercent: 12.5, // Placeholder - would calculate from portfolio
      winRate30d: winRate,
      todayTxs: todayTrades.length,
      todayAmount: todayTrades.reduce((sum, t) => sum + (parseFloat(t.pnl || "0")), 0),
      journalStreak: 3, // Placeholder - would calculate from consecutive days
      tradeInboxCount: 2, // Placeholder - would come from notifications
    };
  }, [trades]);

  // Journal snapshot data
  const journalData = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekTrades = trades.filter(t => new Date(t.createdAt) >= weekAgo);
    const lastTrade = trades[0];
    
    return {
      totalEntries: trades.length,
      thisWeekEntries: thisWeekTrades.length,
      lastEntryDate: lastTrade 
        ? formatDistanceToNow(new Date(lastTrade.createdAt), { addSuffix: true })
        : undefined,
    };
  }, [trades]);

  const handleLogEntry = () => {
    navigate("/journal");
  };

  const handleCreateAlert = () => {
    navigate("/alerts");
  };

  const handleRefreshBias = () => {
    setIsRefreshingBias(true);
    setTimeout(() => setIsRefreshingBias(false), 1500);
  };

  const handleViewJournal = () => {
    navigate("/journal");
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6" data-testid="page-dashboard">
      {/* Header with meta counters and primary CTA */}
      <DashboardHeader 
        entriesCount={trades.length}
        alertsCount={alerts.length}
        onLogEntry={handleLogEntry}
      />

      {/* 5 Horizontal KPI Cards */}
      <DashboardKpiCards
        netPnl={kpiData.netPnl}
        netPnlPercent={kpiData.netPnlPercent}
        winRate30d={kpiData.winRate30d}
        todayTxs={kpiData.todayTxs}
        todayAmount={kpiData.todayAmount}
        journalStreak={kpiData.journalStreak}
        tradeInboxCount={kpiData.tradeInboxCount}
      />

      {!hasTrades ? (
        <DashboardEmptyState />
      ) : (
        <>
          {/* Daily Bias Card - Full Width */}
          <DailyBiasCard 
            symbol="SOL"
            bias="bullish"
            confidence={75}
            bulletPoints={[
              "Market structure shows higher lows with strong momentum on intraday timeframes.",
              "Watching for pullbacks to re-enter long positions with tight risk management."
            ]}
            lastChecked={new Date()}
            onRefresh={handleRefreshBias}
            isRefreshing={isRefreshingBias}
            onViewAnalysis={() => navigate("/oracle")}
            onOpenChart={() => navigate("/chart")}
          />

          {/* Primary Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="dashboard-primary-cards">
            <HoldingsCard />
            <LastTradesCard />
            <InsightCard isReady={trades.length >= 5} />
          </div>

          {/* Secondary Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="dashboard-secondary-cards">
            <JournalSnapshotCard 
              totalEntries={journalData.totalEntries}
              thisWeekEntries={journalData.thisWeekEntries}
              lastEntryDate={journalData.lastEntryDate}
            />
            <AlertsSnapshotCard triggeredCount={triggeredAlerts} />
          </div>

          {/* Recent Entries Footer - Full Width */}
          <RecentEntriesCard 
            onViewJournal={handleViewJournal}
            onViewEntry={(id) => navigate(`/journal?entry=${id}`)}
          />
        </>
      )}

      {/* Show preview widgets when empty */}
      {!hasTrades && (
        <div className="grid gap-4 md:grid-cols-2 opacity-60" data-testid="dashboard-preview-widgets">
          <DailyBiasCard 
            onRefresh={handleRefreshBias}
            isRefreshing={isRefreshingBias}
          />
          <HoldingsCard />
          <LastTradesCard />
          <InsightCard isReady={false} />
          <AlertsSnapshotCard triggeredCount={0} />
        </div>
      )}

      {/* Mobile FAB for quick actions */}
      <DashboardFab 
        onLogEntry={handleLogEntry}
        onCreateAlert={handleCreateAlert}
      />
    </div>
  );
}
