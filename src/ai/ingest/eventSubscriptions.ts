import { useAdvancedInsightStore } from '@/features/analysis';
import { useEventBusStore } from '@/store/eventBus';
import { useAlertsStore } from '@/store/alertsStore';
import { useJournalStore } from '@/store/journalStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import type { SolanaMemeTrendEvent } from '@/types/events';

let hasInitialized = false;

export function initializeEventSubscriptions(): void {
  if (hasInitialized) return;
  hasInitialized = true;

  useEventBusStore.subscribe((state, prevState) => {
    const [latest] = state.events;
    const [prevLatest] = prevState.events;

    if (!latest || latest === prevLatest) return;
    if (latest.type !== 'SolanaMemeTrendEvent') return;

    fanOutSolanaMemeTrendEvent(latest);
  });
}

function fanOutSolanaMemeTrendEvent(evt: SolanaMemeTrendEvent): void {
  if (!evt?.token?.symbol || !evt.source?.tweetId) {
    if (import.meta.env.DEV) {
      console.warn('[eventSubscriptions] skipped invalid trend event');
    }
    return;
  }

  useWatchlistStore.getState().updateTrendFromEvent?.(evt);
  useAlertsStore.getState().processTrendEvent?.(evt);
  useAdvancedInsightStore.getState().applyTrendEvent?.(evt);
  void useJournalStore.getState().autoTagFromTrendEvent?.(evt);
}
