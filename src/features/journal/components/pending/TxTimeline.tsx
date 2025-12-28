import { Badge } from "@/components/ui/badge";
import type { CapturedTransaction } from "@/features/journal/types";

interface TxTimelineProps {
  transactions: CapturedTransaction[];
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function TxTimeline({ transactions }: TxTimelineProps) {
  if (transactions.length === 0) {
    return (
      <p className="text-xs text-text-tertiary py-2">No transactions recorded</p>
    );
  }

  return (
    <div className="space-y-1.5" data-testid="tx-timeline">
      {transactions.map((tx, idx) => {
        const isBuy = tx.type === "BUY";
        
        return (
          <div
            key={idx}
            className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-surface-subtle"
            data-testid="tx-row"
          >
            {/* Left: Type + Time */}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-[9px] font-semibold uppercase px-1.5 py-0 ${
                  isBuy
                    ? "text-sentiment-bull border-sentiment-bull-border bg-sentiment-bull-bg"
                    : "text-sentiment-bear border-sentiment-bear-border bg-sentiment-bear-bg"
                }`}
              >
                {tx.type}
              </Badge>
              <span className="text-text-tertiary">
                {formatDate(tx.time)} {formatTime(tx.time)}
              </span>
            </div>

            {/* Right: Amount @ Price = Value */}
            <div className="flex items-center gap-3 font-mono text-right">
              <span className="text-text-secondary">
                {tx.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <span className="text-text-tertiary">
                @ {formatUsd(tx.priceUsd)}
              </span>
              <span className={isBuy ? "text-text-primary" : "text-sentiment-bull"}>
                {formatUsd(tx.valueUsd)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
