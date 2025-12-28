import { useState } from "react";
import { Sparkles, FileText, MessageSquare, Lightbulb } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChartBottomTabsProps {
  symbol: string;
  className?: string;
}

export function ChartBottomTabs({ symbol, className }: ChartBottomTabsProps) {
  const [activeTab, setActiveTab] = useState("pulse");

  return (
    <div className={cn("border-t border-border bg-card", className)} data-testid="chart-bottom-tabs">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="pulse"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            data-testid="chart-tab-pulse"
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            Grok Pulse
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            data-testid="chart-tab-notes"
          >
            <FileText className="mr-1.5 h-4 w-4" />
            Journal Notes
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-32">
          <TabsContent value="pulse" className="m-0 p-4">
            <div className="flex flex-col gap-3" data-testid="chart-pulse-content">
              <div className="flex items-start gap-3 rounded-md bg-secondary/30 p-3">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Market Sentiment</p>
                  <p className="mt-1 text-muted-foreground">
                    {symbol} showing bullish momentum on the 4H timeframe. Key resistance at previous swing high.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-md bg-secondary/30 p-3">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Pattern Alert</p>
                  <p className="mt-1 text-muted-foreground">
                    Potential bull flag forming. Watch for breakout above consolidation.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="m-0 p-4">
            <div className="flex flex-col gap-3" data-testid="chart-notes-content">
              <div className="rounded-md bg-secondary/30 p-3 text-sm">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Today, 10:30 AM</span>
                  <span className="rounded bg-primary/20 px-1.5 py-0.5 text-primary">Long</span>
                </div>
                <p className="mt-2 text-foreground">
                  Entry at support level. Targeting previous high with 2:1 RR.
                </p>
              </div>
              <div className="rounded-md bg-secondary/30 p-3 text-sm">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Yesterday, 2:15 PM</span>
                  <span className="rounded bg-destructive/20 px-1.5 py-0.5 text-destructive">Short</span>
                </div>
                <p className="mt-2 text-foreground">
                  Rejected at resistance. Clean setup with good volume confirmation.
                </p>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Notes from your journal entries for {symbol}
              </p>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
