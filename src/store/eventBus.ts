import { create } from 'zustand';

import type { SolanaMemeTrendEvent } from '@/types/events';
import type { JournalEvent } from '@/types/journalEvents';
import { isJournalEvent } from '@/types/journalEvents';

const MAX_EVENT_BUFFER = 500;

type DomainEvent = SolanaMemeTrendEvent | JournalEvent;

interface EventBusState {
  events: DomainEvent[];
  pushEvent: (event: SolanaMemeTrendEvent) => void;
  pushJournalEvent: (event: JournalEvent) => void;
}

export const useEventBusStore = create<EventBusState>((set) => ({
  events: [],
  pushEvent: (event) =>
    set((state) => ({
      events: pushWithDedup(state.events, event),
    })),
  pushJournalEvent: (event) =>
    set((state) => ({
      events: pushWithDedup(state.events, event),
    })),
}));

function pushWithDedup(events: DomainEvent[], incoming: DomainEvent): DomainEvent[] {
  const deduped = events.filter((existing) => !isDuplicateEvent(existing, incoming));
  const next = [incoming, ...deduped];
  if (next.length > MAX_EVENT_BUFFER) {
    next.length = MAX_EVENT_BUFFER;
  }
  return next;
}

function isDuplicateEvent(existing: DomainEvent, candidate: DomainEvent): boolean {
  if (existing.type === 'SolanaMemeTrendEvent' && candidate.type === 'SolanaMemeTrendEvent') {
    return existing.source.tweetId === candidate.source.tweetId && existing.token.symbol === candidate.token.symbol;
  }

  if (isJournalEvent(existing) && isJournalEvent(candidate)) {
    return existing.entryId === candidate.entryId && existing.type === candidate.type;
  }

  return false;
}
