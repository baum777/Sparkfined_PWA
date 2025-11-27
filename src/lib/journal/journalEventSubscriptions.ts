import { useEventBusStore } from '@/store/eventBus'
import type { AppEvent } from '@/store/eventBus'
import type { JournalEvent } from '@/types/journalEvents'

let hasInitialized = false

export function initializeJournalEventSubscriptions(): void {
  if (hasInitialized) return
  hasInitialized = true

  useEventBusStore.subscribe((state, prevState) => {
    const [latest] = state.events
    const [prevLatest] = prevState.events

    if (!latest || latest === prevLatest) {
      return
    }

    if (!isJournalEvent(latest)) {
      return
    }

    void sendToTelemetry(latest)
  })
}

function isJournalEvent(event: AppEvent): event is JournalEvent {
  return (event as JournalEvent).domain === 'journal'
}

async function sendToTelemetry(event: JournalEvent): Promise<void> {
  try {
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: 'journal',
        type: event.type,
        timestamp: event.timestamp,
        payload: event.payload,
      }),
    })
  } catch {
    // Fire-and-forget - telemetry errors should not block the UI
  }
}
