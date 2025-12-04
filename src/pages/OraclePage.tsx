/**
 * Oracle Page
 * 
 * Displays daily meta-market intelligence reports.
 * Loads today's report on mount and provides refresh/mark-as-read actions.
 */

import React, { useEffect } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { useOracleStore } from '@/store/oracleStore';
import { RefreshCw, CheckCircle2, Loader2 } from '@/lib/icons';

export default function OraclePage() {
  const todayReport = useOracleStore((state) => state.todayReport);
  const isLoading = useOracleStore((state) => state.isLoading);
  const error = useOracleStore((state) => state.error);
  const loadTodayReport = useOracleStore((state) => state.loadTodayReport);
  const markTodayAsRead = useOracleStore((state) => state.markTodayAsRead);

  // Load today's report on mount
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (isMounted) {
        await loadTodayReport();
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [loadTodayReport]);

  const handleRefresh = async () => {
    await loadTodayReport({ forceRefresh: true });
  };

  const handleMarkAsRead = async () => {
    await markTodayAsRead();
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
                className="flex items-center gap-2 rounded-full border border-brand bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                data-testid="oracle-mark-read-button"
                aria-label="Mark Oracle report as read"
              >
                <CheckCircle2 size={16} />
                <span>Mark as Read</span>
              </button>
            )}
          </div>
        }
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
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
        </div>
      </DashboardShell>
    </div>
  );
}
