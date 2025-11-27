import { useEventBusStore } from '@/store/eventBus';
import type { SolanaMemeTrendEvent } from '@/types/events';
import type { JournalEvent } from '@/types/journalEvents';
import { isJournalEvent } from '@/types/journalEvents';

let hasInitializedJournalEvents = false;

export function initializeJournalEventSubscriptions(): void {
  if (hasInitializedJournalEvents) {
    return;
  }

  hasInitializedJournalEvents = true;

  useEventBusStore.subscribe((state, prevState) => {
    const latest = findLatestJournalEvent(state.events);
    const prevLatest = findLatestJournalEvent(prevState.events);

    if (!latest || latest === prevLatest) {
      return;
    }

    fanOutJournalEvent(latest);
  });
}

function findLatestJournalEvent(
  events: Array<SolanaMemeTrendEvent | JournalEvent>,
): JournalEvent | undefined {
  return events.find((event): event is JournalEvent => isJournalEvent(event));
}

function fanOutJournalEvent(event: JournalEvent): void {
  if (import.meta.env.DEV) {
    console.debug('[journal:event]', event.type, event.entryId);
  }

  sendJournalTelemetry(event);
}

function sendJournalTelemetry(event: JournalEvent): void {
  void fetch('/api/telemetry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'journal',
      ...event,
    }),
  }).catch(() => {
    // Telemetry is best-effort; failures are intentionally ignored.
  });
}
