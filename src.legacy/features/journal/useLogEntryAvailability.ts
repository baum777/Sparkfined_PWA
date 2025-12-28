import { useTradeEventInbox, type TradeEventInboxItem } from "@/hooks/useTradeEventInbox";

type InboxEvents = ReturnType<typeof useTradeEventInbox>["events"];
export type BuySignalEvent = InboxEvents extends Array<infer Item> ? Item : never;

export function useLogEntryAvailability(limit = 20) {
  const { events, isLoading, unconsumedCount, refresh } = useTradeEventInbox(limit);

  return {
    events,
    isLoading,
    pendingCount: unconsumedCount,
    hasBuySignal: unconsumedCount > 0,
    refresh,
  };
}

export type { TradeEventInboxItem };
