import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface JournalSnapshotCardProps {
  lastEntryDate?: string;
  totalEntries: number;
  thisWeekEntries: number;
}

export function JournalSnapshotCard({
  lastEntryDate,
  totalEntries,
  thisWeekEntries,
}: JournalSnapshotCardProps) {
  return (
    <Card data-testid="dashboard-journal-snapshot">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Journal Snapshot
          </CardTitle>
          <Link
            to="/journal"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            data-testid="dashboard-journal-link"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold">{totalEntries}</p>
            <p className="text-xs text-muted-foreground">Total entries</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{thisWeekEntries}</p>
            <p className="text-xs text-muted-foreground">This week</p>
          </div>
        </div>
        
        {lastEntryDate && (
          <p className="text-xs text-muted-foreground">
            Last entry: {lastEntryDate}
          </p>
        )}
        
        <Button asChild variant="outline" size="sm" className="w-full" data-testid="dashboard-journal-cta">
          <Link to="/journal" className="gap-2">
            Open Journal
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
