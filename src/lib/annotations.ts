import type { Alert } from '@/store/alertsStore'
import type { JournalEntry as JournalStoreEntry } from '@/store/journalStore'
import type { ChartAnnotation } from '@/domain/chart'
import type { PulseDeltaEvent } from '@/lib/grokPulse/types'
import type { JournalEntry as JournalType } from '@/types/journal'

function parseTimestamp(value?: string | number): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return Date.now()
}

function isPersistedJournal(entry: JournalType | JournalStoreEntry): entry is JournalType {
  return 'timestamp' in entry
}

export function mapJournalEntryToAnnotation(entry: JournalType | JournalStoreEntry): ChartAnnotation {
  const isPersisted = isPersistedJournal(entry)
  const baseTime = isPersisted ? entry.timestamp : parseTimestamp(entry.date)
  const description = isPersisted ? entry.thesis ?? '' : entry.notes ?? ''

  return {
    id: `journal-${entry.id}`,
    candleTime: baseTime,
    label: 'Journal',
    description,
    severity: 'low',
    kind: 'journal',
  }
}

export function mapAlertToAnnotation(alert: Alert): ChartAnnotation {
  return {
    id: `alert-${alert.id}`,
    candleTime: parseTimestamp(alert.createdAt),
    label: alert.condition ?? 'Alert',
    description: alert.summary,
    severity: alert.status === 'triggered' ? 'high' : 'medium',
    kind: 'alert',
  }
}

export function mapPulseEventToAnnotation(event: PulseDeltaEvent): ChartAnnotation {
  const label = event.delta > 0 ? 'Pulse ↑' : 'Pulse ↓'
  const severity: ChartAnnotation['severity'] = Math.abs(event.delta) > 10 ? 'high' : 'medium'
  return {
    id: `signal-${event.address}-${event.ts}`,
    candleTime: event.ts,
    label,
    description: `Score changed ${event.delta.toFixed(2)} to ${event.newScore}`,
    severity,
    kind: 'signal',
  }
}

export function mergeAnnotations(
  journalAnnotations: ChartAnnotation[] = [],
  alertAnnotations: ChartAnnotation[] = [],
  signalAnnotations: ChartAnnotation[] = []
): ChartAnnotation[] {
  return [...journalAnnotations, ...alertAnnotations, ...signalAnnotations].sort((a, b) => a.candleTime - b.candleTime)
}
