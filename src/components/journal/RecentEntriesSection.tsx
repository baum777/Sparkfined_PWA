import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface JournalEntry {
  id: string;
  asset: string;
  direction: "long" | "short";
  emotionalState?: string;
  confidence?: number;
  createdAt: string;
  tags?: string[];
  pnl?: string;
}

interface RecentEntriesSectionProps {
  entries: JournalEntry[];
  onSelectEntry?: (entry: JournalEntry) => void;
}

export function RecentEntriesSection({ entries, onSelectEntry }: RecentEntriesSectionProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <Card data-testid="recent-entries-section">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Entries
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="space-y-1 p-4 pt-0">
            {entries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => onSelectEntry?.(entry)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-colors",
                  "hover:bg-muted/50 hover:border-primary/30"
                )}
                data-testid={`recent-entry-${entry.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {entry.direction === "long" ? (
                      <TrendingUp className="h-4 w-4 text-chart-2" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <span className="font-medium">{entry.asset}</span>
                    <Badge 
                      variant={entry.direction === "long" ? "default" : "destructive"}
                      className="text-[10px] h-5"
                    >
                      {entry.direction.toUpperCase()}
                    </Badge>
                  </div>
                  {entry.pnl && (
                    <span className={cn(
                      "text-sm font-mono",
                      parseFloat(entry.pnl) >= 0 ? "text-chart-2" : "text-destructive"
                    )}>
                      {parseFloat(entry.pnl) >= 0 ? "+" : ""}{entry.pnl}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{format(new Date(entry.createdAt), "MMM d, h:mm a")}</span>
                  {entry.confidence !== undefined && (
                    <span>Confidence: {entry.confidence}%</span>
                  )}
                </div>
                
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] h-5">
                        {tag}
                      </Badge>
                    ))}
                    {entry.tags.length > 3 && (
                      <Badge variant="outline" className="text-[10px] h-5">
                        +{entry.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
