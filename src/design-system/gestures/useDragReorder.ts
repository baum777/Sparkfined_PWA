import { useMemo } from 'react'
import type { Reorder } from 'framer-motion'

export interface UseDragReorderOptions<T> {
  items: T[]
  onReorder: (items: T[]) => void
  axis?: 'x' | 'y'
}

export function useDragReorder<T>({ items, onReorder, axis = 'y' }: UseDragReorderOptions<T>) {
  const groupProps = useMemo(
    () => ({
      axis,
      values: items,
      onReorder,
    }),
    [axis, items, onReorder]
  )

  const getItemProps = useMemo(
    () =>
      (value: T) => ({
        value,
        whileDrag: { scale: 1.05, boxShadow: '0 0 20px rgba(0, 240, 255, 0.25)' },
      }),
    []
  )

  return {
    groupProps,
    getItemProps,
  }
}
