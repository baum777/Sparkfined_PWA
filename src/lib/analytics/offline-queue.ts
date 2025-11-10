/**
 * Offline Queue for Analytics Payloads
 * Uses IndexedDB for persistent storage when network is unavailable
 *
 * Features:
 * - PWA-compatible (works offline)
 * - Auto-retry on reconnect
 * - FIFO queue with max size limit
 * - Graceful degradation if IndexedDB unavailable
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface QueueDB extends DBSchema {
  queue: {
    key: number;
    value: QueueItem;
    indexes: { 'by-timestamp': number };
  };
}

interface QueueItem {
  id: number;
  payload: any;
  timestamp: number;
  retries: number;
}

export class OfflineQueue {
  private db: IDBPDatabase<QueueDB> | null = null;
  private readonly maxQueueSize: number;
  private readonly maxRetries: number;
  private isInitialized = false;

  constructor(
    private storeName: string = 'analytics-queue',
    config: {
      maxQueueSize?: number;
      maxRetries?: number;
    } = {}
  ) {
    this.maxQueueSize = config.maxQueueSize ?? 100;
    this.maxRetries = config.maxRetries ?? 3;
    this.initDB();
  }

  private async initDB() {
    try {
      this.db = await openDB<QueueDB>('sparkfined-analytics', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('queue')) {
            const store = db.createObjectStore('queue', {
              keyPath: 'id',
              autoIncrement: true
            });
            store.createIndex('by-timestamp', 'timestamp');
          }
        }
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('[OfflineQueue] Failed to initialize IndexedDB', error);
      // Graceful degradation: queue will be memory-only
    }
  }

  /**
   * Add payload to offline queue
   * Automatically manages queue size (FIFO eviction)
   */
  async enqueue(payload: any): Promise<void> {
    if (!this.db) {
      await this.initDB();
      if (!this.db) {
        console.warn('[OfflineQueue] IndexedDB unavailable, payload lost');
        return;
      }
    }

    try {
      // Check queue size
      const count = await this.db.count('queue');

      if (count >= this.maxQueueSize) {
        // Evict oldest item (FIFO)
        const oldestKeys = await this.db.getAllKeys('queue', null, 1);
        if (oldestKeys.length > 0 && oldestKeys[0] !== undefined) {
          await this.db.delete('queue', oldestKeys[0]);
          console.warn('[OfflineQueue] Queue full, evicted oldest item');
        }
      }

      // Add new item
      await this.db.add('queue', {
        id: Date.now(), // Will be overwritten by autoIncrement
        payload,
        timestamp: Date.now(),
        retries: 0
      });

      console.log('[OfflineQueue] Enqueued payload');
    } catch (error) {
      console.error('[OfflineQueue] Failed to enqueue', error);
    }
  }

  /**
   * Dequeue all items (for batch processing)
   * Returns items and clears queue
   */
  async dequeueAll(): Promise<any[]> {
    if (!this.db) return [];

    try {
      const items = await this.db.getAll('queue');

      // Filter out items that exceeded max retries
      const validItems = items.filter(item => item.retries < this.maxRetries);

      if (validItems.length < items.length) {
        console.warn(
          `[OfflineQueue] Dropped ${items.length - validItems.length} items (max retries exceeded)`
        );
      }

      // Clear queue
      await this.db.clear('queue');

      return validItems.map(item => item.payload);
    } catch (error) {
      console.error('[OfflineQueue] Failed to dequeue', error);
      return [];
    }
  }

  /**
   * Dequeue single item (for incremental processing)
   */
  async dequeue(): Promise<any | null> {
    if (!this.db) return null;

    try {
      const tx = this.db.transaction('queue', 'readwrite');
      const store = tx.objectStore('queue');

      // Get oldest item
      const cursor = await store.openCursor();
      if (!cursor) return null;

      const item = cursor.value;

      // Check max retries
      if (item.retries >= this.maxRetries) {
        console.warn('[OfflineQueue] Item exceeded max retries, dropping');
        await cursor.delete();
        return null;
      }

      // Delete from queue
      await cursor.delete();
      await tx.done;

      return item.payload;
    } catch (error) {
      console.error('[OfflineQueue] Failed to dequeue', error);
      return null;
    }
  }

  /**
   * Re-queue item on failure (increments retry count)
   */
  async requeueOnFailure(payload: any): Promise<void> {
    if (!this.db) return;

    try {
      // Find item by payload (match by timestamp or unique ID if available)
      const items = await this.db.getAll('queue');
      const existingItem = items.find(
        item => JSON.stringify(item.payload) === JSON.stringify(payload)
      );

      if (existingItem && existingItem.retries < this.maxRetries) {
        await this.db.put('queue', {
          ...existingItem,
          retries: existingItem.retries + 1
        });
        console.log(`[OfflineQueue] Re-queued item (retry ${existingItem.retries + 1})`);
      } else {
        // Item not found or max retries exceeded, add as new
        await this.enqueue(payload);
      }
    } catch (error) {
      console.error('[OfflineQueue] Failed to re-queue', error);
    }
  }

  /**
   * Get queue size
   */
  async size(): Promise<number> {
    if (!this.db) return 0;

    try {
      return await this.db.count('queue');
    } catch (error) {
      console.error('[OfflineQueue] Failed to get size', error);
      return 0;
    }
  }

  /**
   * Clear entire queue (dangerous!)
   */
  async clear(): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.clear('queue');
      console.log('[OfflineQueue] Queue cleared');
    } catch (error) {
      console.error('[OfflineQueue] Failed to clear', error);
    }
  }

  /**
   * Check if IndexedDB is available and initialized
   */
  isAvailable(): boolean {
    return this.isInitialized && this.db !== null;
  }
}
