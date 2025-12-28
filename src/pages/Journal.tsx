import { JournalView } from "@/features/journal/JournalView";
import { useJournalStore } from "@/features/journal/useJournalStore";

export default function Journal() {
  const { pendingCount, archivedCount, confirmedCount } = useJournalStore();

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6" data-testid="page-journal">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Journal</h1>
        <p className="text-sm text-muted-foreground">
          Auto-capture trades, add notes, and build self-awareness.
        </p>
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
