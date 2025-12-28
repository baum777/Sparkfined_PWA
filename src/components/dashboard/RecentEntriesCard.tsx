import { ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type EntryType = "buy" | "sell" | "hold";

interface JournalEntry {
  id: string;
  title: string;
  description: string;
  symbol: string;
  type: EntryType;
  date: Date;
}

interface RecentEntriesCardProps {
  entries?: JournalEntry[];
  onViewJournal?: () => void;
  onViewEntry?: (id: string) => void;
  isWalletConnected?: boolean;
  onConnectWallet?: () => void;
}

const typeConfig: Record<EntryType, { label: string; badgeClass: string }> = {
  buy: { label: "Buy", badgeClass: "badge-bull" },
  sell: { label: "Sell", badgeClass: "badge-bear" },
  hold: { label: "Hold", badgeClass: "badge-neutral" },
};

function EntryCard({ entry, onView }: { entry: JournalEntry; onView?: () => void }) {
  const config = typeConfig[entry.type];

  return (
    <div 
      className="card-interactive min-w-[200px] flex-1 p-4 space-y-3"
      data-testid={`recent-entry-${entry.id}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={config.badgeClass}>
          {config.label}
        </span>
        <span className="text-xs text-text-secondary font-mono font-medium">{entry.symbol}</span>
      </div>
      <div className="space-y-1.5">
        <h4 className="font-semibold text-sm text-text-primary line-clamp-1">{entry.title}</h4>
        <p className="text-xs text-text-tertiary line-clamp-2 leading-relaxed">{entry.description}</p>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-text-tertiary">
          {format(entry.date, "MMM dd, yyyy")}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs text-brand hover:text-brand-hover gap-1"
          onClick={onView}
        >
          View <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function WalletConnectPrompt({ onConnect }: { onConnect?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
      <div className="p-4 rounded-full bg-surface-subtle border border-border-sf-subtle">
        <Wallet className="h-8 w-8 text-text-tertiary" />
      </div>
      <div className="space-y-2">
        <h4 className="font-medium text-text-primary">Connect your wallet</h4>
        <p className="text-sm text-text-secondary max-w-sm">
          Connect your wallet to see your recent trading activity and journal entries.
        </p>
      </div>
      <button 
        onClick={onConnect}
        className="btn-primary gap-2 inline-flex items-center"
        data-testid="recent-entries-connect-wallet"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </button>
    </div>
  );
}

export function RecentEntriesCard({
  entries = [],
  onViewJournal,
  onViewEntry,
  isWalletConnected = true,
  onConnectWallet,
}: RecentEntriesCardProps) {
  const mockEntries: JournalEntry[] = entries.length > 0 ? entries : [
    {
      id: "1",
      title: "BTC breakout retest",
      description: "Scaled in after reclaim of key level.",
      symbol: "BTC",
      type: "buy",
      date: new Date(2024, 4, 20),
    },
    {
      id: "2",
      title: "ETH range fade",
      description: "Took profit at prior week high.",
      symbol: "ETH",
      type: "sell",
      date: new Date(2024, 4, 20),
    },
    {
      id: "3",
      title: "SOL momentum ride",
      description: "Riding higher lows structure.",
      symbol: "SOL",
      type: "buy",
      date: new Date(2024, 4, 19),
    },
    {
      id: "4",
      title: "AVAX patience entry",
      description: "Staying in swing as plan holds.",
      symbol: "AVAX",
      type: "hold",
      date: new Date(2024, 4, 18),
    },
    {
      id: "5",
      title: "ATOM consolidation watch",
      description: "Waiting for range resolution.",
      symbol: "ATOM",
      type: "hold",
      date: new Date(2024, 4, 18),
    },
  ];

  return (
    <div className="w-full space-y-4" data-testid="dashboard-recent-entries">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-text-tertiary uppercase tracking-wider font-medium">Journal</p>
          <h3 className="text-lg font-semibold text-text-primary">Recent entries</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-text-secondary hover:text-text-primary text-sm"
          onClick={onViewJournal}
          data-testid="recent-entries-view-journal"
        >
          View journal <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      {isWalletConnected ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {mockEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onView={() => onViewEntry?.(entry.id)}
            />
          ))}
        </div>
      ) : (
        <WalletConnectPrompt onConnect={onConnectWallet} />
      )}
    </div>
  );
}
