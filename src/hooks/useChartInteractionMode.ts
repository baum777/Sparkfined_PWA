import { useCallback, useState } from 'react'

export type ChartInteractionMode = 'view' | 'select'

export function useChartInteractionMode(initialMode: ChartInteractionMode = 'view') {
  const [mode, setMode] = useState<ChartInteractionMode>(initialMode)

  const setSelect = useCallback(() => setMode('select'), [])
  const setView = useCallback(() => setMode('view'), [])

  return {
    mode,
    setMode,
    setSelect,
    setView,
  }
}

export default useChartInteractionMode
