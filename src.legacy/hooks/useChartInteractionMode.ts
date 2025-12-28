import { useCallback, useState } from 'react'

export type ChartInteractionMode = 'view' | 'select' | 'create-line' | 'create-box' | 'create-fib' | 'create-channel'

export function useChartInteractionMode(initialMode: ChartInteractionMode = 'view') {
  const [mode, setMode] = useState<ChartInteractionMode>(initialMode)

  const setSelect = useCallback(() => setMode('select'), [])
  const setView = useCallback(() => setMode('view'), [])
  const setCreateLine = useCallback(() => setMode('create-line'), [])
  const setCreateBox = useCallback(() => setMode('create-box'), [])
  const setCreateFib = useCallback(() => setMode('create-fib'), [])
  const setCreateChannel = useCallback(() => setMode('create-channel'), [])

  return {
    mode,
    setMode,
    setSelect,
    setView,
    setCreateLine,
    setCreateBox,
    setCreateFib,
    setCreateChannel,
  }
}

export default useChartInteractionMode
