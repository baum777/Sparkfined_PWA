import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Trade } from "@/features/journal/types";

interface JournalHistoryListProps {
  trades: Trade[];
  maxItems?: number;
}

export function JournalHistoryList({ trades, maxItems = 5 }: JournalHistoryListProps) {
  const recentTrades = trades.slice(0, maxItems);

  if (recentTrades.length === 0) {
    return (
      <Card data-testid="journal-history-list">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No entries yet. Start logging!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="journal-history-list">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Entries
          </CardTitle>
          <Link
            to="/journal"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            data-testid="journal-history-view-all"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentTrades.map((trade) => {
          const pnlValue = trade.pnl ? parseFloat(trade.pnl) : null;
          const isPositive = pnlValue !== null && pnlValue > 0;

          return (
            <div
              key={trade.id}
              className="flex items-center justify-between py-2 px-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors"
              data-testid="journal-history-item"
            >
              <div className="flex items-center gap-2">
                {trade.direction === "long" ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className="font-medium text-sm">{trade.asset}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {pnlValue !== null && (
                  <span className={cn(
                    "font-medium",
                    isPositive ? "text-success" : "text-destructive"
                  )}>
                    {isPositive ? "+" : ""}{trade.pnl}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(trade.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
