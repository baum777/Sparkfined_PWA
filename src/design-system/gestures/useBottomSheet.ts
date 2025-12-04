import { useCallback, useMemo } from 'react'
import type { PanInfo, Transition, TargetAndTransition } from 'framer-motion'

export interface UseBottomSheetOptions {
  isOpen: boolean
  onClose: () => void
  threshold?: number
  velocity?: number
}

export function useBottomSheet({ isOpen, onClose, threshold = 100, velocity = 300 }: UseBottomSheetOptions) {
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y > threshold || info.velocity.y > velocity) {
        onClose()
      }
    },
    [onClose, threshold, velocity]
  )

  const sheetMotion = useMemo(
    () => ({
      initial: { y: '100%', opacity: 0 } as TargetAndTransition,
      animate: { y: isOpen ? 0 : '100%', opacity: isOpen ? 1 : 0 } as TargetAndTransition,
      transition: { type: 'spring', damping: 30, stiffness: 300 } as Transition,
      drag: 'y' as const,
      dragConstraints: { top: 0, bottom: 500 },
      dragElastic: 0.2,
      onDragEnd: handleDragEnd,
    }),
    [handleDragEnd, isOpen]
  )

  const backdropMotion = useMemo(
    () => ({
      initial: { opacity: 0 },
      animate: { opacity: isOpen ? 1 : 0 },
      exit: { opacity: 0 },
    }),
    [isOpen]
  )

  return {
    sheetMotion,
    backdropMotion,
  }
}
