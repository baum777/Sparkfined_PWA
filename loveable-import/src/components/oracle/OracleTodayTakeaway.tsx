import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { OracleInsight } from "@/features/oracle/types";

interface OracleTodayTakeawayProps {
  insight: OracleInsight;
}

export function OracleTodayTakeaway({ insight }: OracleTodayTakeawayProps) {
  return (
    <Card className="border-primary/20 bg-primary/5" data-testid="oracle-today-takeaway">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Today's Takeaway</p>
            <p className="text-sm text-muted-foreground">{insight.takeaway}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
