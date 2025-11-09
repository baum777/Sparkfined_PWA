/**
 * useJournal Hook - BLOCK 1: Migrated to Unified Schema
 * 
 * Now uses JournalService (IndexedDB) instead of localStorage
 * Maintains same API surface for backward compatibility
 */

import React from "react";
import type { JournalEntry } from "@/types/journal";
import {
  createEntry,
  updateEntry,
  deleteEntry,
  queryEntries,
  getTempEntries,
  getActiveEntries,
} from "@/lib/JournalService";

export function useJournal() {
  const [entries, setEntries] = React.useState<JournalEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Load all entries on mount
  React.useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const all = await queryEntries({ status: "all" });
      setEntries(all);
    } catch (error) {
      console.error("Failed to load journal entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const create = async (
    partial: Partial<Omit<JournalEntry, "id" | "createdAt" | "updatedAt">>
  ): Promise<JournalEntry> => {
    // Ensure required fields have defaults
    const entry = await createEntry({
      ticker: partial.ticker || "UNKNOWN",
      address: partial.address || "",
      setup: partial.setup || "custom",
      emotion: partial.emotion || "uncertain",
      status: partial.status || "active",
      ...partial,
    });
    setEntries((s) => [entry, ...s]);
    return entry;
  };

  const update = async (
    id: string,
    patch: Partial<Omit<JournalEntry, "id" | "createdAt">>
  ) => {
    const updated = await updateEntry(id, patch);
    if (updated) {
      setEntries((s) => s.map((e) => (e.id === id ? updated : e)));
    }
  };

  const remove = async (id: string) => {
    await deleteEntry(id);
    setEntries((s) => s.filter((e) => e.id !== id));
  };

  // New helpers for status-based queries
  const loadTempEntries = async () => {
    const temp = await getTempEntries();
    return temp;
  };

  const loadActiveEntries = async () => {
    const active = await getActiveEntries();
    return active;
  };

  return {
    entries,
    notes: entries, // Backward compat (alias)
    loading,
    create,
    update,
    remove,
    refresh: loadEntries,
    loadTempEntries,
    loadActiveEntries,
  };
}
