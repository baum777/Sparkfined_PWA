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
import { RefreshCw, CheckCircle2, Loader2, Sparkles } from '@/lib/icons';
import OracleHistoryChart from '@/components/oracle/OracleHistoryChart';
import OracleThemeFilter from '@/components/oracle/OracleThemeFilter';
import OracleHistoryList from '@/components/oracle/OracleHistoryList';

export default function OraclePage() {
  const todayReport = useOracleStore((state) => state.todayReport);
  const reports = useOracleStore((state) => state.reports);
  const isLoading = useOracleStore((state) => state.isLoading);
  const error = useOracleStore((state) => state.error);
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

  return (
    <div data-testid="oracle-page">
      <DashboardShell
        title="Oracle"
        description="Daily meta-market intelligence at 09:00 UTC"
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="oracle-refresh-button"
              aria-label="Refresh Oracle report"
            >
              <RefreshCw
                size={16}
                className={isLoading ? 'animate-spin' : ''}
              />
              <span>Refresh</span>
            </button>
            {todayReport && !isReportRead && (
              <button
                type="button"
                onClick={handleMarkAsRead}
                disabled={isMarkingAsRead}
                className="flex items-center gap-2 rounded-full border border-brand bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="oracle-mark-read-button"
                aria-label="Mark Oracle report as read and earn rewards"
              >
                {isMarkingAsRead ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                <span>{isMarkingAsRead ? 'Saving...' : 'Mark as Read'}</span>
              </button>
            )}
          </div>
        }
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          {/* Reward Message */}
          {rewardMessage && (
            <div
              className="animate-fade-in rounded-3xl border border-brand/30 bg-brand/10 p-4"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-center gap-3">
                <Sparkles size={20} className="text-brand" />
                <p className="text-sm font-medium text-brand">{rewardMessage}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !todayReport && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-surface p-12">
              <Loader2 size={32} className="animate-spin text-brand" />
              <p className="text-sm text-text-secondary">Loading Oracle report...</p>
            </div>
          )}

          {/* Error State */}
          {error && !todayReport && (
            <div className="rounded-3xl border border-warn/30 bg-warn/5 p-6">
              <p className="text-sm text-warn">{error}</p>
            </div>
          )}

          {/* Report Display */}
          {todayReport && (
            <>
              {/* Report Header */}
              <div className="flex items-center justify-between rounded-3xl border border-border bg-surface p-6">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-text-tertiary">
                      Date
                    </p>
                    <p className="mt-1 text-lg font-semibold text-text-primary">
                      {todayReport.date}
                    </p>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-text-tertiary">
                      Score
                    </p>
                    <p className="mt-1 text-lg font-semibold text-brand">
                      {todayReport.score}/7
                    </p>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-text-tertiary">
                      Top Theme
                    </p>
                    <p className="mt-1 text-lg font-semibold text-text-primary">
                      {todayReport.topTheme}
                    </p>
                  </div>
                </div>
                {isReportRead && (
                  <div className="flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand">
                    <CheckCircle2 size={14} />
                    <span>Read</span>
                  </div>
                )}
              </div>

              {/* Full Report */}
              <div className="rounded-3xl border border-border bg-surface p-6">
                <h2 className="mb-4 text-lg font-semibold text-text-primary">
                  Full Report
                </h2>
                <pre
                  className="overflow-x-auto whitespace-pre-wrap break-words rounded-2xl border border-border-subtle bg-surface-subtle p-4 text-sm leading-relaxed text-text-secondary"
                  data-testid="oracle-pre"
                >
                  {todayReport.fullReport}
                </pre>
              </div>

              {/* Error State (with cached report) */}
              {error && (
                <div className="rounded-3xl border border-warn/30 bg-warn/5 p-4">
                  <p className="text-sm text-warn">{error}</p>
                </div>
              )}
            </>
          )}

          {/* Empty State (no report and not loading) */}
          {!todayReport && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-surface p-12">
              <p className="text-center text-text-secondary">
                No Oracle report available yet.
              </p>
              <button
                type="button"
                onClick={handleRefresh}
                className="flex items-center gap-2 rounded-full border border-brand bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <RefreshCw size={16} />
                <span>Load Report</span>
              </button>
            </div>
          )}

          {/* Analytics Section */}
          {reports.length > 0 && (
            <>
              {/* Divider */}
              <div className="my-6 border-t border-border" />

              {/* Theme Filter */}
              <div className="max-w-xs">
                <OracleThemeFilter
                  value={selectedTheme}
                  onChange={setSelectedTheme}
                />
              </div>

              {/* History Chart */}
              <OracleHistoryChart reports={filteredReports} />

              {/* History List */}
              <OracleHistoryList reports={filteredReports} />
            </>
          )}
        </div>
      </DashboardShell>
    </div>
  );
}
