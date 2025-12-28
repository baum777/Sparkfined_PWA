import { useEffect, useRef } from 'react';
import { handleNewTransaction } from '../features/journal/journal-entry-extended-logic';
import { NormalizedTxEvent } from '../lib/journal/txTypes';

const SYNC_INTERVAL_MS = 30 * 1000; // 30s
const STORAGE_CURSOR_KEY = 'journal_sync_cursor_';

interface SyncResponse {
  ok: boolean;
  events: NormalizedTxEvent[];
  nextCursor: string | null;
}

export function useJournalSync(walletAddress: string | null, secret: string | null) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!walletAddress || !secret) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const doSync = async () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;

      try {
        const cursorKey = STORAGE_CURSOR_KEY + walletAddress;
        const currentCursor = localStorage.getItem(cursorKey);

        const params = new URLSearchParams({
          wallet: walletAddress,
          limit: '50'
        });
        if (currentCursor) params.append('cursor', currentCursor);

        // Note: In Vite dev, api/ calls need to go to the server.
        // If the server is not running on the same port, this might fail without proxy.
        // Assuming Vercel layout or proxy setup.
        const res = await fetch(`/api/tx/sync?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${secret}`
          }
        });

        if (!res.ok) {
          console.error('[Sync] Failed:', res.status);
          return;
        }

        const data: SyncResponse = await res.json();
        
        if (data.events && data.events.length > 0) {
          console.log(`[Sync] Processing ${data.events.length} events`);
          
          // Process sequentially
          for (const event of data.events) {
            await handleNewTransaction(event);
          }
        }

        if (data.nextCursor) {
          localStorage.setItem(cursorKey, data.nextCursor);
        }

      } catch (err) {
        console.error('[Sync] Error:', err);
      } finally {
        isSyncingRef.current = false;
      }
    };

    // Initial sync
    doSync();

    // Loop
    timerRef.current = setInterval(doSync, SYNC_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [walletAddress, secret]);
}
