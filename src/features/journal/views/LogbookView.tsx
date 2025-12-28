import { useState, useMemo } from "react";
import { Archive, BookOpen, Zap } from "lucide-react";
import { LogbookFilters } from "../components/LogbookFilters";
import { LogbookRow } from "../components/LogbookRow";
import { QuickLogModal } from "../components/QuickLogModal";
import type { ArchivedEntry, ArchiveReason, EntryEnrichment } from "../types";

interface LogbookViewProps {
  entries?: ArchivedEntry[];
  onConfirmEntry?: (id: string, enrichment: EntryEnrichment) => void;
}

// Mock data for development
const MOCK_ENTRIES: ArchivedEntry[] = [
  {
    id: "a1",
    token: { symbol: "PEPE", name: "Pepe" },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastActivityAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: new Date(Date.now() - 3600000).toISOString(),
    position: { avgEntry: 0.0000012, sizeUsd: 320 },
    pnl: { unrealizedUsd: 0, realizedUsd: 96, pct: 30 },
    txs: [
      { type: "BUY", time: new Date(Date.now() - 86400000 * 2).toISOString(), amount: 266666666, priceUsd: 0.0000012, valueUsd: 320 },
      { type: "SELL", time: new Date(Date.now() - 86400000).toISOString(), amount: 266666666, priceUsd: 0.00000156, valueUsd: 416 },
    ],
    archivedAt: new Date(Date.now() - 86400000).toISOString(),
    archiveReason: "full_exit",
  },
  {
    id: "a2",
    token: { symbol: "MEW", name: "cat in a dogs world" },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastActivityAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    expiresAt: new Date(Date.now() - 86400000).toISOString(),
    position: { avgEntry: 0.0089, sizeUsd: 445 },
    pnl: { unrealizedUsd: 0, realizedUsd: -89, pct: -20 },
    txs: [
      { type: "BUY", time: new Date(Date.now() - 86400000 * 3).toISOString(), amount: 50000, priceUsd: 0.0089, valueUsd: 445 },
    ],
    archivedAt: new Date(Date.now() - 86400000).toISOString(),
    archiveReason: "expired",
  },
  {
    id: "a3",
    token: { symbol: "SLERF", name: "Slerf" },
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    lastActivityAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    expiresAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    position: { avgEntry: 0.42, sizeUsd: 840 },
    pnl: { unrealizedUsd: 0, realizedUsd: 0, pct: 0 },
    txs: [
      { type: "BUY", time: new Date(Date.now() - 86400000 * 4).toISOString(), amount: 2000, priceUsd: 0.42, valueUsd: 840 },
    ],
    archivedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    archiveReason: "expired",
  },
  {
    id: "a4",
    token: { symbol: "BOME", name: "Book of Meme" },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastActivityAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    expiresAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    position: { avgEntry: 0.0125, sizeUsd: 625 },
    pnl: { unrealizedUsd: 0, realizedUsd: 187.50, pct: 30 },
    txs: [
      { type: "BUY", time: new Date(Date.now() - 86400000 * 5).toISOString(), amount: 50000, priceUsd: 0.0125, valueUsd: 625 },
      { type: "SELL", time: new Date(Date.now() - 86400000 * 4).toISOString(), amount: 50000, priceUsd: 0.01625, valueUsd: 812.50 },
    ],
    archivedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    archiveReason: "full_exit",
  },
  {
    id: "a5",
    token: { symbol: "MYRO", name: "Myro" },
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    lastActivityAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    expiresAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    position: { avgEntry: 0.18, sizeUsd: 360 },
    pnl: { unrealizedUsd: 0, realizedUsd: -72, pct: -20 },
    txs: [
      { type: "BUY", time: new Date(Date.now() - 86400000 * 6).toISOString(), amount: 2000, priceUsd: 0.18, valueUsd: 360 },
    ],
    archivedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    archiveReason: "expired",
  },
];

function isWithinDateRange(dateStr: string, range: "all" | "today" | "week" | "month"): boolean {
  if (range === "all") return true;
  
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case "today":
      return date >= today;
    case "week": {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }
    case "month": {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return date >= monthAgo;
    }
    default:
      return true;
  }
}

export function LogbookView({ entries = MOCK_ENTRIES, onConfirmEntry }: LogbookViewProps) {
  const [search, setSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState<ArchiveReason | "all">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  
  // QuickLog modal state
  const [selectedEntry, setSelectedEntry] = useState<ArchivedEntry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

    // Date filter
    result = result.filter((e) => isWithinDateRange(e.archivedAt, dateFilter));

    // Sort by archivedAt descending (newest first)
    result.sort(
      (a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime()
    );

    return result;
  }, [entries, search, reasonFilter, dateFilter]);

  // Count expired entries for nudge
  const expiredCount = entries.filter((e) => e.archiveReason === "expired").length;
  const showNudge = expiredCount >= 3;

  const handleAddToJournal = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      setSelectedEntry(entry);
      setModalOpen(true);
    }
  };

  const handleSaveEnrichment = (enrichment: EntryEnrichment) => {
    if (selectedEntry && onConfirmEntry) {
      onConfirmEntry(selectedEntry.id, enrichment);
    }
    setModalOpen(false);
    setSelectedEntry(null);
  };

  // Empty state
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
    <div className="space-y-4" data-testid="logbook-view">
      {/* Filters */}
      <LogbookFilters
        search={search}
        onSearchChange={setSearch}
        reasonFilter={reasonFilter}
        onReasonFilterChange={setReasonFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />

      {/* Expired Nudge */}
      {showNudge && (
        <div 
          className="p-3 rounded-xl bg-brand/10 border border-brand/20 flex items-center gap-3"
          data-testid="expired-nudge"
        >
          <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-brand">
              {expiredCount} expired entries waiting
            </p>
            <p className="text-xs text-brand/70">
              Quick Log them to build your journal and track patterns
            </p>
          </div>
          <BookOpen className="h-5 w-5 text-brand/50 shrink-0" />
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-2">
        {filteredEntries.map((entry) => (
          <LogbookRow
            key={entry.id}
            entry={entry}
            onAddToJournal={handleAddToJournal}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredEntries.length === 0 && entries.length > 0 && (
        <div className="text-center py-8 text-text-tertiary text-sm">
          No entries match your filters
        </div>
      )}

      {/* Quick Log Modal */}
      <QuickLogModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        entry={selectedEntry}
        onSave={handleSaveEnrichment}
        onSkip={() => {
          setModalOpen(false);
          setSelectedEntry(null);
        }}
      />
    </div>
  );
}
