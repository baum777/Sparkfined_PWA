import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createEntry, queryEntries } from '@/lib/JournalService'
import { resetDbInstance } from '@/lib/db'
import {
  JOURNAL_EXPORT_VERSION,
  JournalImportVersionError,
  downloadJournalAsJSON,
  downloadJournalAsMarkdown,
  entryToMarkdown,
  exportJournalToJSON,
  exportJournalToMarkdown,
  handleJournalImport,
  importJournalFromJSON,
} from '@/lib/export/journalExportService'
import type { JournalExportBundle } from '@/lib/export/exportTypes'

const JOURNAL_DB_NAME = 'sparkfined-ta-pwa'
const originalURL = global.URL

async function clearJournalDb(): Promise<void> {
  resetDbInstance()
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(JOURNAL_DB_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => resolve()
    request.onblocked = () => resolve()
  })
}

async function seedEntry(overrides: Partial<Parameters<typeof createEntry>[0]> = {}) {
  return createEntry({
    ticker: 'SOL',
    address: 'sol-address',
    setup: 'breakout',
    emotion: 'fomo',
    status: 'active',
    timestamp: Date.now(),
    thesis: 'Initial thesis',
    ...overrides,
  })
}

describe('journalExportService', () => {
  beforeEach(async () => {
    await clearJournalDb()
    Object.defineProperty(global, 'URL', {
      writable: true,
      value: {
        ...originalURL,
        createObjectURL: vi.fn(() => 'blob:mock'),
        revokeObjectURL: vi.fn(),
      },
    })
  })

  afterEach(async () => {
    await clearJournalDb()
    Object.defineProperty(global, 'URL', { writable: true, value: originalURL })
    vi.restoreAllMocks()
  })

  it('exports journal entries to a JSON bundle with metadata', async () => {
    const entry = await seedEntry({ thesis: 'Export me', customTags: ['alpha'] })

    const bundle = await exportJournalToJSON()

    expect(bundle.version).toBe(JOURNAL_EXPORT_VERSION)
    expect(new Date(bundle.exportedAt).toISOString()).toBe(bundle.exportedAt)
    expect(bundle.entries).toHaveLength(1)

    const exportedEntry = bundle.entries[0]!
    expect(exportedEntry.id).toBe(entry.id)
    expect(exportedEntry.createdAt).toBe(new Date(entry.createdAt).toISOString())
    expect(exportedEntry.customTags).toEqual(['alpha'])
  })

  it('converts entries into readable markdown', async () => {
    const entry: JournalExportBundle['entries'][number] = {
      id: 'md-1',
      createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
      ticker: 'BONK',
      thesis: 'Markdown body',
      customTags: ['tag1', 'tag2'],
    }

    const md = entryToMarkdown(entry)
    expect(md).toContain('# BONK')
    expect(md).toContain('Markdown body')
    expect(md).toContain('tag1, tag2')
  })

  it('builds a markdown document with header and separators', async () => {
    await seedEntry({ ticker: 'BTC', thesis: 'Markdown export' })

    const markdown = await exportJournalToMarkdown()

    expect(markdown).toContain('# Sparkfined Journal Export')
    expect(markdown).toContain('Version: 1.0.0')
    expect(markdown).toContain('Markdown export')
  })

  it('downloads JSON using blob URLs and triggers click', async () => {
    await seedEntry()
    const click = vi.fn()
    const anchor = { click, set href(value: string) {}, set download(value: string) {} }
    vi.spyOn(document, 'createElement').mockReturnValue(anchor as unknown as HTMLAnchorElement)
    const createObjectURL = vi.spyOn(globalThis.URL, 'createObjectURL').mockReturnValue('blob:journal')
    const revokeObjectURL = vi.spyOn(globalThis.URL, 'revokeObjectURL')

    await downloadJournalAsJSON('test.json')

    expect(createObjectURL).toHaveBeenCalled()
    expect(click).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:journal')
  })

  it('imports bundles and merges with existing entries', async () => {
    const existing = await seedEntry({ thesis: 'Old thesis' })

    const bundle: JournalExportBundle = {
      version: JOURNAL_EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      entries: [
        {
          id: existing.id,
          createdAt: new Date(existing.createdAt).toISOString(),
          updatedAt: new Date(existing.updatedAt).toISOString(),
          ticker: existing.ticker,
          address: existing.address,
          setup: existing.setup,
          emotion: existing.emotion,
          status: existing.status,
          thesis: 'New thesis',
        },
      ],
    }

    const result = await importJournalFromJSON(bundle, { mode: 'merge' })

    expect(result.imported).toBe(1)
    expect(result.skipped).toBe(0)

    const [updated] = await queryEntries({ status: 'all' })
    expect(updated).toBeDefined()
    expect(updated?.thesis).toBe('New thesis')
  })

  it('replaces entries when replace mode is selected', async () => {
    await seedEntry({ ticker: 'OLD' })

    const bundle: JournalExportBundle = {
      version: JOURNAL_EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      entries: [
        {
          id: 'new-entry',
          createdAt: new Date().toISOString(),
          ticker: 'NEW',
          address: 'addr',
          setup: 'breakout',
          emotion: 'fomo',
          status: 'active',
          thesis: 'Fresh',
        },
      ],
    }

    const result = await importJournalFromJSON(bundle, { mode: 'replace' })
    expect(result.imported).toBe(1)

    const entries = await queryEntries({ status: 'all' })
    expect(entries).toHaveLength(1)
    expect(entries[0]?.ticker).toBe('NEW')
  })

  it('rejects unsupported versions', async () => {
    const bundle: JournalExportBundle = {
      version: '0.9.0',
      exportedAt: new Date().toISOString(),
      entries: [],
    }

    await expect(importJournalFromJSON(bundle)).rejects.toBeInstanceOf(JournalImportVersionError)
  })

  it('parses file uploads and propagates errors for invalid JSON', async () => {
    const validBundle: JournalExportBundle = {
      version: JOURNAL_EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      entries: [],
    }
    const file = {
      text: () => Promise.resolve(JSON.stringify(validBundle)),
    } as unknown as File

    const result = await handleJournalImport(file)
    expect(result.imported).toBe(0)

    const invalid = { text: () => Promise.resolve('{invalid-json') } as unknown as File
    await expect(handleJournalImport(invalid)).rejects.toThrow('Invalid JSON file')
  })

  it('downloads markdown export', async () => {
    await seedEntry()
    const click = vi.fn()
    const anchor = { click, set href(value: string) {}, set download(value: string) {} }
    vi.spyOn(document, 'createElement').mockReturnValue(anchor as unknown as HTMLAnchorElement)
    const createObjectURL = vi.spyOn(globalThis.URL, 'createObjectURL').mockReturnValue('blob:md')
    const revokeObjectURL = vi.spyOn(globalThis.URL, 'revokeObjectURL')

    await downloadJournalAsMarkdown('journal.md')

    expect(createObjectURL).toHaveBeenCalled()
    expect(click).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:md')
  })
})
