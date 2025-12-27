import { Link } from "react-router-dom";
import type { TradeLogItemDTO } from "@/api/journalEntries";
import { Telemetry } from "@/lib/TelemetryService";
import "./trade-log.css";

interface TradeLogEntryProps {
  trade: TradeLogItemDTO;
}

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatPnl(pnlUsd?: number, price?: number): string {
  if (typeof pnlUsd === "number") {
    const sign = pnlUsd > 0 ? "+" : pnlUsd < 0 ? "-" : "";
    const value = Math.abs(pnlUsd).toLocaleString("en-US", { maximumFractionDigits: 2 });
    return `${sign}$${value}`;
  }

  if (typeof price === "number") {
    return `@ $${price.toLocaleString("en-US", { maximumFractionDigits: 4 })}`;
  }

  return "—";
}

export function TradeLogEntry({ trade }: TradeLogEntryProps) {
  const formattedTimestamp = timestampFormatter.format(new Date(trade.timestamp));
  const pnlLabel = formatPnl(trade.pnlUsd, trade.price);
  const accentClass =
    typeof trade.pnlUsd === "number"
      ? trade.pnlUsd >= 0
        ? "trade-log-entry--positive"
        : "trade-log-entry--negative"
      : "trade-log-entry--neutral";

  // Journal routing currently exposes `/journal`; fallback to base route until entry detail routes exist.
  const entryHref = `/journal/${encodeURIComponent(trade.id)}`;
  const hasEntryDetailRoute = false;
  const href = hasEntryDetailRoute ? entryHref : "/journal";

  return (
    <Link
      to={href}
      className={`trade-log-entry ${accentClass}`}
      data-testid="trade-log-entry"
      aria-label={`Open journal entry for ${trade.symbol}`}
      onClick={() => {
        Telemetry.log("ui.dashboard.trade_clicked", 1, { symbol: trade.symbol, tradeId: trade.id });
      }}
    >
      <span className="trade-log-entry__accent" aria-hidden />
      <div className="trade-log-entry__body">
        <div className="trade-log-entry__header">
          <span className="trade-log-entry__symbol">{trade.symbol}</span>
          <span className={`trade-log-entry__badge trade-log-entry__badge--${trade.side.toLowerCase()}`}>
            {trade.side}
          </span>
        </div>
        <div className="trade-log-entry__meta">
          <span className="trade-log-entry__timestamp">{formattedTimestamp}</span>
          <span className="trade-log-entry__pnl">{pnlLabel}</span>
        </div>
      </div>
    </Link>
  );
}

export default TradeLogEntry;
