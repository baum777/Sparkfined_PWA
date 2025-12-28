import { NormalizedTxEvent } from "../lib/journal/txTypes";

// In-memory storage for development/fallback
// Map<wallet_address, { events: NormalizedTxEvent[], lastUpdated: number }>
const MEMORY_STORE = new Map<string, { events: NormalizedTxEvent[]; lastUpdated: number }>();

const MAX_BUFFER_SIZE = 1000; // Keep last 1000 events per wallet in memory
const TTL_MS = 48 * 60 * 60 * 1000; // 48h TTL

/**
 * Transient buffer for transaction events.
 * Acts as a buffer between webhook ingestion and client sync.
 */
export const txBuffer = {
  /**
   * Push new events to the buffer for a specific wallet.
   * Handles de-duplication and pruning.
   */
  async pushEvents(wallet: string, newEvents: NormalizedTxEvent[]): Promise<void> {
    const now = Date.now();
    let walletData = MEMORY_STORE.get(wallet);

    if (!walletData) {
      walletData = { events: [], lastUpdated: now };
    }

    // Prune old events based on TTL before adding
    // Note: efficient pruning would be better in a real DB
    walletData.events = walletData.events.filter(
      (e) => (now - e.blockTime * 1000) < TTL_MS
    );

    // De-dupe and add new events
    // We use a Set of signatures for quick lookup of existing events in the buffer
    const existingSignatures = new Set(walletData.events.map((e) => `${e.signature}:${e.type}`));

    for (const event of newEvents) {
      const key = `${event.signature}:${event.type}`;
      if (!existingSignatures.has(key)) {
        walletData.events.push(event);
        existingSignatures.add(key);
      }
    }

    // Sort again just in case, though push implies newer.
    // If webhooks arrive out of order, we want to maintain time order.
    walletData.events.sort((a, b) => {
      if (a.blockTime !== b.blockTime) return a.blockTime - b.blockTime;
      return a.signature.localeCompare(b.signature);
    });

    // Cap size
    if (walletData.events.length > MAX_BUFFER_SIZE) {
      walletData.events = walletData.events.slice(-MAX_BUFFER_SIZE);
    }

    walletData.lastUpdated = now;
    MEMORY_STORE.set(wallet, walletData);

    console.log(`[TxBuffer] Pushed ${newEvents.length} events for ${wallet}. Total buffered: ${walletData.events.length}`);
  },

  /**
   * Read events for a wallet starting from a cursor.
   * Cursor is implemented as the last read signature or a simple offset?
   * Prompt suggests "cursor = numeric index as string".
   * 
   * WARNING: Numeric index in a rolling buffer (circular or pruned) is dangerous 
   * because index 0 changes.
   * 
   * Better Strategy for this implementation: 
   * Cursor = "blockTime:signature" of the last received event.
   * We return events strictly AFTER this cursor.
   */
  async readEvents(
    wallet: string, 
    cursor?: string | null, 
    limit: number = 100
  ): Promise<{ events: NormalizedTxEvent[]; nextCursor: string | null }> {
    const walletData = MEMORY_STORE.get(wallet);
    if (!walletData || walletData.events.length === 0) {
      return { events: [], nextCursor: null };
    }

    let startIndex = 0;

    if (cursor) {
      // Parse cursor "blockTime:signature"
      const [cursorTimeStr, cursorSig] = cursor.split(':');
      const cursorTime = parseInt(cursorTimeStr, 10);

      // Find the first event AFTER the cursor
      // Since events are sorted by blockTime, we can iterate
      startIndex = walletData.events.findIndex(e => {
        if (e.blockTime > cursorTime) return true;
        if (e.blockTime === cursorTime && e.signature > cursorSig) return true;
        return false;
      });

      if (startIndex === -1) {
        // All events are before or equal to cursor
        return { events: [], nextCursor: cursor }; // Keep same cursor or return null? Return null means caught up.
      }
    }

    const slice = walletData.events.slice(startIndex, startIndex + limit);
    
    // Next cursor is the last event in the slice
    let nextCursor = null;
    if (slice.length > 0) {
      const lastEvent = slice[slice.length - 1];
      nextCursor = `${lastEvent.blockTime}:${lastEvent.signature}`;
    } else {
      // If we didn't get any new events, keep the old cursor if valid, 
      // but here we know we have no new events.
      nextCursor = cursor || null; 
    }

    return { events: slice, nextCursor };
  },

  /**
   * Prune data (Explicit call if needed, but we do it on push too)
   */
  async prune(wallet: string, olderThanMs: number): Promise<void> {
    const walletData = MEMORY_STORE.get(wallet);
    if (!walletData) return;

    const cutoff = Date.now() - olderThanMs;
    walletData.events = walletData.events.filter(e => e.blockTime * 1000 > cutoff);
    MEMORY_STORE.set(wallet, walletData);
  }
};
