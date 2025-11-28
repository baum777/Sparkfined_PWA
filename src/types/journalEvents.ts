import type { JournalEntry, TradeOutcome } from '@/types/journal';

export type JournalEntryCreatedEvent = {
  type: 'JournalEntryCreated';
  domain: 'journal';
  timestamp: number;
  payload: {
    entryId: string;
    snapshot: JournalEntry;
    source: 'manual' | 'auto' | 'chart-draft';
  };
};

export type JournalEntryUpdatedEvent = {
  type: 'JournalEntryUpdated';
  domain: 'journal';
  timestamp: number;
  payload: {
    entryId: string;
    snapshot: JournalEntry;
    updatedFields: string[];
  };
};

export type JournalEntryDeletedEvent = {
  type: 'JournalEntryDeleted';
  domain: 'journal';
  timestamp: number;
  payload: {
    entryId: string;
  };
};

export type JournalReflexionCompletedEvent = {
  type: 'JournalReflexionCompleted';
  domain: 'journal';
  timestamp: number;
  payload: {
    entryId: string;
    qualityScore: number;
  };
};

export type JournalTradeMarkedActiveEvent = {
  type: 'JournalTradeMarkedActive';
  domain: 'journal';
  timestamp: number;
  payload: {
    entryId: string;
    markedAt: number;
  };
};

export type JournalTradeClosedEvent = {
  type: 'JournalTradeClosed';
  domain: 'journal';
  timestamp: number;
  payload: {
    entryId: string;
    outcome: TradeOutcome;
  };
};

export type JournalEvent =
  | JournalEntryCreatedEvent
  | JournalEntryUpdatedEvent
  | JournalEntryDeletedEvent
  | JournalReflexionCompletedEvent
  | JournalTradeMarkedActiveEvent
  | JournalTradeClosedEvent;
