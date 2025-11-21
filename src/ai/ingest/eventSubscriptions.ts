import { useAdvancedInsightStore } from '@/features/analysis';
import { useEventBusStore } from '@/store/eventBus';
import { useAlertsStore } from '@/store/alertsStore';
import { useJournalStore } from '@/store/journalStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import { useLiveDataStore } from '@/store/liveDataStore';
import type { SolanaMemeTrendEvent } from '@/types/events';

let hasInitialized = false;
let livePriceUnsubscribe: (() => void) | null = null;

export function initializeEventSubscriptions(): void {
  if (hasInitialized) return;
  hasInitialized = true;

  // Subscribe to trend events
  useEventBusStore.subscribe((state, prevState) => {
    const [latest] = state.events;
    const [prevLatest] = prevState.events;

    if (!latest || latest === prevLatest) return;
    if (latest.type !== 'SolanaMemeTrendEvent') return;

    fanOutSolanaMemeTrendEvent(latest);
  });

  // Subscribe to live price updates
  livePriceUnsubscribe = useLiveDataStore.subscribe((state, prevState) => {
    // Check if prices changed
    if (state.prices === prevState.prices) return;

    // Fan out price updates to watchlist
    fanOutLivePriceUpdates(state.prices, prevState.prices);
  });

  // Keep reference for potential teardown hooks
  void livePriceUnsubscribe;
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

function fanOutLivePriceUpdates(
  currentPrices: Record<string, any>,
  previousPrices: Record<string, any>
): void {
  // Find changed symbols
  for (const symbol in currentPrices) {
    const current = currentPrices[symbol];
    const previous = previousPrices[symbol];

    // Skip if price hasn't changed
    if (previous && current.price === previous.price) {
      continue;
    }

    // Update watchlist with new price
    useWatchlistStore.getState().updateLivePrice?.(
      symbol,
      current.price,
      current.priceChange24h
    );
  }
}
