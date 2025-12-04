import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSwipeable } from './useSwipeable'
import React from 'react'

function SwipeComponent({ onSwipeLeft, onSwipeRight }: { onSwipeLeft: () => void; onSwipeRight: () => void }) {
  const swipe = useSwipeable({ onSwipeLeft, onSwipeRight, threshold: 50 })
  return (
    <div data-testid="swipe-target" {...swipe.bind}>
      Swipe me
    </div>
  )
}

describe('useSwipeable', () => {
  it('fires onSwipeLeft when dragged enough', () => {
    const onSwipeLeft = vi.fn()
    const onSwipeRight = vi.fn()
    render(<SwipeComponent onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} />)
    const target = screen.getByTestId('swipe-target')

    fireEvent.pointerDown(target, { pointerId: 1, clientX: 200 })
    fireEvent.pointerMove(target, { pointerId: 1, clientX: 100 })
    fireEvent.pointerUp(target, { pointerId: 1, clientX: 100 })

    expect(onSwipeLeft).toHaveBeenCalledTimes(1)
    expect(onSwipeRight).not.toHaveBeenCalled()
  })
})
