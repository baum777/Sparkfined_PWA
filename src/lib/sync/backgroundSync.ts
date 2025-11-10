/**
 * Background Sync Stub (Sprint B)
 * Service Worker integration for offline-first sync
 *
 * Features:
 * - Queue sync requests when offline
 * - Auto-retry when back online
 * - Progress tracking
 *
 * Note: This is a stub/placeholder. Full implementation requires:
 * - Backend API endpoints
 * - Authentication flow
 * - Conflict resolution
 */

import { dbGetUnsyncedItems } from '../storage/ritualDb';

/**
 * Sync status
 */
export interface SyncStatus {
  pending: number;
  syncing: boolean;
  lastSyncAt: string | null;
  lastError: string | null;
}

let syncStatus: SyncStatus = {
  pending: 0,
  syncing: false,
  lastSyncAt: null,
  lastError: null,
};

/**
 * Register Background Sync
 * Uses Service Worker Background Sync API if available
 */
export async function registerBackgroundSync(tag: string = 'ritual-sync'): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[BackgroundSync] Service Workers not supported');
    return false;
  }

  if (!('sync' in ServiceWorkerRegistration.prototype)) {
    console.warn('[BackgroundSync] Background Sync not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    // @ts-ignore - TypeScript doesn't recognize sync property
    await registration.sync.register(tag);

    console.log(`[BackgroundSync] Registered sync tag: ${tag}`);
    return true;
  } catch (error) {
    console.error('[BackgroundSync] Registration failed:', error);
    return false;
  }
}

/**
 * Trigger immediate sync (stub)
 * In production, this would call backend API
 */
export async function triggerSync(): Promise<SyncStatus> {
  console.log('[BackgroundSync] Triggering sync...');

  syncStatus.syncing = true;

  try {
    // Get unsynced items
    const unsynced = await dbGetUnsyncedItems();
    const totalPending =
      unsynced.rituals.length +
      unsynced.checklists.length +
      unsynced.journals.length;

    syncStatus.pending = totalPending;

    if (totalPending === 0) {
      console.log('[BackgroundSync] Nothing to sync');
      syncStatus.lastSyncAt = new Date().toISOString();
      syncStatus.syncing = false;
      return syncStatus;
    }

    // TODO: Implement actual sync logic
    // This is where we would:
    // 1. Encrypt sensitive data
    // 2. POST to backend API
    // 3. Mark items as synced
    // 4. Handle conflicts

    console.log(`[BackgroundSync] Would sync ${totalPending} items (stub)`);

    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    syncStatus.lastSyncAt = new Date().toISOString();
    syncStatus.lastError = null;
    syncStatus.pending = 0;

    console.log('[BackgroundSync] ✅ Sync completed (stub)');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    syncStatus.lastError = errorMessage;
    console.error('[BackgroundSync] ❌ Sync failed:', error);
  } finally {
    syncStatus.syncing = false;
  }

  return syncStatus;
}

/**
 * Get current sync status
 */
export function getSyncStatus(): SyncStatus {
  return { ...syncStatus };
}

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function setupSyncListeners(): void {
  window.addEventListener('online', () => {
    console.log('[BackgroundSync] Device online, triggering sync');
    registerBackgroundSync().then(success => {
      if (!success) {
        // Fallback to immediate sync
        triggerSync();
      }
    });
  });

  window.addEventListener('offline', () => {
    console.log('[BackgroundSync] Device offline');
  });
}

/**
 * Periodic sync check (every 5 minutes)
 */
export function startPeriodicSync(intervalMs: number = 5 * 60 * 1000): number {
  const intervalId = window.setInterval(async () => {
    if (!isOnline()) {
      console.log('[BackgroundSync] Offline, skipping periodic sync');
      return;
    }

    const unsynced = await dbGetUnsyncedItems();
    const totalPending =
      unsynced.rituals.length +
      unsynced.checklists.length +
      unsynced.journals.length;

    if (totalPending > 0) {
      console.log(`[BackgroundSync] Periodic sync: ${totalPending} items pending`);
      await triggerSync();
    }
  }, intervalMs);

  console.log(`[BackgroundSync] Started periodic sync (interval: ${intervalMs}ms)`);
  return intervalId;
}

/**
 * Stop periodic sync
 */
export function stopPeriodicSync(intervalId: number): void {
  clearInterval(intervalId);
  console.log('[BackgroundSync] Stopped periodic sync');
}

// Auto-setup listeners on module load
if (typeof window !== 'undefined') {
  setupSyncListeners();
}
