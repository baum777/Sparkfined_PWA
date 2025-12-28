import { create } from 'zustand';

import type { SolanaMemeTrendEvent } from '@/types/events';
import type { JournalEvent } from '@/types/journalEvents';

const MAX_EVENT_BUFFER = 500;

export type AppEvent = SolanaMemeTrendEvent | JournalEvent;

interface EventBusState {
  events: AppEvent[];
  pushEvent: (event: AppEvent) => void;
}

export const useEventBusStore = create<EventBusState>((set) => ({
  events: [],
  pushEvent: (event) =>
    set((state) => {
      if (event.type === 'SolanaMemeTrendEvent') {
        const trendEvents = state.events.filter(
          (existing): existing is SolanaMemeTrendEvent => existing.type === 'SolanaMemeTrendEvent',
        );
        const otherEvents = state.events.filter((existing) => existing.type !== 'SolanaMemeTrendEvent');
        const deduped = trendEvents.filter(
          (existing) =>
            !(
              existing.source.tweetId === event.source.tweetId &&
              existing.token.symbol === event.token.symbol
            ),
        );
        const next = [event, ...deduped, ...otherEvents];
        if (next.length > MAX_EVENT_BUFFER) {
          next.length = MAX_EVENT_BUFFER;
        }
        return { events: next };
      }

      const next = [event, ...state.events];
      if (next.length > MAX_EVENT_BUFFER) {
        next.length = MAX_EVENT_BUFFER;
      }
      return { events: next };
    }),
}));
