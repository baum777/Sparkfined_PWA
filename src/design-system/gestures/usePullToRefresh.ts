import { useCallback, useRef, useState } from 'react'
import { haptic } from '@/design-system/utils/haptic'

export type PullState = 'idle' | 'pulling' | 'ready' | 'refreshing' | 'complete'

export interface UsePullToRefreshOptions {
  threshold?: number
  resistance?: number
  onRefresh?: () => Promise<void> | void
}

export function usePullToRefresh({ threshold = 80, resistance = 2, onRefresh }: UsePullToRefreshOptions = {}) {
  const startY = useRef<number | null>(null)
  const triggeredHaptic = useRef(false)
  const [distance, setDistance] = useState(0)
  const [state, setState] = useState<PullState>('idle')

  const reset = useCallback(() => {
    startY.current = null
    triggeredHaptic.current = false
    setDistance(0)
    setState('idle')
  }, [])

  const finishRefresh = useCallback(() => {
    setState('complete')
    setTimeout(() => {
      reset()
    }, 600)
  }, [reset])

  const handleRefresh = useCallback(async () => {
    setState('refreshing')
    await onRefresh?.()
    finishRefresh()
  }, [finishRefresh, onRefresh])

  const onTouchStart = useCallback((event: React.TouchEvent) => {
    if (window.scrollY > 0) return
    startY.current = event.touches[0]?.clientY ?? null
  }, [])

  const onTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (startY.current === null) return
      const currentY = event.touches[0]?.clientY ?? 0
      const delta = currentY - startY.current
      if (delta <= 0) {
        reset()
        return
      }

      const pullDistance = delta / resistance
      setDistance(pullDistance)
      if (pullDistance >= threshold) {
        setState('ready')
        if (!triggeredHaptic.current) {
          haptic.impact()
          triggeredHaptic.current = true
        }
      } else {
        setState('pulling')
        triggeredHaptic.current = false
      }
    },
    [reset, resistance, threshold]
  )

  const onTouchEnd = useCallback(() => {
    if (state === 'ready') {
      handleRefresh()
    } else if (state !== 'refreshing') {
      reset()
    }
  }, [handleRefresh, reset, state])

  return {
    containerProps: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    state,
    distance,
    progress: Math.min(distance / threshold, 1),
  }
}
