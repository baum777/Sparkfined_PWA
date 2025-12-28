import { useEffect, useState } from "react";
import { getAllTrades, type TradeEntry } from "@/lib/db";

export interface DashboardTradeEntriesState {
  tradeEntries: TradeEntry[];
  isLoading: boolean;
}

/**
 * Dashboard-only adapter for fetching trade inbox entries used by KPI strip.
 * No polling: single load on mount.
 */
export function useDashboardTradeEntriesAdapter(): DashboardTradeEntriesState {
  const [tradeEntries, setTradeEntries] = useState<TradeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    void (async () => {
      try {
        const entries = await getAllTrades();
        if (mounted) setTradeEntries(entries);
      } catch {
        if (mounted) setTradeEntries([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { tradeEntries, isLoading };
}

