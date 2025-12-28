import React from "react"

interface InlineJournalNotesProps {
  symbol?: string | null
  timeframe?: string | null
}

interface NotesPayload {
  text: string
  updatedAt: number
}

const STORAGE_PREFIX = "sparkfined:chart-journal-notes"

const canUseStorage = (): boolean => typeof window !== "undefined" && typeof window.localStorage !== "undefined"

const buildStorageKey = (symbol?: string | null, timeframe?: string | null): string => {
  const normalizedSymbol = symbol?.trim().toUpperCase()
  const normalizedTimeframe = timeframe?.trim()
  const parts = [STORAGE_PREFIX]

  if (normalizedSymbol) parts.push(normalizedSymbol)
  if (normalizedTimeframe) parts.push(normalizedTimeframe)

  return parts.join(":")
}

const formatTimestamp = (value?: number | null): string => {
  if (!value) return "—"
  const formatted = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value))
  return `${formatted} UTC`
}

const readNotes = (key: string): NotesPayload | null => {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<NotesPayload>
    if (typeof parsed.text !== "string") return null
    if (typeof parsed.updatedAt !== "number") return { text: parsed.text, updatedAt: Date.now() }
    return { text: parsed.text, updatedAt: parsed.updatedAt }
  } catch (error) {
    console.warn("InlineJournalNotes: failed to parse stored draft", error)
    return null
  }
}

const persistNotes = (key: string, payload: NotesPayload) => {
  if (!canUseStorage()) return
  window.localStorage.setItem(key, JSON.stringify(payload))
}

export default function InlineJournalNotes({ symbol, timeframe }: InlineJournalNotesProps) {
  const [notes, setNotes] = React.useState("")
  const [lastSavedAt, setLastSavedAt] = React.useState<number | null>(null)
  const notesId = React.useId()
  const storageKey = React.useMemo(() => buildStorageKey(symbol, timeframe), [symbol, timeframe])
  const hasHydrated = React.useRef(false)

  React.useEffect(() => {
    const stored = readNotes(storageKey)
    if (stored) {
      setNotes(stored.text)
      setLastSavedAt(stored.updatedAt)
    } else {
      setNotes("")
      setLastSavedAt(null)
    }
    hasHydrated.current = true
  }, [storageKey])

  React.useEffect(() => {
    if (!hasHydrated.current) return
    const nextUpdatedAt = Date.now()
    persistNotes(storageKey, { text: notes, updatedAt: nextUpdatedAt })
    setLastSavedAt(nextUpdatedAt)
  }, [notes, storageKey])

  const timestampLabel = formatTimestamp(lastSavedAt)

  return (
    <section className="sf-journal-notes" aria-label="Journal Notes">
      <header className="sf-journal-notes__header">
        <div>
          <span className="sf-chart-panel-heading">Journal Notes</span>
          <p className="sf-chart-panel-subtext">Capture context while you scan the chart.</p>
        </div>
        <div className="sf-journal-notes__status" aria-live="polite">
          <span className="sf-journal-notes__status-label">Saved</span>
          <span className="sf-journal-notes__status-time">Last updated {timestampLabel}</span>
        </div>
      </header>

      <div className="sf-journal-notes__body">
        <label className="sf-journal-notes__label" htmlFor={notesId}>
          Journal notes
        </label>
        <textarea
          id={notesId}
          className="sf-journal-notes__textarea sf-focus-ring"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Log thesis updates, intraday signals, and emotional notes..."
          rows={5}
        />
        <p className="sf-journal-notes__hint">Drafts persist locally by symbol and timeframe.</p>
      </div>
    </section>
  )
}

export { buildStorageKey }
