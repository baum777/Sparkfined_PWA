import { describe, expect, it } from 'vitest'
import { mapAlertToAnnotation, mapJournalEntryToAnnotation, mapPulseEventToAnnotation, mergeAnnotations } from '@/lib/annotations'

const alert = {
  id: 'a',
  symbol: 'SOL',
  condition: 'Price > 10',
  type: 'price',
  status: 'triggered',
  timeframe: '1H',
} as any

const journalEntry = {
  id: 'j1',
  date: '2024-01-01T00:00:00Z',
  title: 'Test',
  direction: 'long',
} as any

describe('annotations mapping', () => {
  it('maps alerts to annotations with severity', () => {
    const annotation = mapAlertToAnnotation(alert)
    expect(annotation.kind).toBe('alert')
    expect(annotation.severity).toBe('high')
  })

  it('maps journal entries to annotations', () => {
    const annotation = mapJournalEntryToAnnotation(journalEntry)
    expect(annotation.kind).toBe('journal')
    expect(annotation.candleTime).toBeGreaterThan(0)
  })

  it('merges annotations in chronological order', () => {
    const merged = mergeAnnotations(
      [
        { id: '1', candleTime: 2, label: 'a', kind: 'journal' as const },
        { id: '2', candleTime: 1, label: 'b', kind: 'alert' as const },
      ],
      [],
      []
    )
    expect(merged).toHaveLength(2)

    const [first] = merged
    if (!first) {
      throw new Error('Expected merged annotations to include at least one entry')
    }
    expect(first.id).toBe('2')
  })

  it('maps pulse delta events to signal annotations', () => {
    const annotation = mapPulseEventToAnnotation({
      address: 'addr',
      symbol: 'SOL',
      previousScore: 10,
      newScore: 25,
      delta: 15,
      ts: 1700000,
    })
    expect(annotation.kind).toBe('signal')
    expect(annotation.severity).toBe('high')
  })
})
