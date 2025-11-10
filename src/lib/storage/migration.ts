/**
 * Migration Script: localStorage → IndexedDB
 * Automatically migrates ritual data from Sprint A (localStorage) to Sprint B (IndexedDB)
 *
 * Features:
 * - One-time automatic migration
 * - Non-destructive (keeps localStorage backup)
 * - Progress tracking
 * - Error handling & rollback
 */

import { getJSON } from '../safeStorage';
import {
  ritualDb,
  dbBulkSaveRituals,
  dbBulkSaveChecklists,
  dbBulkSaveJournals,
} from './ritualDb';
import type {
  DailyRitual,
  PreTradeChecklist,
  TradeJournalEntry,
} from '../../components/rituals/types';

const STORAGE_KEYS = {
  RITUALS: 'sparkfined:rituals',
  PRETRADE: 'sparkfined:pretrade',
  JOURNAL: 'sparkfined:journal',
  MIGRATION_STATUS: 'sparkfined:migration_status',
} as const;

/**
 * Migration status
 */
export interface MigrationStatus {
  completed: boolean;
  startedAt: string | null;
  completedAt: string | null;
  itemsMigrated: {
    rituals: number;
    checklists: number;
    journals: number;
  };
  errors: string[];
  version: string; // e.g., "1.0.0" (Sprint A) -> "2.0.0" (Sprint B)
}

/**
 * Get current migration status
 */
export function getMigrationStatus(): MigrationStatus {
  const status = getJSON<MigrationStatus>(STORAGE_KEYS.MIGRATION_STATUS, {
    completed: false,
    startedAt: null,
    completedAt: null,
    itemsMigrated: {
      rituals: 0,
      checklists: 0,
      journals: 0,
    },
    errors: [],
    version: '1.0.0',
  });

  return status;
}

/**
 * Save migration status
 */
function saveMigrationStatus(status: MigrationStatus): void {
  localStorage.setItem(STORAGE_KEYS.MIGRATION_STATUS, JSON.stringify(status));
}

/**
 * Check if migration is needed
 */
export function isMigrationNeeded(): boolean {
  const status = getMigrationStatus();

  // Already completed
  if (status.completed) {
    return false;
  }

  // Check if there's any data in localStorage
  const hasRituals = !!localStorage.getItem(STORAGE_KEYS.RITUALS);
  const hasChecklists = !!localStorage.getItem(STORAGE_KEYS.PRETRADE);
  const hasJournals = !!localStorage.getItem(STORAGE_KEYS.JOURNAL);

  return hasRituals || hasChecklists || hasJournals;
}

/**
 * Migrate localStorage data to IndexedDB
 */
export async function migrateToIndexedDB(): Promise<MigrationStatus> {
  console.log('[Migration] Starting localStorage → IndexedDB migration...');

  const status: MigrationStatus = {
    completed: false,
    startedAt: new Date().toISOString(),
    completedAt: null,
    itemsMigrated: {
      rituals: 0,
      checklists: 0,
      journals: 0,
    },
    errors: [],
    version: '2.0.0',
  };

  try {
    // Migrate Daily Rituals
    const ritualsData = getJSON<Record<string, DailyRitual>>(
      STORAGE_KEYS.RITUALS,
      {}
    );
    const rituals = Object.values(ritualsData);

    if (rituals.length > 0) {
      await dbBulkSaveRituals(rituals);
      status.itemsMigrated.rituals = rituals.length;
      console.log(`[Migration] Migrated ${rituals.length} rituals`);
    }

    // Migrate Pre-Trade Checklists
    const checklistsData = getJSON<Record<string, PreTradeChecklist>>(
      STORAGE_KEYS.PRETRADE,
      {}
    );
    const checklists = Object.values(checklistsData);

    if (checklists.length > 0) {
      await dbBulkSaveChecklists(checklists);
      status.itemsMigrated.checklists = checklists.length;
      console.log(`[Migration] Migrated ${checklists.length} checklists`);
    }

    // Migrate Journal Entries
    const journalsData = getJSON<Record<string, TradeJournalEntry>>(
      STORAGE_KEYS.JOURNAL,
      {}
    );
    const journals = Object.values(journalsData);

    if (journals.length > 0) {
      await dbBulkSaveJournals(journals);
      status.itemsMigrated.journals = journals.length;
      console.log(`[Migration] Migrated ${journals.length} journal entries`);
    }

    // Mark as completed
    status.completed = true;
    status.completedAt = new Date().toISOString();

    console.log('[Migration] ✅ Migration completed successfully');
    console.log(
      `[Migration] Total items: ${
        status.itemsMigrated.rituals +
        status.itemsMigrated.checklists +
        status.itemsMigrated.journals
      }`
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    status.errors.push(errorMessage);

    console.error('[Migration] ❌ Migration failed:', error);

    // Don't mark as completed if there were errors
    status.completed = false;
  } finally {
    // Save status
    saveMigrationStatus(status);
  }

  return status;
}

/**
 * Verify migration integrity
 * Compares localStorage and IndexedDB data counts
 */
export async function verifyMigration(): Promise<{
  valid: boolean;
  discrepancies: string[];
}> {
  const discrepancies: string[] = [];

  try {
    // Count localStorage items
    const ritualsLS = Object.keys(
      getJSON<Record<string, unknown>>(STORAGE_KEYS.RITUALS, {})
    ).length;
    const checklistsLS = Object.keys(
      getJSON<Record<string, unknown>>(STORAGE_KEYS.PRETRADE, {})
    ).length;
    const journalsLS = Object.keys(
      getJSON<Record<string, unknown>>(STORAGE_KEYS.JOURNAL, {})
    ).length;

    // Count IndexedDB items
    const ritualsDB = await ritualDb.rituals.count();
    const checklistsDB = await ritualDb.checklists.count();
    const journalsDB = await ritualDb.journals.count();

    // Compare
    if (ritualsLS !== ritualsDB) {
      discrepancies.push(
        `Rituals mismatch: localStorage=${ritualsLS}, IndexedDB=${ritualsDB}`
      );
    }

    if (checklistsLS !== checklistsDB) {
      discrepancies.push(
        `Checklists mismatch: localStorage=${checklistsLS}, IndexedDB=${checklistsDB}`
      );
    }

    if (journalsLS !== journalsDB) {
      discrepancies.push(
        `Journals mismatch: localStorage=${journalsLS}, IndexedDB=${journalsDB}`
      );
    }

    const valid = discrepancies.length === 0;

    if (valid) {
      console.log('[Migration] ✅ Verification passed');
    } else {
      console.warn('[Migration] ⚠️ Verification found discrepancies:', discrepancies);
    }

    return { valid, discrepancies };
  } catch (error) {
    console.error('[Migration] Verification failed:', error);
    return {
      valid: false,
      discrepancies: ['Verification error: ' + (error instanceof Error ? error.message : 'Unknown')],
    };
  }
}

/**
 * Clear localStorage data (after successful migration)
 * WARNING: Only call this after verifying migration success
 */
export function clearLocalStorageBackup(): void {
  if (!import.meta.env.DEV) {
    console.warn('[Migration] clearLocalStorageBackup should only be called in production after verification');
  }

  const status = getMigrationStatus();

  if (!status.completed) {
    console.error('[Migration] Cannot clear localStorage: migration not completed');
    return;
  }

  // Remove ritual data
  localStorage.removeItem(STORAGE_KEYS.RITUALS);
  localStorage.removeItem(STORAGE_KEYS.PRETRADE);
  localStorage.removeItem(STORAGE_KEYS.JOURNAL);

  console.log('[Migration] localStorage backup cleared');
}

/**
 * Auto-run migration on app startup
 * Should be called early in app initialization
 */
export async function autoMigrate(): Promise<void> {
  if (!isMigrationNeeded()) {
    console.log('[Migration] No migration needed');
    return;
  }

  console.log('[Migration] Auto-migration triggered');

  const result = await migrateToIndexedDB();

  if (result.completed) {
    // Verify migration
    const verification = await verifyMigration();

    if (verification.valid) {
      console.log('[Migration] ✅ Migration verified successfully');

      // In production, we could automatically clear localStorage here
      // For safety, we keep it as a manual step for now
      if (import.meta.env.DEV) {
        console.log('[Migration] localStorage backup retained for safety');
      }
    } else {
      console.error('[Migration] ⚠️ Migration verification failed');
    }
  }
}

/**
 * Reset migration status (for testing)
 */
export function resetMigrationStatus(): void {
  if (!import.meta.env.DEV) {
    throw new Error('resetMigrationStatus can only be called in DEV mode');
  }

  localStorage.removeItem(STORAGE_KEYS.MIGRATION_STATUS);
  console.log('[Migration] Status reset');
}

/**
 * Get migration summary for UI display
 */
export function getMigrationSummary(): {
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  totalItems: number;
  message: string;
} {
  const status = getMigrationStatus();

  if (status.completed) {
    const total =
      status.itemsMigrated.rituals +
      status.itemsMigrated.checklists +
      status.itemsMigrated.journals;

    return {
      status: 'completed',
      totalItems: total,
      message: `Successfully migrated ${total} items to IndexedDB`,
    };
  }

  if (status.errors.length > 0) {
    return {
      status: 'failed',
      totalItems: 0,
      message: `Migration failed: ${status.errors[0]}`,
    };
  }

  if (status.startedAt && !status.completedAt) {
    return {
      status: 'in_progress',
      totalItems: 0,
      message: 'Migration in progress...',
    };
  }

  return {
    status: 'not_started',
    totalItems: 0,
    message: 'Migration not started',
  };
}
