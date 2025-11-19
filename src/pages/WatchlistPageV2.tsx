import React from "react";
import WatchlistLayout from "@/components/watchlist/WatchlistLayout";
import WatchlistTable from "@/components/watchlist/WatchlistTable";
import WatchlistDetailPanel from "@/components/watchlist/WatchlistDetailPanel";
import TokenSearchAutocomplete from "@/components/search/TokenSearchAutocomplete";
import { SimpleFilterChips } from "@/components/filters/FilterChips";
import { fetchWatchlistQuotes } from "@/features/market/watchlistData";
import { useWatchlistStore } from "@/store/watchlistStore";
import type { WatchlistRow } from "@/store/watchlistStore";
import type { Token } from "@/types/token";

type SessionFilter = "all" | "London" | "NY" | "Asia";
type SortMode = "default" | "top-movers";

export default function WatchlistPageV2() {
  const { rows, isLoading, error, hydrateFromQuotes, setLoading, setError } = useWatchlistStore(
    (state) => ({
      rows: state.rows,
      isLoading: state.isLoading,
      error: state.error,
      hydrateFromQuotes: state.hydrateFromQuotes,
      setLoading: state.setLoading,
      setError: state.setError,
    })
  );
  const [sessionFilter, setSessionFilter] = React.useState<SessionFilter>("all");
  const [sortMode, setSortMode] = React.useState<SortMode>("default");
  const [activeSymbol, setActiveSymbol] = React.useState<string | undefined>(undefined);
  const hasHydratedRef = React.useRef(false);

  const handleTokenSelect = (token: Token) => {
    console.log('[WatchlistPageV2] Selected token:', token);
    // TODO: Add token to watchlist
    // For now, just log it - actual watchlist addition requires store update
  };

  const handleSessionFilterToggle = (filter: string) => {
    setSessionFilter(filter as SessionFilter);
  };
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

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Market radar</p>
          <div>
            <h1 className="text-4xl font-semibold text-white">Watchlist</h1>
            <p className="mt-2 text-sm text-zinc-400">{headerDescription}</p>
            {error && (
              <p className="mt-1 text-xs text-amber-300">
                Price data unavailable, showing last known values.
              </p>
            )}
          </div>

          {/* Token Search */}
          <div className="max-w-md">
            <TokenSearchAutocomplete
              onSelect={handleTokenSelect}
              placeholder="Add token to watchlist (e.g., SOL, BTC)"
            />
          </div>
        </header>

        <WatchlistLayout
          title="Watchlist"
          subtitle="Monitor key assets, spot shifts in market tone and keep your edge synced."
        >
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-6">
            <div className="flex flex-col gap-4">
              {/* Filters & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Session Filters */}
                <SimpleFilterChips
                  chips={SESSION_FILTERS.map((f) => (f === "all" ? "All" : f))}
                  activeChips={[sessionFilter === "all" ? "All" : sessionFilter]}
                  onToggle={(filter) => {
                    const sessionFilterValue = filter === "All" ? "all" : filter.toLowerCase();
                    setSessionFilter(sessionFilterValue as SessionFilter);
                  }}
                  showClearAll={false}
                  layout="horizontal-scroll"
                />

                {/* Sort & Status */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setSortMode((prev) => (prev === "default" ? "top-movers" : "default"))
                    }
                    className="px-4 h-11 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 text-sm font-medium transition-all duration-200 touch-manipulation active:scale-95"
                    style={{ borderRadius: '16px' }}
                  >
                    Order: {sortMode === "default" ? "Default" : "Top movers"}
                  </button>
                  {isLoading && (
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 animate-pulse">
                      Refreshing…
                    </span>
                  )}
                </div>
              </div>
              <WatchlistTable
                rows={visibleRows}
                activeSymbol={activeSymbol}
                onSelect={setActiveSymbol}
              />
            </div>
            <WatchlistDetailPanel row={activeRow} />
          </div>
        </WatchlistLayout>
      </div>
    </div>
  );
}

const SESSION_FILTERS: SessionFilter[] = ["all", "London", "NY", "Asia"];

function getAbsChange(row: WatchlistRow) {
  return Math.abs(parseFloat(row.change24h));
}
