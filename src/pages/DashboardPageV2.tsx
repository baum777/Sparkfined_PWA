import React, { useState, useMemo } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import DashboardKpiStrip from '@/components/dashboard/DashboardKpiStrip';
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions';
import DashboardMainGrid from '@/components/dashboard/DashboardMainGrid';
import InsightTeaser from '@/components/dashboard/InsightTeaser';
import JournalSnapshot from '@/components/dashboard/JournalSnapshot';
import ErrorBanner from '@/components/ui/ErrorBanner';
import { useJournalStore } from '@/store/journalStore';
import { useAlertsStore } from '@/store/alertsStore';
import { calculateNetPnL, calculateWinRate, calculateJournalStreak } from '@/lib/dashboard/calculateKPIs';

const dummyInsight = {
  title: 'SOL Daily Bias',
  bias: 'long' as const,
  confidenceLabel: 'High',
  summary: 'Market structure shows higher lows with strong momentum on intraday timeframes. Watching for pullbacks to re-enter long positions with tight risk management.',
};

export default function DashboardPageV2() {
  // Get real data from stores
  const journalEntries = useJournalStore((state) => state.entries);
  const alerts = useAlertsStore((state) => state.alerts);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate real KPIs from journal data
  const kpiItems = useMemo(() => {
    const armedAlertsCount = alerts.filter((a) => a.status === 'armed').length;

    return [
      { label: 'Net P&L', value: calculateNetPnL(journalEntries), trend: 'up' as const },
      { label: 'Win Rate', value: calculateWinRate(journalEntries, 30), trend: 'flat' as const },
      { label: 'Alerts Armed', value: String(armedAlertsCount), trend: 'up' as const },
      { label: 'Journal Streak', value: calculateJournalStreak(journalEntries), trend: 'up' as const },
    ];
  }, [journalEntries, alerts]);

  // Get recent journal entries for snapshot (last 3)
  const recentJournalEntries = useMemo(() => {
    return journalEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [journalEntries]);

  const hasData = journalEntries.length > 0;

  const handleRetry = () => {
    setError(null);
    setIsLoading(false);
  };

  const kpiStripContent = isLoading ? (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-2xl bg-surface-skeleton" />
      ))}
    </div>
  ) : error ? null : (
    <DashboardKpiStrip items={kpiItems} />
  );

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <DashboardMainGrid
            primary={<div className="h-64 animate-pulse rounded-2xl bg-surface-skeleton" />}
            secondary={<div className="h-64 animate-pulse rounded-2xl bg-surface-skeleton" />}
          />
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-6">
          <ErrorBanner message={error} onRetry={handleRetry} />
          <div className="rounded-3xl border border-border-subtle bg-surface-elevated p-6 text-sm text-text-secondary">
            Please try again. If the issue persists, check your connection or reload the dashboard.
          </div>
        </div>
      );
    }

    if (!hasData) {
      return (
        <DashboardMainGrid
          primary={
            <div className="space-y-3 text-sm text-text-secondary">
              <p className="text-base font-semibold text-text-primary">No insights yet</p>
              <p>Analyze your first market to see advanced insights here.</p>
            </div>
          }
          secondary={
            <div className="space-y-3 text-sm text-text-secondary">
              <p className="text-base font-semibold text-text-primary">No journal entries to show</p>
              <p>Add a new journal entry to see recent trades and notes.</p>
            </div>
          }
        />
      );
    }

    return (
      <DashboardMainGrid
        primary={<InsightTeaser {...dummyInsight} />}
        secondary={<JournalSnapshot entries={recentJournalEntries} />}
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
