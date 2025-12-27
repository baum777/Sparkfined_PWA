import { BookOpen, ArrowUp } from "lucide-react";

export function JournalEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center"
      data-testid="journal-empty-state"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <BookOpen className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="font-medium">No trades logged yet</h3>
        <p className="text-sm text-muted-foreground">
          Start your mastery journey by logging your first trade above.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ArrowUp className="h-4 w-4" />
        <span>Use the form above to log a trade</span>
      </div>
    </div>
  );
}
