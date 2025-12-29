import { JournalView } from "@/features/journal/JournalView";
import { useJournalStore } from "@/features/journal/useJournalStore";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { TradeEntryForm } from "@/features/journal/components/TradeEntryForm";
import { useState } from "react";

export default function Journal() {
  const { pendingCount, archivedCount, confirmedCount } = useJournalStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-brand text-black hover:bg-brand-hover shadow-glow-brand" data-testid="journal-quick-add-btn">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Log Trade</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-surface border-border-sf-subtle" data-testid="journal-quick-add-modal">
            {/* TradeEntryForm has its own title, but Dialog requires one for accessibility if not provided inside */}
            <div className="sr-only">
              <DialogHeader>
                <DialogTitle>Log New Trade</DialogTitle>
              </DialogHeader>
            </div>
            <TradeEntryForm onSubmit={() => setIsAddModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Journal View with Segmented Control */}
      <JournalView
        confirmedCount={confirmedCount}
        pendingCount={pendingCount}
        archivedCount={archivedCount}
      />
    </div>
  );
}
