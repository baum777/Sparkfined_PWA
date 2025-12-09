import type { JournalDBEntry } from './journal-v2-schema'
import { journalV2DB } from './journal-v2-schema'

export type PersistedJournalEntry = JournalDBEntry

export async function saveJournalEntry(entry: Omit<JournalDBEntry, 'id'>): Promise<number> {
  return journalV2DB.journal.add(entry)
}

export async function saveJournalEntries(entries: Array<Omit<JournalDBEntry, 'id'>>): Promise<number[]> {
  return journalV2DB.journal.bulkAdd(entries, { allKeys: true })
}

export async function getJournalEntries(): Promise<PersistedJournalEntry[]> {
  return journalV2DB.journal.orderBy('createdAt').reverse().toArray()
}

export async function clearJournalEntries(): Promise<void> {
  await journalV2DB.journal.clear()
}
