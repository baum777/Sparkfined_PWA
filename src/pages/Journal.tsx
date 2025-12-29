import { useState } from "react";
import { JournalView } from "@/features/journal/JournalView";
import { useJournalStore } from "@/features/journal/useJournalStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart2, List } from "lucide-react";

export default function Journal() {
  const { pendingCount, archivedCount, confirmedCount } = useJournalStore();
  const [viewMode, setViewMode] = useState("list");

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6" data-testid="page-journal">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Journal</h1>
          <p className="text-sm text-muted-foreground">
            Auto-capture trades, add notes, and build self-awareness.
          </p>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
         <div className="flex items-center justify-between mb-4">
             <TabsList>
                 <TabsTrigger value="list" className="gap-2">
                    <List className="h-4 w-4" />
                    List
                 </TabsTrigger>
                 <TabsTrigger value="analytics" className="gap-2">
                    <BarChart2 className="h-4 w-4" />
                    Analytics
                 </TabsTrigger>
             </TabsList>
         </div>

         <TabsContent value="list" className="mt-0">
             <JournalView
                confirmedCount={confirmedCount}
                pendingCount={pendingCount}
                archivedCount={archivedCount}
             />
         </TabsContent>

         <TabsContent value="analytics" className="mt-0">
             <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg border-dashed bg-muted/20">
                 <BarChart2 className="h-8 w-8 text-muted-foreground mb-4 opacity-50" />
                 <h3 className="text-lg font-medium text-foreground">Analytics</h3>
                 <p className="text-muted-foreground">Detailed performance metrics coming soon.</p>
             </div>
         </TabsContent>
      </Tabs>
    </div>
  );
}
