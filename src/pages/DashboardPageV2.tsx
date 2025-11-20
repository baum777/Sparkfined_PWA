import React, { useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import DashboardKpiStrip from '@/components/dashboard/DashboardKpiStrip';
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions';
import DashboardMainGrid from '@/components/dashboard/DashboardMainGrid';
import InsightTeaser from '@/components/dashboard/InsightTeaser';
import JournalSnapshot from '@/components/dashboard/JournalSnapshot';
import ErrorBanner from '@/components/ui/ErrorBanner';

const kpiItems = [
  { label: 'Net P&L', value: '+12.4%', trend: 'up' as const },
  { label: 'Win Rate', value: '63%', trend: 'flat' as const },
  { label: 'Alerts Armed', value: '5', trend: 'up' as const },
  { label: 'Journal Streak', value: '9 days', trend: 'up' as const },
];

const dummyInsight = {
  title: 'SOL Daily Bias',
  bias: 'long' as const,
  confidenceLabel: 'High',
  summary: 'Market structure shows higher lows with strong momentum on intraday timeframes. Watching for pullbacks to re-enter long positions with tight risk management.',
};

const dummyJournalEntries = [
  { id: '1', title: 'Scalped SOL breakout', date: '2025-02-16', direction: 'long' as const },
  { id: '2', title: 'Fade on BTC range high', date: '2025-02-15', direction: 'short' as const },
  { id: '3', title: 'ETH trend follow setup', date: '2025-02-14', direction: 'long' as const },
];

export default function DashboardPageV2() {
  const [isLoading, setIsLoading] = useState(false); // TODO: wire to real data fetch (e.g. dashboard store)
  const [error, setError] = useState<string | null>(null); // TODO: surface real error messages from data layer
  const [hasData, setHasData] = useState(true); // TODO: derive from actual dashboard data presence

  const handleRetry = () => {
    setError(null);
    setIsLoading(false);
    setHasData(true);
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
        secondary={<JournalSnapshot entries={dummyJournalEntries} />}
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
