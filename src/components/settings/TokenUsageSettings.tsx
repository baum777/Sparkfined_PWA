import { Coins, TrendingUp, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function TokenUsageSettings() {
  // Mock usage data
  const usage = {
    used: 1250,
    limit: 5000,
    periodStart: "Dec 1",
    periodEnd: "Dec 31",
    dailyAvg: 42,
  };

  const usagePercent = (usage.used / usage.limit) * 100;

  return (
    <div className="space-y-4" data-testid="settings-token-usage">
      {/* Usage Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">AI Token usage</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {usage.used.toLocaleString()} / {usage.limit.toLocaleString()}
          </span>
        </div>
        <Progress value={usagePercent} className="h-2" data-testid="token-usage-progress" />
        <p className="text-xs text-muted-foreground">
          {(100 - usagePercent).toFixed(0)}% remaining this period
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Daily average</span>
          </div>
          <p className="text-lg font-semibold text-foreground">{usage.dailyAvg}</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Period</span>
          </div>
          <p className="text-sm font-medium text-foreground">{usage.periodStart} – {usage.periodEnd}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Tokens are used for AI insights, Oracle analysis, and automated suggestions.
      </p>
    </div>
  );
}
