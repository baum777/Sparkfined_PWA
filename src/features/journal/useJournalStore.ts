import { useSyncExternalStore, useCallback, useEffect } from "react";
import { notifyContextChange } from "@/lib/handbook/handbookContext";
import { db } from "@/lib/db/db";
import type {
  AutoCapturedEntry,
  ArchivedEntry,
  ConfirmedEntry,
  EntryEnrichment,
  ArchiveReason,
  PendingStatus,
  ExtendedDataSettings,
} from "./types";

const SETTINGS_KEY = "sparkfined_extended_settings";
const MIGRATION_KEY = "sparkfined_dexie_migration_v1";

// In-memory mirrors for UI reactivity
let pendingEntries: AutoCapturedEntry[] = [];
let archivedEntries: ArchivedEntry[] = [];
let confirmedEntries: ConfirmedEntry[] = [];
let extendedSettings: ExtendedDataSettings = {
  preset: "default",
  marketContext: true,
  technicalIndicators: true,
  onChainMetrics: false,
  customTimeframes: ["1h", "4h", "1d"],
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
  notifyContextChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// --- Persistence Helpers ---

type DBEntry = {
    status: string;
    [key: string]: unknown;
}

async function loadFromDexie() {
  try {
    const all = await db.entries.toArray();
    
    // Map DB entries back to domain types
    
    const pending: AutoCapturedEntry[] = [];
    const archived: ArchivedEntry[] = [];
    const confirmed: ConfirmedEntry[] = [];
    
    all.forEach((e) => {
        // Basic mapping - assume 'e' has necessary fields or defaults
        // Cast to unknown first to avoid any type issues, then check status
        const entry = e as unknown as DBEntry;
        
        if (entry.status === 'active' || entry.status === 'ready' || entry.status === 'expiring') {
            // Reconstruct AutoCapturedEntry
             pending.push(entry as unknown as AutoCapturedEntry);
        } else if (entry.status === 'archived') {
             archived.push(entry as unknown as ArchivedEntry);
        } else if (entry.status === 'confirmed') {
             confirmed.push(entry as unknown as ConfirmedEntry);
        }
    });

    // Update in-memory state
    pendingEntries = pending.map(computeDerived); // Re-compute derived fields
    archivedEntries = archived;
    confirmedEntries = confirmed;
    
    emitChange();
  } catch (err) {
    console.error("Failed to load journal from Dexie:", err);
  }
}

async function persistEntry(entry: unknown) {
  try {
     // Ensure we strip derived fields if necessary, or just store everything.
     // Dexie ignores fields not in index if we don't define a strict schema mapping, 
     // but we should be careful. computed fields like 'timeLeftMs' don't need persistence.
     // Casting to any to access properties for destructuring, safe enough here as we just want to omit specific keys
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     const { isFullExit, timeLeftMs, ...persistable } = entry as any;
     await db.entries.put(persistable);
  } catch (err) {
     console.error("Failed to persist entry:", err);
  }
}

async function deleteFromDexie(id: string) {
    try {
        await db.entries.delete(id);
    } catch (err) {
        console.error("Failed to delete entry:", err);
    }
}

// --- Migration ---

async function migrateFromLocalStorage() {
  if (localStorage.getItem(MIGRATION_KEY)) return;

  try {
    console.log("Starting Dexie migration...");
    const pendingRaw = localStorage.getItem("sparkfined_pending_entries");
    const archivedRaw = localStorage.getItem("sparkfined_archived_entries");
    const confirmedRaw = localStorage.getItem("sparkfined_confirmed_entries");

    const promises = [];

    if (pendingRaw) {
       const pending = JSON.parse(pendingRaw);
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       promises.push(db.entries.bulkPut(pending.map((e: any) => ({...e, status: 'active'}))));
    }
    if (archivedRaw) {
       const archived = JSON.parse(archivedRaw);
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       promises.push(db.entries.bulkPut(archived.map((e: any) => ({...e, status: 'archived'}))));
    }
    if (confirmedRaw) {
       const confirmed = JSON.parse(confirmedRaw);
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       promises.push(db.entries.bulkPut(confirmed.map((e: any) => ({...e, status: 'confirmed'}))));
    }

    await Promise.all(promises);
    localStorage.setItem(MIGRATION_KEY, "true");
    console.log("Dexie migration complete.");
    
    // Trigger load
    await loadFromDexie();
  } catch (err) {
    console.error("Dexie migration failed:", err);
    // Don't mark as complete so we try again next time, or handle partials.
  }
}

// --- Store Logic ---

function getPendingSnapshot() { return pendingEntries; }
function getArchivedSnapshot() { return archivedEntries; }
function getConfirmedSnapshot() { return confirmedEntries; }
function getSettingsSnapshot() { return extendedSettings; }

function computeDerived(entry: AutoCapturedEntry): AutoCapturedEntry {
  const now = Date.now();
  const expiresAt = new Date(entry.expiresAt).getTime();
  const timeLeftMs = Math.max(0, expiresAt - now);
  
  const totalBought = entry.txs
    .filter((tx) => tx.type === "BUY")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalSold = entry.txs
    .filter((tx) => tx.type === "SELL")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const isFullExit = totalSold >= totalBought && totalSold > 0;

  let status: PendingStatus = "active";
  if (isFullExit) {
    status = "ready";
  } else if (timeLeftMs < 3600000) {
    status = "expiring";
  }

  return { ...entry, isFullExit, timeLeftMs, status };
}

function addPendingEntry(entry: Omit<AutoCapturedEntry, "id">) {
  const newEntry: AutoCapturedEntry = {
    ...entry,
    id: crypto.randomUUID(),
  };
  const derived = computeDerived(newEntry);
  pendingEntries = [derived, ...pendingEntries];
  emitChange();
  
  persistEntry({...derived, status: 'active'}); // Fire and forget persistence
  return newEntry;
}

function updatePendingEntry(id: string, updates: Partial<AutoCapturedEntry>) {
  pendingEntries = pendingEntries.map((entry) => {
    if (entry.id === id) {
        const updated = computeDerived({ ...entry, ...updates });
        persistEntry({...updated, status: 'active'});
        return updated;
    }
    return entry;
  });
  emitChange();
}

function archiveEntry(id: string, reason: ArchiveReason) {
  const entry = pendingEntries.find((e) => e.id === id);
  if (!entry) return;

  const archivedEntry: ArchivedEntry = {
    ...entry,
    archivedAt: new Date().toISOString(),
    archiveReason: reason,
  };

  pendingEntries = pendingEntries.filter((e) => e.id !== id);
  archivedEntries = [archivedEntry, ...archivedEntries];
  emitChange();

  // Transactional update ideally, but separate calls fine for now
  deleteFromDexie(id); // If ID changes or we move tables (here table is same, just status changes)
  // Actually, since it's same table 'entries', we just update status
  persistEntry({...archivedEntry, status: 'archived'});
  
  return archivedEntry;
}

function confirmEntry(id: string, enrichment: EntryEnrichment, fromArchive = false) {
  const source = fromArchive ? archivedEntries : pendingEntries;
  const entry = source.find((e) => e.id === id);
  if (!entry) return;

  const confirmedEntry: ConfirmedEntry = {
    ...entry,
    confirmedAt: new Date().toISOString(),
    enrichment,
  };

  if (fromArchive) {
    archivedEntries = archivedEntries.filter((e) => e.id !== id);
  } else {
    pendingEntries = pendingEntries.filter((e) => e.id !== id);
  }

  confirmedEntries = [confirmedEntry, ...confirmedEntries];
  emitChange();

  persistEntry({...confirmedEntry, status: 'confirmed'});

  return confirmedEntry;
}

function deletePendingEntry(id: string) {
  pendingEntries = pendingEntries.filter((e) => e.id !== id);
  emitChange();
  deleteFromDexie(id);
}

function deleteArchivedEntry(id: string) {
  archivedEntries = archivedEntries.filter((e) => e.id !== id);
  emitChange();
  deleteFromDexie(id);
}

function updateExtendedSettings(updates: Partial<ExtendedDataSettings>) {
  extendedSettings = { ...extendedSettings, ...updates };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(extendedSettings));
  emitChange();
}

function refreshPendingDerived() {
  pendingEntries = pendingEntries.map(computeDerived);
  emitChange();
}

function processExpiredEntries() {
  const now = Date.now();
  const expired = pendingEntries.filter(
    (entry) => new Date(entry.expiresAt).getTime() <= now
  );
  
  expired.forEach((entry) => {
    archiveEntry(entry.id, "expired");
  });
}

// Hook
export function useJournalStore() {
  const pending = useSyncExternalStore(subscribe, getPendingSnapshot, getPendingSnapshot);
  const archived = useSyncExternalStore(subscribe, getArchivedSnapshot, getArchivedSnapshot);
  const confirmed = useSyncExternalStore(subscribe, getConfirmedSnapshot, getConfirmedSnapshot);
  const settings = useSyncExternalStore(subscribe, getSettingsSnapshot, getSettingsSnapshot);

  // Init on mount
  useEffect(() => {
    migrateFromLocalStorage();
    loadFromDexie();
  }, []);

  return {
    pendingEntries: pending,
    archivedEntries: archived,
    confirmedEntries: confirmed,
    extendedSettings: settings,
    pendingCount: pending.length,
    archivedCount: archived.length,
    confirmedCount: confirmed.length,
    addPendingEntry: useCallback(addPendingEntry, []),
    updatePendingEntry: useCallback(updatePendingEntry, []),
    archiveEntry: useCallback(archiveEntry, []),
    confirmEntry: useCallback(confirmEntry, []),
    deletePendingEntry: useCallback(deletePendingEntry, []),
    deleteArchivedEntry: useCallback(deleteArchivedEntry, []),
    updateExtendedSettings: useCallback(updateExtendedSettings, []),
    refreshPendingDerived: useCallback(refreshPendingDerived, []),
    processExpiredEntries: useCallback(processExpiredEntries, []),
  };
}

export {
  addPendingEntry,
  archiveEntry,
  confirmEntry,
  deletePendingEntry,
};
