import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChartDrawingRecord, ChartTimeframe } from '@/domain/chart'
import { clearDrawings, deleteDrawing, listDrawings, saveDrawing } from '@/db/chartDrawings'
import { canRedo, canUndo, commitHistory, createHistory, redoHistory, undoHistory } from '@/lib/chart/drawings/history'

interface ChartDrawingsState {
  drawings: ChartDrawingRecord[]
  isLoading: boolean
  selectedId: string | null
  canUndo: boolean
  canRedo: boolean
}

const withoutSelection = (drawing: ChartDrawingRecord): ChartDrawingRecord => {
  const { isSelected: _isSelected, ...rest } = drawing
  return rest
}

const applySelection = (drawings: ChartDrawingRecord[], selectedId: string | null): ChartDrawingRecord[] =>
  drawings.map((drawing) => ({ ...drawing, isSelected: Boolean(selectedId && drawing.id === selectedId) }))

const resolveId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

export function useChartDrawings(symbol: string, timeframe: ChartTimeframe) {
  const [state, setState] = useState<ChartDrawingsState>({
    drawings: [],
    isLoading: true,
    selectedId: null,
    canUndo: false,
    canRedo: false,
  })
  const historyRef = useRef(createHistory([], 20))

  const persistDrawings = useCallback(
    async (drawings: ChartDrawingRecord[]) => {
      try {
        await clearDrawings(symbol, timeframe)
        await Promise.all(
          drawings.map((drawing) =>
            saveDrawing({
              ...withoutSelection(drawing),
              symbol,
              timeframe,
            })
          )
        )
      } catch (error) {
        console.warn('[useChartDrawings] Failed to persist drawings', error)
      }
    },
    [symbol, timeframe]
  )

  const loadDrawings = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, selectedId: null }))
    historyRef.current = createHistory([], 20)

    try {
      const drawings = await listDrawings(symbol, timeframe)
      historyRef.current = createHistory(drawings, 20)
      setState({
        drawings: applySelection(drawings, null),
        isLoading: false,
        selectedId: null,
        canUndo: false,
        canRedo: false,
      })
    } catch (error) {
      console.warn('[useChartDrawings] Failed to load drawings', error)
      setState({ drawings: [], isLoading: false, selectedId: null, canUndo: false, canRedo: false })
    }
  }, [symbol, timeframe])

  useEffect(() => {
    void loadDrawings()
  }, [loadDrawings])

  const applyChange = useCallback(
    async (mutate: (current: ChartDrawingRecord[]) => ChartDrawingRecord[], nextSelectedId?: string | null) => {
      let nextDrawings: ChartDrawingRecord[] | null = null

      setState((prev) => {
        const base = historyRef.current.present
        nextDrawings = mutate(base)
        const resolvedSelected = nextSelectedId ?? prev.selectedId
        const safeSelection = resolvedSelected && nextDrawings.some((item) => item.id === resolvedSelected)
          ? resolvedSelected
          : null

        historyRef.current = commitHistory(historyRef.current, nextDrawings)

        return {
          drawings: applySelection(nextDrawings, safeSelection),
          isLoading: false,
          selectedId: safeSelection,
          canUndo: canUndo(historyRef.current),
          canRedo: canRedo(historyRef.current),
        }
      })

      if (nextDrawings) {
        await persistDrawings(nextDrawings)
      }
    },
    [persistDrawings]
  )

  const selectDrawing = useCallback((drawing: ChartDrawingRecord | null) => {
    setState((prev) => {
      const selectedId = drawing?.id ?? null
      return {
        ...prev,
        drawings: applySelection(historyRef.current.present, selectedId),
        selectedId,
      }
    })
  }, [])

  const createDrawing = useCallback(
    async (drawing: ChartDrawingRecord) => {
      const withId = drawing.id ? drawing : { ...drawing, id: resolveId() }
      await applyChange((current) => {
        const withoutSelectionFlags = current.map(withoutSelection)
        return [...withoutSelectionFlags, withId]
      }, withId.id)
    },
    [applyChange]
  )

  const updateDrawing = useCallback(
    async (drawing: ChartDrawingRecord) => {
      await applyChange((current) =>
        current.map((item) => (item.id === drawing.id ? { ...withoutSelection(drawing) } : item))
      )
    },
    [applyChange]
  )

  const deleteSelected = useCallback(async () => {
    let targetId: string | null = null
    await applyChange((current) => {
      targetId = state.selectedId
      return current.filter((item) => item.id !== state.selectedId)
    }, null)

    if (targetId) {
      await deleteDrawing(targetId)
    }
  }, [applyChange, state.selectedId])

  const undo = useCallback(async () => {
    if (!canUndo(historyRef.current)) return

    let restored: ChartDrawingRecord[] | undefined
    setState((prev) => {
      const { state: nextHistory, value } = undoHistory(historyRef.current)
      historyRef.current = nextHistory
      restored = value
      const selectedId = prev.selectedId && value?.some((item) => item.id === prev.selectedId) ? prev.selectedId : null

      return {
        drawings: applySelection(value ?? prev.drawings, selectedId),
        isLoading: false,
        selectedId,
        canUndo: canUndo(historyRef.current),
        canRedo: canRedo(historyRef.current),
      }
    })

    if (restored) {
      await persistDrawings(restored)
    }
  }, [persistDrawings])

  const redo = useCallback(async () => {
    if (!canRedo(historyRef.current)) return

    let restored: ChartDrawingRecord[] | undefined
    setState((prev) => {
      const { state: nextHistory, value } = redoHistory(historyRef.current)
      historyRef.current = nextHistory
      restored = value
      const selectedId = prev.selectedId && value?.some((item) => item.id === prev.selectedId) ? prev.selectedId : null

      return {
        drawings: applySelection(value ?? prev.drawings, selectedId),
        isLoading: false,
        selectedId,
        canUndo: canUndo(historyRef.current),
        canRedo: canRedo(historyRef.current),
      }
    })

    if (restored) {
      await persistDrawings(restored)
    }
  }, [persistDrawings])

  return {
    drawings: state.drawings,
    isLoading: state.isLoading,
    selectedId: state.selectedId,
    canUndo: state.canUndo,
    canRedo: state.canRedo,
    selectDrawing,
    createDrawing,
    updateDrawing,
    deleteSelected,
    undo,
    redo,
  }
}

export default useChartDrawings
