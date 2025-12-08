import React, { useMemo, useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import DashboardKpiStrip from '@/components/dashboard/DashboardKpiStrip';
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions';
import DashboardMainGrid from '@/components/dashboard/DashboardMainGrid';
import InsightTeaser from '@/components/dashboard/InsightTeaser';
import JournalSnapshot from '@/components/dashboard/JournalSnapshot';
import AlertsSnapshot from '@/components/dashboard/AlertsSnapshot';
import ErrorBanner from '@/components/ui/ErrorBanner';
import CalmState from '@/components/ui/CalmState';
import { useJournalStore } from '@/store/journalStore';
import { useAlertsStore } from '@/store/alertsStore';
import { calculateJournalStreak, calculateNetPnL, calculateWinRate, getEntryDate } from '@/lib/dashboard/calculateKPIs';

const dummyInsight = {
  title: 'SOL Daily Bias',
  bias: 'long' as const,
  confidenceLabel: 'High',
  summary: 'Market structure shows higher lows with strong momentum on intraday timeframes. Watching for pullbacks to re-enter long positions with tight risk management.',
};

export default function DashboardPageV2() {
  const journalEntries = useJournalStore((state) => state.entries);
  const alerts = useAlertsStore((state) => state.alerts);

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
    <CalmState
      type="loading"
      title="Loading your snapshot"
      description="Pulling KPIs and recent signals"
      compact
      className="bg-surface/50"
    />
  ) : error ? null : (
    <DashboardKpiStrip items={kpiItems} />
  );

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <CalmState
          type="loading"
          title="Preparing your calm view"
          description="Fetching insights, journal streak, and alert health"
        />
      );
    }

    if (error) {
      return (
        <div className="space-y-4">
          <ErrorBanner message={error} onRetry={handleRetry} />
          <CalmState
            type="error"
            title="Dashboard unavailable"
            description="Retry to refresh KPIs and signals."
            actionLabel="Retry"
            onAction={handleRetry}
          />
        </div>
      );
    }

    if (!hasData) {
      return (
        <DashboardMainGrid
          primary={
            <CalmState
              type="empty"
              title="No insights yet"
              description="Analyze your first market to see AI-backed focus tiles."
              actionLabel="Open Analyze"
              onAction={() => setError(null)}
            />
          }
          secondary={
            <CalmState
              type="empty"
              title="No journal entries"
              description="Capture a quick note to start your streak."
              actionLabel="Open Journal"
              onAction={() => setError(null)}
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
    <DashboardShell
      title="Dashboard"
      actions={<DashboardQuickActions />}
      kpiStrip={kpiStripContent}
    >
      {renderMainContent()}
    </DashboardShell>
  );
}
