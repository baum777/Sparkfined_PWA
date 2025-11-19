import { create } from 'zustand';

import type { SolanaMemeTrendEvent } from '@/types/events';

const MAX_EVENT_BUFFER = 500;

interface EventBusState {
  events: SolanaMemeTrendEvent[];
  pushEvent: (event: SolanaMemeTrendEvent) => void;
}

export const useEventBusStore = create<EventBusState>((set) => ({
  events: [],
  pushEvent: (event) =>
    set((state) => {
      const deduped = state.events.filter(
        (existing) =>
          !(
            existing.source.tweetId === event.source.tweetId &&
            existing.token.symbol === event.token.symbol
          ),
      );
      const next = [event, ...deduped];
      if (next.length > MAX_EVENT_BUFFER) {
        next.length = MAX_EVENT_BUFFER;
      }
      return { events: next };
    }),
}));
