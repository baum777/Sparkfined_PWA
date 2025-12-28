import type { ChartDrawingRecord } from '@/domain/chart'

export interface DrawingHistoryState {
  past: ChartDrawingRecord[][]
  present: ChartDrawingRecord[]
  future: ChartDrawingRecord[][]
  limit: number
}

export function createHistory(initial: ChartDrawingRecord[] = [], limit = 20): DrawingHistoryState {
  return {
    past: [],
    present: initial,
    future: [],
    limit,
  }
}

export function commitHistory(state: DrawingHistoryState, next: ChartDrawingRecord[]): DrawingHistoryState {
  const trimmedPast = [...state.past, state.present].slice(-state.limit)
  return {
    ...state,
    past: trimmedPast,
    present: next,
    future: [],
  }
}

export function undoHistory(state: DrawingHistoryState): {
  state: DrawingHistoryState
  value?: ChartDrawingRecord[]
} {
  if (!state.past.length) return { state }

  const previous = state.past[state.past.length - 1]
  if (!previous) return { state }
  const nextPast = state.past.slice(0, -1)
  const future = [state.present, ...state.future].slice(0, state.limit)

  return {
    state: {
      ...state,
      past: nextPast,
      present: previous,
      future,
    },
    value: previous,
  }
}

export function redoHistory(state: DrawingHistoryState): {
  state: DrawingHistoryState
  value?: ChartDrawingRecord[]
} {
  if (!state.future.length) return { state }

  const next = state.future[0]
  if (!next) return { state }
  const future = state.future.slice(1)
  const past = [...state.past, state.present].slice(-state.limit)

  return {
    state: {
      ...state,
      past,
      present: next,
      future,
    },
    value: next,
  }
}

export const canUndo = (state: DrawingHistoryState): boolean => state.past.length > 0
export const canRedo = (state: DrawingHistoryState): boolean => state.future.length > 0
