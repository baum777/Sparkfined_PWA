import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '@/components/dashboard/DashboardShell';
import DashboardKpiStrip from '@/components/dashboard/DashboardKpiStrip';
import DashboardMainGrid from '@/components/dashboard/DashboardMainGrid';
import InsightTeaser from '@/components/dashboard/InsightTeaser';
import JournalSnapshot from '@/components/dashboard/JournalSnapshot';
import AlertsSnapshot from '@/components/dashboard/AlertsSnapshot';
import ErrorBanner from '@/components/ui/ErrorBanner';
import { Skeleton } from '@/components/ui/Skeleton';
import StateView from '@/components/ui/StateView';
import { useJournalStore } from '@/store/journalStore';
import { useAlertsStore } from '@/store/alertsStore';
import { calculateJournalStreak, calculateNetPnL, calculateWinRate, getEntryDate } from '@/lib/dashboard/calculateKPIs';

const dummyInsight = {
  title: 'SOL Daily Bias',
  bias: 'long' as const,
  confidenceLabel: 'High',
  summary: 'Market structure shows higher lows with strong momentum on intraday timeframes. Watching for pullbacks to re-enter long positions with tight risk management.',
};

export default function DashboardPage() {
  const journalEntries = useJournalStore((state) => state.entries);
  const alerts = useAlertsStore((state) => state.alerts);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasData = journalEntries.length > 0;

  const handleRetry = () => {
    setError(null);
    setIsLoading(false);
  };

  const kpiItems = useMemo(() => {
    const armedAlertsCount = alerts.filter((alert) => alert.status === 'armed').length;
    const netPnLValue = calculateNetPnL(journalEntries);
    const winRateValue = calculateWinRate(journalEntries, 30);
    const streakValue = calculateJournalStreak(journalEntries);

    const netTrend: 'up' | 'down' | 'flat' =
      netPnLValue === 'N/A' || netPnLValue === '0%' ? 'flat' : netPnLValue.startsWith('-') ? 'down' : 'up';

    return [
      { label: 'Net P&L', value: netPnLValue, trend: netTrend },
      { label: 'Win Rate', value: winRateValue, trend: 'flat' as const },
      { label: 'Alerts Armed', value: String(armedAlertsCount), trend: 'up' as const },
      { label: 'Journal Streak', value: streakValue, trend: 'up' as const },
    ];
  }, [alerts, journalEntries]);

  const recentJournalEntries = useMemo(() => {
    if (!journalEntries.length) {
      return [];
    }
    return [...journalEntries]
      .map((entry) => ({ entry, timestamp: getEntryDate(entry)?.getTime() ?? 0 }))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3)
      .map(({ entry }) => entry);
  }, [journalEntries]);

  const kpiStripContent = isLoading ? (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} variant="card" className="h-20 w-full" />
      ))}
    </div>
  ) : error ? null : (
    <DashboardKpiStrip items={kpiItems} />
  );

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <DashboardMainGrid
          primary={<Skeleton variant="card" className="h-72 w-full" />}
          secondary={<Skeleton variant="card" className="h-60 w-full" />}
          tertiary={<Skeleton variant="card" className="h-60 w-full" />}
        />
      );
    }

    if (error) {
      return (
        <div className="space-y-6">
          <ErrorBanner message={error} onRetry={handleRetry} />
          <div className="card-glass rounded-3xl p-6">
            <StateView
              type="error"
              title="Unable to load dashboard"
              description="Please check your connection or reload. Your latest synced data remains safe."
              actionLabel="Retry sync"
              onAction={handleRetry}
            />
          </div>
        </div>
      );
    }

    if (!hasData) {
      return (
        <DashboardMainGrid
          primary={
            <StateView
              type="empty"
              title="No insights yet"
              description="Run your first chart session to unlock AI bias, flow and volatility context."
              actionLabel="Open chart"
              onAction={() => navigate('/chart')}
            />
          }
          secondary={
            <StateView
              type="empty"
              title="No journal entries"
              description="Log a trade or mindset note to build your streaks."
              actionLabel="Open journal"
          onAction={() => navigate('/journal')}
            />
          }
          tertiary={<AlertsSnapshot />}
        />
      );
    }

    return (
      <DashboardMainGrid
        primary={<InsightTeaser {...dummyInsight} />}
        secondary={<JournalSnapshot entries={recentJournalEntries} />}
        tertiary={<AlertsSnapshot />}
      />
    );
  };

  return (
    <div data-testid="dashboard-page">
      <DashboardShell
        title="Dashboard"
        description="Command surface for your net risk, streaks, and live intelligence."
        meta={`${journalEntries.length} journal entries · ${alerts.length} alerts`}
        kpiStrip={kpiStripContent}
      >
        {renderMainContent()}
      </DashboardShell>
    </div>
  );
}
