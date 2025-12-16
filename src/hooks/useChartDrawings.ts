import { useEffect, useState } from 'react'
import type { ChartDrawingRecord, ChartTimeframe } from '@/domain/chart'
import { listDrawings } from '@/db/chartDrawings'

interface ChartDrawingsState {
  drawings: ChartDrawingRecord[]
  isLoading: boolean
}

export function useChartDrawings(symbol: string, timeframe: ChartTimeframe): ChartDrawingsState {
  const [state, setState] = useState<ChartDrawingsState>({ drawings: [], isLoading: true })

  useEffect(() => {
    let active = true
    setState((prev) => ({ ...prev, isLoading: true }))

    void listDrawings(symbol, timeframe)
      .then((drawings) => {
        if (!active) return
        setState({ drawings, isLoading: false })
      })
      .catch((error) => {
        console.warn('[useChartDrawings] Failed to load drawings', error)
        if (!active) return
        setState({ drawings: [], isLoading: false })
      })

    return () => {
      active = false
    }
  }, [symbol, timeframe])

  return state
}

export default useChartDrawings
