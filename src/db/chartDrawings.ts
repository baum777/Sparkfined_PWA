import type { ChartDrawingRecord, ChartTimeframe } from '@/domain/chart'
import { boardDB } from '@/lib/db-board'

function resolveId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeDrawing(drawing: ChartDrawingRecord): ChartDrawingRecord {
  const now = Date.now()

  return {
    ...drawing,
    id: drawing.id ?? resolveId(),
    origin: drawing.origin ?? 'manual',
    createdAt: drawing.createdAt ?? now,
    updatedAt: now,
  }
}

export async function listDrawings(symbol: string, timeframe: ChartTimeframe): Promise<ChartDrawingRecord[]> {
  try {
    return await boardDB.chart_drawings
      .where('[symbol+timeframe]')
      .equals([symbol, timeframe])
      .toArray()
  } catch (error) {
    console.warn('[chart_drawings] Failed to list drawings', error)
    return []
  }
}

export async function saveDrawing(drawing: ChartDrawingRecord): Promise<ChartDrawingRecord> {
  const persisted = normalizeDrawing(drawing)
  await boardDB.chart_drawings.put(persisted)
  return persisted
}

export const upsertDrawing = saveDrawing

export async function deleteDrawing(id: string): Promise<void> {
  await boardDB.chart_drawings.delete(id)
}

export async function clearDrawings(symbol: string, timeframe: ChartTimeframe): Promise<number> {
  return await boardDB.chart_drawings
    .where('[symbol+timeframe]')
    .equals([symbol, timeframe])
    .delete()
}
