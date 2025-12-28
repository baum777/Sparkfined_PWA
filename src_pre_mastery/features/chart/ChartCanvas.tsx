import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export function ChartCanvas() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>BTC/USD</span>
        <span>•</span>
        <span className="text-muted-foreground/70">Awaiting data source</span>
      </div>

      <div 
        className="flex flex-col items-center justify-center gap-6 p-12 rounded-lg bg-muted/30 border border-border min-h-[300px]"
        role="img"
        aria-label="Chart placeholder - connect to a charting provider to view live data"
        data-testid="chart-canvas-placeholder"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            Chart canvas ready. Connect a charting provider to view live data.
          </p>
          <Link 
            to="/replay"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded"
          >
            Practice with Replay →
          </Link>
        </div>
      </div>
    </div>
  );
}
