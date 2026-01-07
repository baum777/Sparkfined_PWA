import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InsightCardProps {
  isReady?: boolean;
}

export function InsightCard({ isReady = false }: InsightCardProps) {
  if (!isReady) {
    return (
      <Card data-testid="dashboard-insight" className="border-dashed">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              Preview
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sample preview — log 5+ trades to unlock real insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="dashboard-insight">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Your insights will appear here.</p>
      </CardContent>
    </Card>
  );
}
