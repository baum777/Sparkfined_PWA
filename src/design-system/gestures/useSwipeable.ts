import { useCallback, useMemo, useRef, useState } from 'react'

export interface UseSwipeableOptions {
  threshold?: number
  velocity?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export interface SwipeableBind {
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void
  onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void
}

export function useSwipeable({
  threshold = 150,
  velocity = 500,
  onSwipeLeft,
  onSwipeRight,
}: UseSwipeableOptions = {}) {
  const startX = useRef<number | null>(null)
  const startTime = useRef<number>(0)
  const pointerId = useRef<number | null>(null)
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const reset = useCallback(() => {
    startX.current = null
    pointerId.current = null
    startTime.current = 0
    setOffset(0)
    setIsDragging(false)
  }, [])

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (pointerId.current !== null) return
    pointerId.current = event.pointerId
    startX.current = event.clientX
    startTime.current = performance.now()
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [])

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (!isDragging || pointerId.current !== event.pointerId || startX.current == null) {
      return
    }
    setOffset(event.clientX - startX.current)
  }, [isDragging])

  const handlePointerEnd = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (pointerId.current !== event.pointerId || startX.current == null) {
        reset()
        return
      }

      const deltaX = event.clientX - startX.current
      const deltaTime = performance.now() - startTime.current
      const speed = Math.abs(deltaX) / Math.max(deltaTime, 1) * 1000

      if (Math.abs(deltaX) >= threshold || speed >= velocity) {
        if (deltaX < 0) {
          onSwipeLeft?.()
        } else {
          onSwipeRight?.()
        }
      }

      reset()
    },
    [onSwipeLeft, onSwipeRight, reset, threshold, velocity]
  )

  const bind: SwipeableBind = useMemo(
    () => ({
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerCancel: handlePointerEnd,
    }),
    [handlePointerDown, handlePointerMove, handlePointerEnd]
  )

  const progress = Math.min(1, Math.abs(offset) / threshold)

  return {
    bind,
    offset,
    progress,
    direction: offset === 0 ? 'none' : offset > 0 ? 'right' : 'left',
    isDragging,
  }
}
