import Dexie, { type Table } from 'dexie'
import type { JournalOutput } from '../types/output'
import type { JournalRawInput } from '../types/input'

export interface JournalDBEntry {
  id?: number
  raw: JournalRawInput
  output: JournalOutput
  createdAt: number
  version: number
}

export class JournalV2DB extends Dexie {
  journal!: Table<JournalDBEntry, number>

  constructor() {
    super('sparkfined-journal-v2')

    this.version(1).stores({
      journal: '++id, createdAt, version',
    })
  }
}

export const journalV2DB = new JournalV2DB()
