import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useBottomSheet } from './useBottomSheet'

describe('useBottomSheet', () => {
  it('calls onClose when drag exceeds threshold', () => {
    const onClose = vi.fn()
    const latest = { current: null as ReturnType<typeof useBottomSheet> | null }

    function TestComponent() {
      latest.current = useBottomSheet({ isOpen: true, onClose, threshold: 50 })
      return null
    }

    render(<TestComponent />)

    latest.current?.sheetMotion.onDragEnd?.(
      {} as MouseEvent,
      {
        offset: { x: 0, y: 80 },
        velocity: { x: 0, y: 0 },
      } as any
    )
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
