import { Check, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { OracleInsight } from "@/features/oracle/types";

interface OracleInsightCardProps {
  insight: OracleInsight;
  onMarkAsRead: (id: string) => void;
}

const THEME_LABELS: Record<OracleInsight['theme'], string> = {
  risk: 'Risk',
  discipline: 'Discipline',
  strategy: 'Strategy',
  mindset: 'Mindset',
};

export function OracleInsightCard({ insight, onMarkAsRead }: OracleInsightCardProps) {
  return (
    <Card data-testid={`oracle-insight-${insight.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{insight.title}</CardTitle>
              {!insight.isRead && (
                <Badge variant="default" className="text-xs">New</Badge>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {THEME_LABELS[insight.theme]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{insight.summary}</p>
        
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Takeaway</p>
          <p className="text-sm">{insight.takeaway}</p>
        </div>

        <details className="group" data-testid={`oracle-insight-details-${insight.id}`}>
          <summary 
            className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            data-testid={`oracle-insight-summary-${insight.id}`}
          >
            <BookOpen className="h-4 w-4" />
            <span>View full analysis</span>
          </summary>
          <pre className="mt-3 whitespace-pre-wrap rounded-md bg-muted/30 p-3 text-xs text-muted-foreground">
            {insight.content}
          </pre>
        </details>

        {!insight.isRead && (
          <div className="flex items-center gap-3 pt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMarkAsRead(insight.id)}
                    className="focus-visible:ring-offset-background"
                    data-testid={`oracle-mark-read-${insight.id}`}
                  >
                    <Check className="mr-1.5 h-4 w-4" />
                    Mark as read
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p className="text-xs">
                    Moves to Read tab and counts toward your insight streak. Entry is auto-logged to your journal.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-xs text-muted-foreground" data-testid="oracle-mark-read-hint">
              Logs to journal & builds streak
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
