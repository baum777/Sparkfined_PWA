import type { SolanaMemeTrendEvent } from '@/types/events';

import { useEventBusStore } from '@/store/eventBus';
import { useWatchlistStore } from '@/store/watchlistStore';
import { useAlertsStore } from '@/store/alertsStore';
import { useJournalStore } from '@/store/journalStore';
import { useAdvancedInsightStore } from '@/features/analysis/advancedInsightStore';

let subscriptionsRegistered = false;
let lastEventId: string | undefined;

export function registerEventSubscriptionsOnce(): void {
  if (subscriptionsRegistered) {
    return;
  }
  subscriptionsRegistered = true;

  useEventBusStore.subscribe((state) => {
    const latestEvent = state.events[0];
    if (!latestEvent) {
      return;
    }
    if (latestEvent.id === lastEventId) {
      return;
    }
    lastEventId = latestEvent.id;
    routeTrendEvent(latestEvent);
  });
}

function routeTrendEvent(event: SolanaMemeTrendEvent): void {
  useWatchlistStore.getState().applyTrendEvent(event);
  pushTrendAlert(event);
  hydrateAnalysis(event);
  autoTagJournal(event);
}

function pushTrendAlert(event: SolanaMemeTrendEvent): void {
  const relevance = event.sparkfined.alertRelevance ?? 0;
  const sentimentLabel = event.sentiment?.label;

  const shouldAlert = relevance >= 0.7 || sentimentLabel === 'warning';
  if (!shouldAlert) {
    return;
  }

  useAlertsStore.getState().pushAlert({
    id: generateId(`trend-${event.token.symbol}`),
    symbol: event.token.symbol,
    condition:
      relevance >= 0.7
        ? `Grok relevance ${relevance.toFixed(2)}`
        : `Grok sentiment ${sentimentLabel}`,
    type: 'trend',
    status: 'armed',
    timeframe: 'social',
    createdAt: event.receivedAt,
    meta: {
      source: event.source.platform,
      cashtag: event.token.cashtag,
      sentiment: sentimentLabel,
    },
  });
}

function hydrateAnalysis(event: SolanaMemeTrendEvent): void {
  useAdvancedInsightStore.getState().applyTrendEvent?.(event);
}

function autoTagJournal(event: SolanaMemeTrendEvent): void {
  const tags = event.sparkfined.journalContextTags;
  if (!tags.length && !event.sparkfined.narrative) {
    return;
  }

  void useJournalStore.getState().autoTagFromTrendEvent(event);
}

function generateId(prefix: string): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) {
    return `${prefix}-${uuid}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
