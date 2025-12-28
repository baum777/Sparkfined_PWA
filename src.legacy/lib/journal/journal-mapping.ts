import type { JournalEntry as StoreJournalEntry } from '@/store/journalStore'
import type { JournalEntry as DomainJournalEntry } from '@/types/journal'

const FALLBACK_TICKER = 'MANUAL'
const FALLBACK_ADDRESS: DomainJournalEntry['address'] = 'manual-entry'
const FALLBACK_SETUP: DomainJournalEntry['setup'] = 'custom'
const FALLBACK_EMOTION: DomainJournalEntry['emotion'] = 'custom'
const FALLBACK_STATUS: DomainJournalEntry['status'] = 'active'

function parseStoreDateToTimestamp(date?: string): number {
  if (!date) {
    return Date.now()
  }

  const sanitized = date.replace(/·/g, ' ')
  const parsed = Date.parse(sanitized)
  return Number.isNaN(parsed) ? Date.now() : parsed
}

function deriveTicker(entry: StoreJournalEntry): string {
  const [firstTag] = entry.tags ?? []
  if (firstTag) {
    return firstTag.toUpperCase()
  }

  const title = entry.title?.trim()
  if (title) {
    const [firstToken] = title.split(/\s+/)
    if (firstToken) {
      const sanitized = firstToken.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
      if (sanitized) {
        return sanitized.slice(0, 12)
      }
    }
  }

  return FALLBACK_TICKER
}

/**
 * Map a UI/store-level journal entry into the richer domain schema required by AI services.
 * Missing store fields are filled with safe defaults to preserve downstream type guarantees.
 */
export function mapStoreEntryToDomain(entry: StoreJournalEntry): DomainJournalEntry {
  const timestamp = parseStoreDateToTimestamp(entry.date)

  return {
    id: entry.id,
    timestamp,
    ticker: deriveTicker(entry),
    address: FALLBACK_ADDRESS,
    setup: FALLBACK_SETUP,
    emotion: FALLBACK_EMOTION,
    customTags: entry.tags?.length ? entry.tags : undefined,
    thesis: entry.notes,
    status: FALLBACK_STATUS,
    createdAt: timestamp,
    updatedAt: timestamp,
    markedActiveAt: undefined,
    replaySessionId: undefined,
    walletAddress: undefined,
    journeyMeta: entry.journeyMeta,
  }
}

export function mapStoreEntriesToDomain(entries: StoreJournalEntry[]): DomainJournalEntry[] {
  return entries.map(mapStoreEntryToDomain)
}
