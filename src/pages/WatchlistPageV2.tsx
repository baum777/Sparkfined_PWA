import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import WatchlistLayout from "@/components/watchlist/WatchlistLayout";
import WatchlistTable from "@/components/watchlist/WatchlistTable";
import WatchlistDetailPanel from "@/components/watchlist/WatchlistDetailPanel";
import { WatchlistHeaderActions } from "@/components/watchlist/WatchlistHeaderActions";
import { LiveStatusBadge } from "@/components/live/LiveStatusBadge";
import { fetchWatchlistQuotes } from "@/features/market/watchlistData";
import { useWatchlistStore } from "@/store/watchlistStore";
import type { WatchlistRow } from "@/store/watchlistStore";
import { DEFAULT_TIMEFRAME } from "@/domain/chart";
import { buildChartUrl, buildReplayUrl } from "@/lib/chartLinks";

type SessionFilter = "all" | "London" | "NY" | "Asia";
type SortMode = "default" | "top-movers";

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
    void loadQuotes(symbols);
  }, [rows, loadQuotes]);
  const assetCount = rows.length;
  const headerDescription = `${assetCount} assets watched \u00b7 Quickly scan risk, momentum and context`;
  const visibleRows = React.useMemo(() => {
    const filteredRows =
      sessionFilter === "all" ? rows : rows.filter((row) => row.session === sessionFilter);

    if (sortMode === "default") {
      return filteredRows;
    }

    return [...filteredRows].sort((a, b) => getAbsChange(b) - getAbsChange(a));
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

  return (
    <DashboardShell
      title="Watchlist"
      description={headerDescription}
      actions={<WatchlistHeaderActions assetCount={assetCount} isLoading={isLoading} error={error} />}
    >
      <WatchlistLayout>
        <div
          className="flex flex-col gap-4 text-text-primary lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-6"
          data-testid="watchlist-page"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center gap-2">
                {SESSION_FILTERS.map((filter) => {
                  const isActive = sessionFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setSessionFilter(filter)}
                      className={`rounded-full border px-3 py-1 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        isActive
                          ? "border-brand bg-surface-hover text-text-primary"
                          : "border-border text-text-secondary hover:bg-surface-hover"
                      }`}
                      data-testid={`watchlist-session-filter-${filter}`}
                    >
                      {filter === "all" ? "All" : filter}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <LiveStatusBadge showLabel={true} />
                <button
                  type="button"
                  onClick={() =>
                    setSortMode((prev) => (prev === "default" ? "top-movers" : "default"))
                  }
                  className="rounded-full border border-border px-3 py-1 font-semibold text-text-secondary transition hover:border-brand hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  data-testid="watchlist-sort-toggle"
                >
                  Order: {sortMode === "default" ? "Default" : "Top movers"}
                </button>
                {isLoading && (
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary animate-pulse">
                    Refreshing prices…
                  </span>
                )}
                {!isLoading && error && (
                  <span className="text-xs text-warn">
                    Price data unavailable, showing last known values.
                  </span>
                )}
              </div>
            </div>
          <WatchlistTable
            rows={visibleRows}
            activeSymbol={activeSymbol}
            trends={trends}
            onSelect={setActiveSymbol}
          />
        </div>
        <WatchlistDetailPanel row={activeRow} trend={activeTrend} onOpenChart={openChart} onOpenReplay={openReplay} />
      </div>
    </WatchlistLayout>
  </DashboardShell>
  );
}

const SESSION_FILTERS: SessionFilter[] = ["all", "London", "NY", "Asia"];

function getAbsChange(row: WatchlistRow) {
  return Math.abs(parseFloat(row.change24h));
}
