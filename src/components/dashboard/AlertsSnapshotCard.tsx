import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AlertsSnapshotCardProps {
  triggeredCount?: number;
}

export function AlertsSnapshotCard({ triggeredCount = 0 }: AlertsSnapshotCardProps) {
  const hasTriggered = triggeredCount > 0;

  return (
    <Card data-testid="dashboard-alerts-snapshot">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </CardTitle>
          {hasTriggered && (
            <Badge 
              variant="destructive" 
              className="text-xs"
              data-testid="alerts-triggered-badge"
            >
              {triggeredCount} Triggered
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasTriggered ? (
          <p 
            className="text-sm font-medium text-destructive"
            data-testid="alerts-triggered-message"
          >
            {triggeredCount} {triggeredCount === 1 ? 'alert needs' : 'alerts need'} your attention
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No alerts triggered today.
          </p>
        )}
        <Button 
          asChild 
          variant={hasTriggered ? "default" : "outline"} 
          size="sm" 
          className="w-full"
          data-testid="dashboard-view-alerts-btn"
        >
          <Link to="/alerts">View All Alerts</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
