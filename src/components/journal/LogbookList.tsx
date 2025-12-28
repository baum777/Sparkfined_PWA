import { useState, useMemo } from "react";
import { Archive, Calendar, Search, BookOpen, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ArchivedEntry, ArchiveReason } from "@/features/journal/types";

interface LogbookListProps {
  entries: ArchivedEntry[];
  onAddToJournal: (id: string) => void;
  onViewDetails: (id: string) => void;
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const reasonLabels: Record<ArchiveReason, string> = {
  full_exit: "Full Exit",
  expired: "Expired",
  manual: "Manual",
};

const reasonColors: Record<ArchiveReason, string> = {
  full_exit: "bg-sentiment-bull-bg text-sentiment-bull border-sentiment-bull-border",
  expired: "bg-surface-subtle text-text-tertiary border-border-sf-subtle",
  manual: "bg-brand/20 text-brand border-brand/30",
};

export function LogbookList({ entries, onAddToJournal, onViewDetails }: LogbookListProps) {
  const [search, setSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState<ArchiveReason | "all">("all");

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let result = [...entries];

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.token.symbol.toLowerCase().includes(query) ||
          e.token.name.toLowerCase().includes(query)
      );
    }

    // Reason filter
    if (reasonFilter !== "all") {
      result = result.filter((e) => e.archiveReason === reasonFilter);
    }

    // Sort by archivedAt descending
    result.sort(
      (a, b) =>
        new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime()
    );

    return result;
  }, [entries, search, reasonFilter]);

  // Count expired entries for nudge
  const expiredCount = entries.filter((e) => e.archiveReason === "expired").length;

  if (entries.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-16 text-center"
        data-testid="logbook-empty-state"
      >
        <div className="w-16 h-16 rounded-2xl bg-surface-subtle flex items-center justify-center mb-4">
          <Archive className="h-8 w-8 text-text-tertiary" />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">
          No archived entries
        </h3>
        <p className="text-sm text-text-secondary max-w-sm">
          Completed and expired trades will appear here. You can still add them to your journal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="logbook-list">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input
            placeholder="Search tokens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-surface-subtle border-border-sf-moderate"
            data-testid="logbook-search"
          />
        </div>
        <Select
          value={reasonFilter}
          onValueChange={(v) => setReasonFilter(v as ArchiveReason | "all")}
        >
          <SelectTrigger 
            className="w-full sm:w-40 bg-surface-subtle border-border-sf-moderate"
            data-testid="logbook-filter-reason"
          >
            <SelectValue placeholder="All reasons" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reasons</SelectItem>
            <SelectItem value="full_exit">Full Exit</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Expired nudge */}
      {expiredCount > 3 && (
        <div className="p-3 rounded-xl bg-brand/10 border border-brand/20 text-sm text-brand flex items-center gap-2">
          <BookOpen className="h-4 w-4 shrink-0" />
          <span>
            {expiredCount} expired entries — Quick Log them to build your journal
          </span>
        </div>
      )}

      {/* Entries */}
      <div className="space-y-2">
        {filteredEntries.map((entry) => {
          const pnl = entry.pnl.realizedUsd;
          const pnlPositive = pnl >= 0;

          return (
            <Card
              key={entry.id}
              className="border-border-sf-subtle bg-surface"
              data-testid="logbook-card"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  {/* Token + Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-text-primary">
                        {entry.token.symbol}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${reasonColors[entry.archiveReason]}`}
                      >
                        {reasonLabels[entry.archiveReason]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-tertiary">
                      <Calendar className="h-3 w-3" />
                      {formatDate(entry.archivedAt)}
                    </div>
                  </div>

                  {/* PnL */}
                  <div
                    className={`flex items-center gap-1 font-mono font-medium ${
                      pnlPositive ? "text-sentiment-bull" : "text-sentiment-bear"
                    }`}
                  >
                    {pnlPositive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {formatUsd(pnl)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    className="flex-1 bg-brand hover:bg-brand-hover text-black"
                    onClick={() => onAddToJournal(entry.id)}
                    data-testid="logbook-add-btn"
                  >
                    Add to Journal
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border-sf-moderate bg-surface-subtle hover:bg-surface-hover"
                    onClick={() => onViewDetails(entry.id)}
                    data-testid="logbook-view-btn"
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEntries.length === 0 && entries.length > 0 && (
        <div className="text-center py-8 text-text-tertiary text-sm">
          No entries match your filters
        </div>
      )}
    </div>
  );
}
