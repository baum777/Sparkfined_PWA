import { TrendingUp, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DailySnapshotCard() {
  return (
    <Card data-testid="dashboard-daily-snapshot">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Today's Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">P&L</span>
          </div>
          <span className="text-lg font-semibold text-muted-foreground">—</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Streak</span>
          </div>
          <span className="text-sm text-muted-foreground">0 days</span>
        </div>
      </CardContent>
    </Card>
  );
}
