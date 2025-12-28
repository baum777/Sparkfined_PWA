import type { JournalEntryDTO } from "@/api/journalEntries"
import type { ChartAnnotation } from "@/domain/chart"

export type ChartMarkerKind = "journal" | "alert" | "signal"

export type ChartMarker = {
  id: string
  time: number
  price?: number
  label: string
  kind: ChartMarkerKind
  journalEntryId: string
}

const parseTimestamp = (value: string): number | null => {
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? null : timestamp
}

const resolveMarkerLabel = (entry: JournalEntryDTO): string => {
  if (entry.title) return entry.title
  if (entry.shortNote) return entry.shortNote
  if (entry.symbol) return entry.symbol
  return "Journal entry"
}

export function mapJournalEntriesToMarkers(entries: JournalEntryDTO[]): ChartMarker[] {
  const markers: ChartMarker[] = []

  entries.forEach((entry) => {
    const time = parseTimestamp(entry.createdAt)
    if (!time) return

    markers.push({
      id: `journal-${entry.id}`,
      time,
      label: resolveMarkerLabel(entry),
      kind: "journal",
      journalEntryId: entry.id,
    })
  })

  return markers
}

export function mapMarkersToAnnotations(markers: ChartMarker[]): ChartAnnotation[] {
  return markers.map((marker) => ({
    id: marker.id,
    candleTime: marker.time,
    label: marker.label,
    kind: marker.kind,
  }))
}
