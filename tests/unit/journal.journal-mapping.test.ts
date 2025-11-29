import { describe, expect, it, vi, afterEach } from 'vitest'
import { mapStoreEntryToDomain, mapStoreEntriesToDomain } from '@/lib/journal/journal-mapping'
import type { JournalEntry as StoreJournalEntry } from '@/store/journalStore'
import type { JourneyPhase } from '@/types/journal'

const baseEntry: StoreJournalEntry = {
  id: 'entry-1',
  title: 'SOL breakout retest',
  date: '2025-03-14T09:45:00Z',
  direction: 'long',
  pnl: '+3.4%',
  notes: 'Scaled into reclaim after sweeping liquidity.',
  tags: ['sol'],
  journeyMeta: {
    phase: 'SEEKER' as JourneyPhase,
    xpTotal: 120,
    streak: 3,
    lastEventAt: Date.now() - 1_000,
  },
}

afterEach(() => {
  vi.useRealTimers()
})

describe('journal-mapping', () => {
  it('maps store entry fields to domain shape with defaults', () => {
    const domain = mapStoreEntryToDomain(baseEntry)

    expect(domain).toMatchObject({
      id: 'entry-1',
      ticker: 'SOL',
      address: 'manual-entry',
      setup: 'custom',
      emotion: 'custom',
      status: 'active',
      customTags: ['sol'],
      thesis: baseEntry.notes,
      journeyMeta: baseEntry.journeyMeta,
    })
    expect(domain.timestamp).toBe(domain.createdAt)
    expect(domain.createdAt).toBe(domain.updatedAt)
    expect(Number.isFinite(domain.timestamp)).toBe(true)
  })

  it('falls back to MANUAL ticker and Date.now when data is missing', () => {
    const now = new Date('2025-01-01T00:00:00Z')
    vi.useFakeTimers()
    vi.setSystemTime(now)

    const domain = mapStoreEntryToDomain({
      ...baseEntry,
      id: 'entry-2',
      title: '',
      tags: undefined,
      date: '',
    })

    expect(domain.ticker).toBe('MANUAL')
    expect(domain.timestamp).toBe(now.getTime())
  })

  it('maps multiple entries via helper', () => {
    const entries: StoreJournalEntry[] = [
      baseEntry,
      { ...baseEntry, id: 'entry-3', title: 'BONK scalp', tags: ['BONK'] },
    ]

    const result = mapStoreEntriesToDomain(entries)
    expect(result).toHaveLength(2)

    const [first, second] = result
    if (!first || !second) {
      throw new Error('Expected mapStoreEntriesToDomain to return two entries')
    }

    expect(first.id).toBe('entry-1')
    expect(second.ticker).toBe('BONK')
  })
})
