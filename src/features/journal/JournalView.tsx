import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ConfirmedView, PendingView, LogbookView } from "./views";

export type JournalTab = "journal" | "pending" | "logbook";

interface JournalViewProps {
  confirmedCount?: number;
  pendingCount?: number;
  archivedCount?: number;
}

export function JournalView({
  confirmedCount = 0,
  pendingCount = 0,
  archivedCount = 0,
}: JournalViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("view") as JournalTab) || "journal";

  const handleTabChange = (value: string) => {
    setSearchParams({ view: value });
  };

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={handleTabChange} 
      className="w-full"
      data-testid="journal-tabs"
    >
      {/* Segmented Control */}
      <TabsList className="w-full grid grid-cols-3 h-11 bg-surface-subtle border border-border-sf-subtle rounded-xl p-1">
        <TabsTrigger
          value="journal"
          className="gap-2 rounded-lg text-sm font-medium data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm"
          data-testid="tab-journal"
        >
          Journal
          {confirmedCount > 0 && (
            <Badge 
              variant="secondary" 
              className="h-5 min-w-5 px-1.5 text-[10px] bg-brand/20 text-brand border-0"
            >
              {confirmedCount}
            </Badge>
          )}
        </TabsTrigger>
        
        <TabsTrigger
          value="pending"
          className="gap-2 rounded-lg text-sm font-medium data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm"
          data-testid="tab-pending"
        >
          Pending
          {pendingCount > 0 && (
            <Badge 
              variant="secondary" 
              className="h-5 min-w-5 px-1.5 text-[10px] bg-sentiment-neutral-bg text-sentiment-neutral border-0"
            >
              {pendingCount}
            </Badge>
          )}
        </TabsTrigger>
        
        <TabsTrigger
          value="logbook"
          className="gap-2 rounded-lg text-sm font-medium data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm"
          data-testid="tab-logbook"
        >
          Logbook
          {archivedCount > 0 && (
            <Badge 
              variant="secondary" 
              className="h-5 min-w-5 px-1.5 text-[10px] bg-surface-hover text-text-tertiary border-0"
            >
              {archivedCount}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      {/* Tab Content */}
      <TabsContent value="journal" className="mt-4">
        <ConfirmedView />
      </TabsContent>

      <TabsContent value="pending" className="mt-4">
        <PendingView />
      </TabsContent>

      <TabsContent value="logbook" className="mt-4">
        <LogbookView />
      </TabsContent>
    </Tabs>
  );
}
