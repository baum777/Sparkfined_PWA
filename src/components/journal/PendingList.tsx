import { useMemo } from "react";
import { Inbox } from "lucide-react";
import { PendingCard } from "./PendingCard";
import type { AutoCapturedEntry } from "@/features/journal/types";

interface PendingListProps {
  entries: AutoCapturedEntry[];
  onConfirm: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PendingList({ entries, onConfirm, onArchive, onDelete }: PendingListProps) {
  // Sort by timeLeft ascending (most urgent first)
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const aTime = a.timeLeftMs ?? Infinity;
      const bTime = b.timeLeftMs ?? Infinity;
      return aTime - bTime;
    });
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-16 text-center"
        data-testid="pending-empty-state"
      >
        <div className="w-16 h-16 rounded-2xl bg-surface-subtle flex items-center justify-center mb-4">
          <Inbox className="h-8 w-8 text-text-tertiary" />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">
          No pending trades
        </h3>
        <p className="text-sm text-text-secondary max-w-sm">
          Enable wallet monitoring to auto-capture your swaps. Trades will appear here for 24h before archiving.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="pending-list">
      {sortedEntries.map((entry) => (
        <PendingCard
          key={entry.id}
          entry={entry}
          onConfirm={onConfirm}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
