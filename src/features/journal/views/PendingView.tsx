import { useMemo } from "react";
import { Inbox } from "lucide-react";
import { PendingEntryCard } from "../components/PendingEntryCard";
import { useJournalStore } from "../useJournalStore";
import type { AutoCapturedEntry } from "@/features/journal/types";

interface PendingViewProps {
  entries?: AutoCapturedEntry[];
  onConfirm?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRefreshExtended?: (id: string) => void;
}

// Mock data for development
const MOCK_ENTRIES: AutoCapturedEntry[] = [
  {
    id: "1",
    token: { symbol: "BONK", name: "Bonk" },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    lastActivityAt: new Date(Date.now() - 1800000).toISOString(),
    expiresAt: new Date(Date.now() + 1800000).toISOString(),
    position: { avgEntry: 0.0000021, sizeUsd: 450 },
    pnl: { unrealizedUsd: 67.50, realizedUsd: 0, pct: 15 },
    txs: [
      { type: "BUY", time: new Date(Date.now() - 3600000).toISOString(), amount: 21000000, priceUsd: 0.0000021, valueUsd: 450 },
    ],
    extended: {
      marketContext: { marketCap: 1200000000, marketCapCategory: "mid", volume24h: 89000000 },
      technical: { rsi: 72, rsiCondition: "overbought" },
    },
    status: "expiring",
    timeLeftMs: 1800000,
  },
  {
    id: "2",
    token: { symbol: "WIF", name: "dogwifhat" },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    lastActivityAt: new Date(Date.now() - 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 14400000).toISOString(),
    position: { avgEntry: 2.34, sizeUsd: 1200 },
    pnl: { unrealizedUsd: -84, realizedUsd: 0, pct: -7 },
    txs: [
      { type: "BUY", time: new Date(Date.now() - 7200000).toISOString(), amount: 512, priceUsd: 2.34, valueUsd: 1200 },
    ],
    extended: {
      marketContext: { marketCap: 2400000000, marketCapCategory: "large", volume24h: 156000000 },
      technical: { rsi: 45, rsiCondition: "neutral" },
    },
    status: "active",
    timeLeftMs: 14400000,
  },
  {
    id: "3",
    token: { symbol: "POPCAT", name: "Popcat" },
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    lastActivityAt: new Date(Date.now() - 600000).toISOString(),
    expiresAt: new Date(Date.now() + 82800000).toISOString(),
    position: { avgEntry: 0.89, sizeUsd: 890 },
    pnl: { unrealizedUsd: 0, realizedUsd: 178, pct: 20 },
    txs: [
      { type: "BUY", time: new Date(Date.now() - 10800000).toISOString(), amount: 1000, priceUsd: 0.89, valueUsd: 890 },
      { type: "SELL", time: new Date(Date.now() - 600000).toISOString(), amount: 1000, priceUsd: 1.068, valueUsd: 1068 },
    ],
    extended: {
      marketContext: { marketCap: 450000000, marketCapCategory: "small", volume24h: 32000000 },
      technical: { rsi: 28, rsiCondition: "oversold" },
    },
    status: "ready",
    timeLeftMs: 82800000,
    isFullExit: true,
  },
];

export function PendingView({ 
  entries = MOCK_ENTRIES,
  onConfirm = () => {}, 
  onArchive = () => {}, 
  onDelete = () => {},
  onRefreshExtended,
}: PendingViewProps) {
  // Get extended settings from store
  const { extendedSettings } = useJournalStore();
  // Sort by timeLeft ascending (most urgent first)
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const aTime = a.timeLeftMs ?? Infinity;
      const bTime = b.timeLeftMs ?? Infinity;
      return aTime - bTime;
    });
  }, [entries]);

  // Empty state
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
        <PendingEntryCard
          key={entry.id}
          entry={entry}
          extendedSettings={extendedSettings}
          onConfirm={onConfirm}
          onArchive={onArchive}
          onDelete={onDelete}
          onRefreshExtended={onRefreshExtended}
        />
      ))}
    </div>
  );
}
