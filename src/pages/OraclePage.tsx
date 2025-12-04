import React, { useEffect } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { RefreshCw, Sparkles } from '@/lib/icons';
import { useOracleStore } from '@/store/oracleStore';

export default function OraclePage() {
  const todayReport = useOracleStore((state) => state.todayReport);
  const loading = useOracleStore((state) => state.loading);
  const error = useOracleStore((state) => state.error);
  const lastFetchTimestamp = useOracleStore((state) => state.lastFetchTimestamp);
  const loadTodayReport = useOracleStore((state) => state.loadTodayReport);
  const loadHistory = useOracleStore((state) => state.loadHistory);
  const markTodayAsRead = useOracleStore((state) => state.markTodayAsRead);

  useEffect(() => {
    void loadTodayReport();
    void loadHistory(30);
  }, [loadTodayReport, loadHistory]);

  const handleRefresh = () => {
    void loadTodayReport({ forceRefresh: true });
  };

  const handleMarkAsRead = () => {
    if (!todayReport || todayReport.read) {
      return;
    }
    void markTodayAsRead();
  };

  const lastUpdatedTimestamp = todayReport?.timestamp ?? lastFetchTimestamp;
  const lastUpdatedLabel = lastUpdatedTimestamp
    ? new Date(lastUpdatedTimestamp).toUTCString()
    : 'Awaiting first report';

  return (
    <DashboardShell
      title="Oracle"
      description="Daily meta-market intelligence at 09:00 UTC."
    >
      <div
        className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 text-text-primary md:px-6 lg:py-8"
        data-testid="oracle-page"
      >
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand/10 p-2 text-brand">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Daily Oracle</p>
              <p className="text-xs text-text-secondary">{lastUpdatedLabel}</p>
            </div>
          </div>
          <div className="space-y-1 text-xs">
            {loading && <p className="text-text-tertiary">Loading Oracle context…</p>}
            {!loading && error && (
              <p className="font-medium text-warn">{error}</p>
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-border bg-surface/80 p-4 shadow-[0_5px_20px_rgba(2,6,23,0.35)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-text-secondary">
              <span className="rounded-full border border-border px-3 py-1 text-text-primary">
                Score: {todayReport ? `${todayReport.score}/7` : '—'}
              </span>
              <span className="rounded-full border border-border px-3 py-1 text-text-primary">
                Theme: {todayReport ? todayReport.topTheme : '—'}
              </span>
              {todayReport?.read && (
                <span className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-brand">
                  Read
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-text-primary transition hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-60"
                data-testid="oracle-refresh-button"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                type="button"
                onClick={handleMarkAsRead}
                disabled={!todayReport || todayReport.read || loading}
                className="inline-flex items-center gap-2 rounded-full border border-brand bg-brand/10 px-4 py-2 text-sm font-semibold text-brand transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-60"
                data-testid="oracle-mark-read-button"
              >
                Mark as read
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-surface-subtle p-4">
            <pre
              data-testid="oracle-pre"
              className="max-h-[480px] overflow-y-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-text-secondary"
            >
              {todayReport?.fullReport ??
                'No Oracle report available yet. Check back after the daily cron completes.'}
            </pre>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
