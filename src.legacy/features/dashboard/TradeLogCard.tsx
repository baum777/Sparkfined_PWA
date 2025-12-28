import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { TradeLogEntry } from "./TradeLogEntry";
import { getRecentTrades, type TradeLogItemDTO } from "@/api/journalEntries";
import "./trade-log.css";

interface TradeLogCardProps {
  className?: string;
  initialLimit?: number;
  pageSize?: number;
  onLogEntry?: () => void;
  isLogEntryEnabled?: boolean;
  logEntryTooltip?: string;
}

const DEFAULT_LIMIT = 5;
const DEFAULT_PAGE_SIZE = 5;

export function TradeLogCard({
  className,
  initialLimit = DEFAULT_LIMIT,
  pageSize = DEFAULT_PAGE_SIZE,
  onLogEntry,
  isLogEntryEnabled = false,
  logEntryTooltip = "Enabled when a BUY signal is detected",
}: TradeLogCardProps) {
  const [trades, setTrades] = useState<TradeLogItemDTO[]>([]);
  const [limit, setLimit] = useState(initialLimit);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const loadTrades = useCallback(
    async (requestedLimit: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getRecentTrades(requestedLimit);
        setTrades(result);
        setHasMore(result.length >= requestedLimit);
      } catch (err) {
        setError("Unable to load recent trades");
        setTrades([]);
        setHasMore(false);
        console.warn("TradeLogCard: failed to load trades", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadTrades(limit);
  }, [limit, loadTrades]);

  const handleRetry = useCallback(() => {
    void loadTrades(limit);
  }, [limit, loadTrades]);

  const handleLoadMore = useCallback(() => {
    setLimit((previous) => previous + pageSize);
  }, [pageSize]);

  const headerBadge = useMemo(() => {
    if (isLoading) {
      return <span className="trade-log-card__pill shimmer" aria-hidden />;
    }
    if (trades.length > 0) {
      return <span className="trade-log-card__pill">{trades.length} saved</span>;
    }
    return null;
  }, [isLoading, trades.length]);

  const body = useMemo(() => {
    if (isLoading) {
      return (
        <div className="trade-log-card__list" data-testid="trade-log-loading">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="trade-log-card__skeleton shimmer" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="trade-log-card__state" data-testid="trade-log-error">
          <p className="trade-log-card__state-title">{error}</p>
          <p className="trade-log-card__state-desc">Check your connection and try again.</p>
          <Button variant="secondary" size="sm" onClick={handleRetry}>
            Retry
          </Button>
        </div>
      );
    }

    if (trades.length === 0) {
      return (
        <div className="trade-log-card__state" data-testid="trade-log-empty">
          <p className="trade-log-card__state-title">No trades yet</p>
          <p className="trade-log-card__state-desc">Recent trades will appear here once logged.</p>
        </div>
      );
    }

    return (
      <div className="trade-log-card__list" data-testid="trade-log-list">
        {trades.map((trade) => (
          <TradeLogEntry key={trade.id} trade={trade} />
        ))}
      </div>
    );
  }, [error, handleRetry, isLoading, trades]);

  return (
    <section className={`trade-log-card ${className ?? ""}`} data-testid="trade-log-card">
      <header className="trade-log-card__header">
        <div>
          <p className="trade-log-card__eyebrow">Trade Log</p>
          <h2 className="trade-log-card__title">Recent trades</h2>
        </div>
        <div className="trade-log-card__actions">
          {headerBadge}
          {onLogEntry ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onLogEntry}
              disabled={!isLogEntryEnabled}
              title={!isLogEntryEnabled ? logEntryTooltip ?? "" : undefined}
              data-testid="trade-log-action"
            >
              Log entry
            </Button>
          ) : null}
        </div>
      </header>

      <div className="trade-log-card__body">{body}</div>

      {hasMore && !isLoading ? (
        <div className="trade-log-card__footer">
          <Button variant="ghost" size="sm" onClick={handleLoadMore} data-testid="trade-log-load-more">
            Load more
          </Button>
        </div>
      ) : null}
    </section>
  );
}

export default TradeLogCard;
