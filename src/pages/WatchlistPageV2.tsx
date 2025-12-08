import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '@/components/dashboard/DashboardShell';
import WatchlistTable from '@/components/watchlist/WatchlistTable';
import WatchlistDetailPanel from '@/components/watchlist/WatchlistDetailPanel';
import { WatchlistHeaderActions } from '@/components/watchlist/WatchlistHeaderActions';
import { LiveStatusBadge } from '@/components/live/LiveStatusBadge';
import { fetchWatchlistQuotes } from '@/features/market/watchlistData';
import { useWatchlistStore } from '@/store/watchlistStore';
import type { WatchlistRow } from '@/store/watchlistStore';
import { DEFAULT_TIMEFRAME } from '@/domain/chart';
import { buildChartUrl, buildReplayUrl } from '@/lib/chartLinks';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import StateView from '@/components/ui/StateView';
import { FilterPills } from '@/components/layout/FilterPills';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';

type SessionFilter = "all" | "London" | "NY" | "Asia";
type SortMode = "default" | "top-movers" | "alphabetical";

export default function WatchlistPageV2() {
  const { rows, isLoading, error, hydrateFromQuotes, setLoading, setError } = useWatchlistStore((state) => ({
    rows: state.rows,
    isLoading: state.isLoading,
    error: state.error,
    hydrateFromQuotes: state.hydrateFromQuotes,
    setLoading: state.setLoading,
    setError: state.setError,
  }));
  const trends = useWatchlistStore((state) => state.trends);
  const [sessionFilter, setSessionFilter] = React.useState<SessionFilter>("all");
  const [sortMode, setSortMode] = React.useState<SortMode>("default");
  const [activeSymbol, setActiveSymbol] = React.useState<string | undefined>(undefined);
  const hasHydratedRef = React.useRef(false);
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const loadQuotes = React.useCallback(
    async (symbols: string[]) => {
      if (!symbols.length) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const quotes = await fetchWatchlistQuotes(symbols);
        hydrateFromQuotes(quotes);
      } catch (loadError) {
        console.error("[watchlist] failed to refresh quotes", loadError);
        setError("Price data unavailable, showing last known values.");
      } finally {
        setLoading(false);
      }
    },
    [hydrateFromQuotes, setError, setLoading]
  );

  React.useEffect(() => {
    if (!rows.length || hasHydratedRef.current) {
      return;
    }

    hasHydratedRef.current = true;
    const symbols = rows.map((row) => row.symbol);

    // Defensive: catch any unhandled errors in loadQuotes to prevent page crash
    loadQuotes(symbols).catch((error) => {
      console.warn('[watchlist] Failed to load quotes on mount', error);
      setError('Unable to refresh prices. Showing cached data.');
      setLoading(false);
    });
  }, [rows, loadQuotes, setError, setLoading]);
  const assetCount = rows.length;
  const headerDescription = `${assetCount} assets watched \u00b7 Track sessions, sentiment and next moves.`;
  const showSkeleton = isLoading && rows.length === 0;
  const showEmptyState = !isLoading && rows.length === 0;
  const visibleRows = React.useMemo(() => {
    const filteredRows =
      sessionFilter === "all" ? rows : rows.filter((row) => row.session === sessionFilter);

    if (sortMode === "default") {
      return filteredRows;
    }

    if (sortMode === "top-movers") {
      return [...filteredRows].sort((a, b) => getAbsChange(b) - getAbsChange(a));
    }

    // alphabetical
    return [...filteredRows].sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [rows, sessionFilter, sortMode]);
  const activeRow = React.useMemo(
    () => rows.find((row) => row.symbol === activeSymbol),
    [rows, activeSymbol]
  );
  const activeTrend = React.useMemo(() => {
    if (!activeRow) return undefined;
    return trends[activeRow.symbol];
  }, [activeRow, trends]);

  const openChart = React.useCallback(
    (row?: WatchlistRow) => {
      if (!row) return;
      const url = buildChartUrl(row.address ?? "", DEFAULT_TIMEFRAME);
      navigate(url);
    },
    [navigate]
  );

  const openReplay = React.useCallback(
    (row?: WatchlistRow) => {
      if (!row) return;
      const now = Date.now();
      const url = buildReplayUrl(row.address ?? "", DEFAULT_TIMEFRAME, now - 6 * 60 * 60 * 1000, now, {
        symbol: row.symbol,
        network: row.network ?? "solana",
      });
      navigate(url);
    },
    [navigate]
  );
  const handleRetryFetch = React.useCallback(() => {
    if (!rows.length) {
      return;
    }
    const symbols = rows.map((row) => row.symbol);
    loadQuotes(symbols).catch(() => {
      /* handled in loadQuotes */
    });
  }, [loadQuotes, rows]);

  return (
    <div data-testid="watchlist-page">
      <DashboardShell
        title="Watchlist"
        description={headerDescription}
        actions={<WatchlistHeaderActions assetCount={assetCount} isLoading={isLoading} error={error} />}
      >
        <div className="space-y-6 text-text-primary">
          <section className="rounded-3xl border border-border/70 bg-surface/80 px-4 py-4 shadow-card-subtle backdrop-blur-lg sm:px-6 sm:py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <FilterPills options={SESSION_FILTERS} active={sessionFilter} onChange={setSessionFilter} className="w-full lg:w-auto" />
              <div className="flex flex-wrap items-center gap-3">
                <LiveStatusBadge showLabel />
                <button
                  type="button"
                  onClick={() =>
                    setSortMode((prev) => {
                      if (prev === "default") return "top-movers";
                      if (prev === "top-movers") return "alphabetical";
                      return "default";
                    })
                  }
                  className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-text-secondary transition hover:border-brand hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  data-testid="watchlist-sort-toggle"
                >
                  Sort:{" "}
                  {sortMode === "default" ? "Default" : sortMode === "top-movers" ? "Top Movers" : "A-Z"}
                </button>
              </div>
            </div>
            {!isLoading && !error && (
              <p className="mt-3 text-xs text-text-secondary">
                Filter, sort, and drill into price action without leaving your command center.
              </p>
            )}
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <section className="space-y-4 rounded-3xl border border-border/70 bg-surface/90 p-4 shadow-card-subtle backdrop-blur-lg sm:p-6">
              {!isOnline && (
                <div className="rounded-2xl border border-border/70 bg-surface-subtle/80" data-testid="watchlist-offline-banner">
                  <StateView type="offline" description="You're offline. Showing last cached prices." compact />
                </div>
              )}
              {error && (
                <div className="rounded-2xl border border-danger/40 bg-danger/5">
                  <StateView type="error" description={error} actionLabel="Retry" onAction={handleRetryFetch} compact />
                </div>
              )}
              {showSkeleton ? (
                <SkeletonTable rows={6} />
              ) : showEmptyState ? (
                <div className="rounded-3xl border border-border/60 bg-surface-subtle/60">
                  <StateView
                    type="empty"
                    title="No assets yet"
                    description="Add an instrument from Discover to start tracking it here."
                    compact
                  />
                </div>
              ) : (
                <WatchlistTable rows={visibleRows} activeSymbol={activeSymbol} trends={trends} onSelect={setActiveSymbol} />
              )}
            </section>

            <section className="rounded-3xl border border-border/70 bg-surface/90 p-4 shadow-card-subtle backdrop-blur-lg sm:p-6">
              {isLoading && !activeRow ? (
                <SkeletonCard />
              ) : (
                <WatchlistDetailPanel
                  row={activeRow}
                  trend={activeTrend}
                  onOpenChart={openChart}
                  onOpenReplay={openReplay}
                />
              )}
            </section>
          </div>
        </div>
      </DashboardShell>
    </div>
  );
}

const SESSION_FILTERS: SessionFilter[] = ["all", "London", "NY", "Asia"];

function getAbsChange(row: WatchlistRow) {
  return Math.abs(parseFloat(row.change24h));
}
