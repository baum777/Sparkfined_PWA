import { TradeEntryForm } from "@/features/journal/components";
import { JournalProgress, JournalEmptyState } from "@/components/journal";
import { useTradesStore, type Trade } from "@/features/journal";
import { toast } from "@/hooks/use-toast";

export default function Journal() {
  const { trades, addTrade } = useTradesStore();

  const handleTradeSubmit = (data: Omit<Trade, "id" | "createdAt">) => {
    addTrade(data);
    toast({
      title: "Trade logged",
      description: "Your trade has been saved successfully.",
    });
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6" data-testid="page-journal">
      {/* Header with Progress */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Journal</h1>
          <p className="text-sm text-muted-foreground">
            Log and review your trades with notes and custom tags.
          </p>
        </div>
        <JournalProgress currentStep="state" />
      </div>

      {/* Trade Entry Form */}
      <TradeEntryForm onSubmit={handleTradeSubmit} />

      {/* Trade List or Empty State */}
      {trades.length === 0 ? (
        <JournalEmptyState />
      ) : (
        <div className="text-sm text-muted-foreground">
          {trades.length} trade{trades.length !== 1 ? "s" : ""} logged
        </div>
      )}
    </div>
  );
}
