import { initDB, resetDbInstance } from '../db'
import { queryEntries } from '../JournalService'
import type { ImportOptions, JournalExportBundle, JournalExportEntry } from './exportTypes'
import type { JournalEntry } from '@/types/journal'

export const JOURNAL_EXPORT_VERSION = '1.0.0'

export class JournalImportVersionError extends Error {
  constructor(version: string) {
    super(`Unsupported journal export version: ${version}`)
    this.name = 'JournalImportVersionError'
  }
}

function toISO(value?: number): string | undefined {
  if (typeof value !== 'number') return undefined
  try {
    return new Date(value).toISOString()
  } catch {
    return undefined
  }
}

function toMillis(value?: string | number): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }
  if (!value) return undefined
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function ensureJournalEntry(entry: JournalExportEntry): JournalEntry {
  const now = Date.now()
  const timestamp = toMillis(entry.timestamp) ?? toMillis(entry.createdAt) ?? now
  const createdAt = toMillis(entry.createdAt) ?? timestamp
  const updatedAt = toMillis(entry.updatedAt) ?? timestamp

  return {
    id: entry.id || crypto.randomUUID(),
    ticker: entry.ticker || entry.title || 'MANUAL',
    address: entry.address || 'manual-entry',
    setup: entry.setup || 'custom',
    emotion: entry.emotion || 'custom',
    status: entry.status || 'active',
    timestamp,
    createdAt,
    updatedAt,
    thesis: entry.thesis || entry.content || entry.title,
    customTags: entry.customTags || entry.tags,
    grokContext: entry.grokContext,
    chartSnapshot: entry.chartSnapshot,
    outcome: entry.outcome,
    markedActiveAt: toMillis(entry.markedActiveAt),
    replaySessionId: entry.replaySessionId,
    walletAddress: entry.walletAddress,
    journeyMeta: entry.journeyMeta,
  }
}

function mergeJournalEntries(existing: JournalEntry, incoming: JournalEntry): JournalEntry {
  return {
    ...existing,
    ...incoming,
    createdAt: existing.createdAt ?? incoming.createdAt,
    timestamp: existing.timestamp ?? incoming.timestamp,
    updatedAt: incoming.updatedAt ?? existing.updatedAt ?? Date.now(),
  }
}

function mapToExportEntry(entry: JournalEntry): JournalExportEntry {
  return {
    id: entry.id,
    createdAt: toISO(entry.createdAt) ?? new Date(entry.createdAt).toISOString(),
    updatedAt: toISO(entry.updatedAt),
    timestamp: toISO(entry.timestamp),
    ticker: entry.ticker,
    address: entry.address,
    setup: entry.setup,
    emotion: entry.emotion,
    status: entry.status,
    customTags: entry.customTags,
    thesis: entry.thesis,
    grokContext: entry.grokContext,
    chartSnapshot: entry.chartSnapshot,
    outcome: entry.outcome,
    markedActiveAt: toISO(entry.markedActiveAt),
    replaySessionId: entry.replaySessionId,
    walletAddress: entry.walletAddress,
    journeyMeta: entry.journeyMeta,
  }
}

function assertBundleVersion(version?: string): void {
  if (!version) {
    throw new JournalImportVersionError('unknown')
  }
  const [major] = version.split('.')
  if (major !== '1') {
    throw new JournalImportVersionError(version)
  }
}

export async function exportJournalToJSON(): Promise<JournalExportBundle> {
  const entries = await queryEntries({ status: 'all' })
  return {
    version: JOURNAL_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    entries: entries.map(mapToExportEntry),
  }
}

export function entryToMarkdown(entry: JournalExportEntry): string {
  const title = entry.title || entry.ticker || 'Untitled Entry'
  const tags = entry.customTags?.length ? entry.customTags.join(', ') : '—'
  const createdAt = entry.createdAt || 'Unknown date'

  return `# ${title}\n\n- ID: ${entry.id}\n- Created: ${createdAt}\n- Tags: ${tags}\n\n---\n\n${entry.thesis || entry.content || ''}\n\n---\n\nScreenshot: ${entry.chartSnapshot?.screenshot ? 'Yes' : 'No'}`
}

export async function exportJournalToMarkdown(): Promise<string> {
  const bundle = await exportJournalToJSON()
  const parts = bundle.entries.map(entryToMarkdown)
  const header = `# Sparkfined Journal Export\n\nExported at: ${bundle.exportedAt}\nVersion: ${bundle.version}\n\n---\n\n`
  return header + parts.join('\n\n---\n\n')
}

export async function downloadJournalAsJSON(fileName = 'sparkfined-journal-export.json'): Promise<void> {
  const bundle = await exportJournalToJSON()
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadJournalAsMarkdown(fileName = 'sparkfined-journal-export.md'): Promise<void> {
  const markdown = await exportJournalToMarkdown()
  const blob = new Blob([markdown], { type: 'text/markdown' })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

async function readExistingEntries(): Promise<JournalEntry[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['journal_entries'], 'readonly')
    const store = transaction.objectStore('journal_entries')
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result as JournalEntry[])
    request.onerror = () => reject(request.error)
  })
}

export async function importJournalFromJSON(
  bundle: JournalExportBundle,
  options: ImportOptions = { mode: 'merge' },
): Promise<{ imported: number; skipped: number }> {
  assertBundleVersion(bundle.version)

  if (!Array.isArray(bundle.entries)) {
    throw new Error('Invalid journal export bundle: entries must be an array')
  }

  const normalizedEntries = bundle.entries.map(ensureJournalEntry)
  const seenIds = new Set<string>()
  const toPersist: JournalEntry[] = []
  let skipped = 0

  for (const entry of normalizedEntries) {
    if (seenIds.has(entry.id)) {
      skipped += 1
      continue
    }
    seenIds.add(entry.id)
    toPersist.push(entry)
  }

  const db = await initDB()
  const existingEntries = options.mode === 'merge' ? await readExistingEntries() : []
  const existingMap = new Map(existingEntries.map((entry) => [entry.id, entry]))

  const merged = toPersist.map((entry) => {
    const existing = existingMap.get(entry.id)
    return existing && options.mode === 'merge' ? mergeJournalEntries(existing, entry) : entry
  })

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(['journal_entries'], 'readwrite')
    const store = transaction.objectStore('journal_entries')

    if (options.mode === 'replace') {
      store.clear()
    }

    merged.forEach((entry) => {
      store.put(entry)
    })

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })

  if (options.mode === 'replace') {
    resetDbInstance()
  }

  return { imported: merged.length, skipped }
}

export async function handleJournalImport(
  file: File,
  options?: ImportOptions,
): Promise<{ imported: number; skipped: number }> {
  const text = await file.text()
  let bundle: JournalExportBundle
  try {
    bundle = JSON.parse(text)
  } catch {
    throw new Error('Invalid JSON file')
  }

  if (!bundle || typeof bundle !== 'object') {
    throw new Error('Invalid journal export payload')
  }

  return importJournalFromJSON(bundle, options)
}
