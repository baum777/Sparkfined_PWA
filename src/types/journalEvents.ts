import type { JournalEntry, TradeOutcome } from '@/types/journal';

export type JournalEventType =
  | 'JournalEntryCreated'
  | 'JournalEntryUpdated'
  | 'JournalEntryDeleted'
  | 'JournalReflexionCompleted'
  | 'JournalTradeMarkedActive'
  | 'JournalTradeClosed';

interface JournalEventBase {
  domain: 'journal';
  type: JournalEventType;
  entryId: string;
  occurredAt: number;
}

export type JournalEntryCreatedEvent = JournalEventBase & {
  type: 'JournalEntryCreated';
  entry: JournalEntry;
};

export type JournalEntryUpdatedEvent = JournalEventBase & {
  type: 'JournalEntryUpdated';
  entry: JournalEntry;
};

export type JournalEntryDeletedEvent = JournalEventBase & {
  type: 'JournalEntryDeleted';
  entrySnapshot?: JournalEntry;
};

export type JournalReflexionCompletedEvent = JournalEventBase & {
  type: 'JournalReflexionCompleted';
  entry: JournalEntry;
};

export type JournalTradeMarkedActiveEvent = JournalEventBase & {
  type: 'JournalTradeMarkedActive';
  entry: JournalEntry;
  previousStatus?: JournalEntry['status'];
};

export type JournalTradeClosedEvent = JournalEventBase & {
  type: 'JournalTradeClosed';
  entry: JournalEntry;
  outcome: TradeOutcome;
};

export type JournalEvent =
  | JournalEntryCreatedEvent
  | JournalEntryUpdatedEvent
  | JournalEntryDeletedEvent
  | JournalReflexionCompletedEvent
  | JournalTradeMarkedActiveEvent
  | JournalTradeClosedEvent;

export function isJournalEvent(event: { domain?: string } | null | undefined): event is JournalEvent {
  return event?.domain === 'journal';
}
