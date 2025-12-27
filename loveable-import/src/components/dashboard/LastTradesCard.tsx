import { useMemo } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { TrendingUp, TrendingDown, PenLine, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTradesStore } from "@/features/journal/useTradesStore";
import { cn } from "@/lib/utils";

const MAX_TRADES = 5;

interface LastTradesCardProps {
  loading?: boolean;
}

export function LastTradesCard({ loading = false }: LastTradesCardProps) {
  const { trades } = useTradesStore();

  const recentTrades = useMemo(() => {
    return trades.slice(0, MAX_TRADES);
  }, [trades]);

  // State: Loading
  if (loading) {
    return (
      <Card data-testid="dashboard-last-trades-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            Recent Trades
          </CardTitle>
        </CardHeader>
        <CardContent data-testid="dashboard-last-trades-loading">
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (recentTrades.length === 0) {
    return (
      <Card data-testid="dashboard-last-trades-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            Recent Trades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-md bg-muted/30 py-6 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              No trades logged yet
            </p>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="focus-visible:ring-offset-background"
              data-testid="dashboard-last-trades-cta"
            >
              <Link to="/journal" className="gap-2">
                <PenLine className="h-4 w-4" />
                Log your first trade
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="dashboard-last-trades-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            Recent Trades
          </CardTitle>
          <Link
            to="/journal"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {recentTrades.map((trade) => {
          const pnlValue = trade.pnl ? parseFloat(trade.pnl) : null;
          const isPositive = pnlValue !== null && pnlValue > 0;
          const isNegative = pnlValue !== null && pnlValue < 0;

          return (
            <Link
              key={trade.id}
              to="/journal"
              className="flex items-center justify-between py-2 px-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
              data-testid="dashboard-last-trades-item"
            >
              <div className="flex items-center gap-3">
                {trade.direction === "long" ? (
                  <TrendingUp className="h-4 w-4 text-success" aria-label="Long" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" aria-label="Short" />
                )}
                <div>
                  <span className="text-sm font-medium">{trade.asset}</span>
                  <span className="text-xs text-muted-foreground ml-2 capitalize">
                    {trade.direction}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-right">
                {pnlValue !== null ? (
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isPositive && "text-success",
                      isNegative && "text-destructive",
                      !isPositive && !isNegative && "text-muted-foreground"
                    )}
                  >
                    {isPositive ? "+" : ""}
                    {trade.pnl}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
                <span className="text-xs text-muted-foreground min-w-[60px]">
                  {formatDistanceToNow(new Date(trade.createdAt), { addSuffix: true })}
                </span>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
