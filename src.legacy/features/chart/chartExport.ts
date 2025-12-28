import type { ChartTimeframe } from "@/domain/chart"
import type { ReplayState } from "./replay"

export interface ChartExportInput {
  symbol: string
  timeframe: ChartTimeframe
  replayState: ReplayState
}

export interface ChartExportPayload {
  exportedAt: string
  symbol: string
  timeframe: ChartTimeframe
  replay: ReplayState
  note: string
}

const sanitizeSegment = (value: string): string => value.toLowerCase().replace(/[^a-z0-9-_]+/g, "-")

export const buildChartExportPayload = ({ symbol, timeframe, replayState }: ChartExportInput): ChartExportPayload => ({
  exportedAt: new Date().toISOString(),
  symbol,
  timeframe,
  replay: replayState,
  note: "Chart export stub with symbol, timeframe, and replay state only.",
})

export const buildChartExportFilename = ({ symbol, timeframe }: ChartExportInput): string =>
  `chart-export-${sanitizeSegment(symbol)}-${timeframe}.json`

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.rel = "noopener"
  link.click()
  requestAnimationFrame(() => URL.revokeObjectURL(url))
}

export const exportChartSnapshot = async (input: ChartExportInput): Promise<string> => {
  const payload = buildChartExportPayload(input)
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
  const filename = buildChartExportFilename(input)
  triggerDownload(blob, filename)
  return filename
}
