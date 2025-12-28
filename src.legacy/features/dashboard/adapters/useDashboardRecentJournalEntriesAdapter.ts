import { useMemo } from "react";
import type { JournalEntry } from "@/store/journalStore";
import { getEntryDate } from "@/lib/dashboard/calculateKPIs";

export function useDashboardRecentJournalEntriesAdapter(journalEntries: JournalEntry[], limit = 3): JournalEntry[] {
  return useMemo(() => {
    if (!journalEntries.length) {
      return [];
    }

    return [...journalEntries]
      .map((entry) => ({ entry, timestamp: getEntryDate(entry)?.getTime() ?? 0 }))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, Math.max(1, limit))
      .map(({ entry }) => entry);
  }, [journalEntries, limit]);
}

