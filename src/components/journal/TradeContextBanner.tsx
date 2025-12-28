import { LineChart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface TradeContextBannerProps {
  symbol?: string;
  source?: string;
}

export function TradeContextBanner({ symbol, source }: TradeContextBannerProps) {
  if (!source) return null;

  return (
    <div 
      className="flex items-center justify-between gap-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2"
      data-testid="trade-context-banner"
    >
      <div className="flex items-center gap-2 text-sm">
        <LineChart className="h-4 w-4 text-primary" />
        <span>
          {source === "replay" && "Logging from Replay session"}
          {source === "chart" && "Logging from Chart"}
          {symbol && <span className="font-medium ml-1">({symbol})</span>}
        </span>
      </div>
      <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
        <Link to={source === "replay" ? "/chart/replay" : "/chart"}>
          Back to {source === "replay" ? "Replay" : "Chart"}
          <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
}
