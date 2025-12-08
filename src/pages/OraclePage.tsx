/**
 * Oracle Page
 * 
 * Displays daily meta-market intelligence reports.
 * Loads today's report on mount and provides refresh/mark-as-read actions.
 * 
 * Features:
 * - Auto-loads today's report
 * - High-score notifications (score >= 6)
 * - Rewards on first read: XP, streak, badges, auto-journal entry
 * - 30-day history chart
 * - Theme filtering
 * - Past reports list
 */

import React, { useEffect, useState, useMemo } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { useOracleStore } from '@/store/oracleStore';
import { RefreshCw, CheckCircle2, Sparkles } from '@/lib/icons';
import OracleHistoryChart from '@/components/oracle/OracleHistoryChart';
import OracleThemeFilter from '@/components/oracle/OracleThemeFilter';
import OracleHistoryList from '@/components/oracle/OracleHistoryList';
import Button from '@/components/ui/Button';
import StateView from '@/components/ui/StateView';

export default function OraclePage() {
  const todayReport = useOracleStore((state) => state.todayReport);
  const reports = useOracleStore((state) => state.reports);
  const isLoading = useOracleStore((state) => state.isLoading);
  const error = useOracleStore((state) => state.error);
  const lastFetchTimestamp = useOracleStore((state) => state.lastFetchTimestamp);
  const loadTodayReport = useOracleStore((state) => state.loadTodayReport);
  const loadHistory = useOracleStore((state) => state.loadHistory);
  const markTodayAsRead = useOracleStore((state) => state.markTodayAsRead);

  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('All');

  // Load today's report and history on mount
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (isMounted) {
        await Promise.all([
          loadTodayReport(),
          loadHistory(30),
        ]);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [loadTodayReport, loadHistory]);

  // Filter reports by theme
  const filteredReports = useMemo(() => {
    if (selectedTheme === 'All') {
      return reports;
    }
    return reports.filter((report) => report.topTheme === selectedTheme);
  }, [reports, selectedTheme]);

  // Clear reward message after 5 seconds
  useEffect(() => {
    if (rewardMessage) {
      const timeout = setTimeout(() => {
        setRewardMessage(null);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [rewardMessage]);

  const handleRefresh = async () => {
    await loadTodayReport({ forceRefresh: true });
  };

  const handleMarkAsRead = async () => {
    if (!todayReport || todayReport.read) {
      return;
    }

    setIsMarkingAsRead(true);
    
    try {
      await markTodayAsRead();
      setRewardMessage('🎉 +50 XP earned! Oracle streak increased.');
    } catch (err) {
      console.error('[OraclePage] Failed to mark as read:', err);
    } finally {
      setIsMarkingAsRead(false);
    }
  };

  const isReportRead = todayReport?.read ?? false;
  const headerMeta = todayReport ? `${todayReport.date} · Score ${todayReport.score}/7` : 'Auto-refreshes daily at 09:00 UTC';
  const lastUpdatedLabel = lastFetchTimestamp
    ? new Date(lastFetchTimestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : 'Sync pending';

  const renderReportSection = () => {
    if (isLoading && !todayReport) {
      return (
        <div className="card rounded-3xl p-6">
          <StateView
            type="loading"
            title="Loading Oracle report..."
            description="Syncing macro intelligence for your next decisions."
          />
        </div>
      );
    }

    if (error && !todayReport) {
      return (
        <div className="card rounded-3xl p-6">
          <StateView
            type="error"
            title="Unable to load Oracle today"
            description={error}
            actionLabel="Retry"
            onAction={handleRefresh}
          />
        </div>
      );
    }

    if (!todayReport) {
      return (
        <div className="card rounded-3xl p-6">
          <StateView
            type="empty"
            title="No Oracle report yet"
            description="Trigger a refresh to fetch the latest macro intelligence."
            actionLabel="Load report"
            onAction={handleRefresh}
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <section className="grid gap-4 lg:grid-cols-12">
          <div className="card-glass rounded-3xl p-6 lg:col-span-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-text-primary">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-text-tertiary">Date</p>
                    <p className="mt-1 text-lg font-semibold">{todayReport.date}</p>
                  </div>
                  <div className="hidden h-12 w-px bg-border md:block" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-text-tertiary">Score</p>
                    <p className="mt-1 text-2xl font-semibold text-brand">{todayReport.score}/7</p>
                  </div>
                  <div className="hidden h-12 w-px bg-border md:block" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-text-tertiary">Top theme</p>
                    <p className="mt-1 text-lg font-semibold">{todayReport.topTheme}</p>
                  </div>
                </div>
                {isReportRead ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-text-secondary">
                    <CheckCircle2 size={14} className="text-brand" />
                    Read
                  </span>
                ) : null}
              </div>
              <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-4 text-sm text-text-secondary">
                <p>Oracle distills macro, flow, and sentiment context into a daily score. Mark reports as read to earn XP and build streaks.</p>
              </div>
            </div>
          </div>
          <div className="card rounded-3xl p-6 lg:col-span-4">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-text-tertiary">Status</p>
                <p className="mt-1 text-sm text-text-secondary">
                  {isReportRead ? 'Logged in journal' : 'Awaiting review'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-text-tertiary">Last sync</p>
                <p className="mt-1 text-sm text-text-secondary">{lastUpdatedLabel}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-text-tertiary">Theme filter</p>
                <p className="mt-1 text-sm text-text-secondary">{selectedTheme}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="card rounded-3xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Full report</h2>
          <pre
            className="max-h-[420px] overflow-y-auto whitespace-pre-wrap break-words rounded-2xl border border-border-subtle bg-surface-subtle p-4 text-sm leading-relaxed text-text-secondary"
            data-testid="oracle-pre"
          >
            {todayReport.fullReport}
          </pre>
        </div>

        {error ? (
          <div className="card rounded-3xl border border-warn/40 bg-warn/5 p-4">
            <p className="text-sm text-warn">{error}</p>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div data-testid="oracle-page">
      <DashboardShell
        title="Oracle"
        description="Daily meta-market intelligence at 09:00 UTC"
        meta={headerMeta}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              isLoading={isLoading && !todayReport}
              data-testid="oracle-refresh-button"
              leftIcon={<RefreshCw size={14} />}
            >
              Refresh
            </Button>
            {todayReport && !isReportRead ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleMarkAsRead}
                isLoading={isMarkingAsRead}
                data-testid="oracle-mark-read-button"
                leftIcon={<CheckCircle2 size={14} />}
              >
                {isMarkingAsRead ? 'Saving' : 'Mark as read'}
              </Button>
            ) : null}
          </div>
        }
      >
        <div className="space-y-6">
          {rewardMessage ? (
            <div
              className="card-glow animate-fade-in rounded-3xl border border-brand/40 bg-brand/5 p-4"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-center gap-3">
                <Sparkles size={20} className="text-brand" />
                <p className="text-sm font-medium text-brand">{rewardMessage}</p>
              </div>
            </div>
          ) : null}

          {renderReportSection()}

          {reports.length > 0 ? (
            <section className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-12">
                <div className="card rounded-3xl p-6 lg:col-span-4">
                  <OracleThemeFilter value={selectedTheme} onChange={setSelectedTheme} />
                </div>
                <div className="lg:col-span-8">
                  <OracleHistoryChart reports={filteredReports} />
                </div>
              </div>
              <OracleHistoryList reports={filteredReports} />
            </section>
          ) : null}
        </div>
      </DashboardShell>
    </div>
  );
}
