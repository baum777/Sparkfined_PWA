import { useEventBusStore } from '@/store/eventBus'
import type { AppEvent } from '@/store/eventBus'
import type { JournalJourneyMeta } from '@/types/journal'
import type { JournalEvent } from '@/types/journalEvents'
import { mapJournalEventToTelemetryEvent } from '@/lib/journal/journalTelemetry'

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

    const journeyMeta = extractJourneyMeta(latest)
    void sendToTelemetry(latest, journeyMeta)
  })
}

function isJournalEvent(event: AppEvent): event is JournalEvent {
  return (event as JournalEvent).domain === 'journal'
}

function extractJourneyMeta(event: JournalEvent): JournalJourneyMeta | undefined {
  switch (event.type) {
    case 'JournalEntryCreated':
    case 'JournalEntryUpdated':
      return event.payload.snapshot.journeyMeta
    case 'JournalReflexionCompleted':
      return event.payload.journeyMeta
    case 'JournalTradeMarkedActive':
    case 'JournalTradeClosed':
      return event.payload.journeyMeta
    default:
      return undefined
  }
}

async function sendToTelemetry(event: JournalEvent, journeyMeta?: JournalJourneyMeta): Promise<void> {
  try {
    const telemetryEvent = mapJournalEventToTelemetryEvent(event, journeyMeta)

    await fetch('/api/telemetry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'sparkfined',
        events: [telemetryEvent],
      }),
    })
  } catch {
    // Fire-and-forget - telemetry errors should not block the UI
  }
}
