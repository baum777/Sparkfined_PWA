import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useDragReorder } from './useDragReorder'

describe('useDragReorder', () => {
  it('returns group props bound to items array', () => {
    const onReorder = vi.fn()
    const latest = { current: null as ReturnType<typeof useDragReorder<number>> | null }

    function TestComponent() {
      latest.current = useDragReorder({ items: [1, 2], onReorder })
      return null
    }

    render(<TestComponent />)

    expect(latest.current?.groupProps.values).toEqual([1, 2])
    expect(typeof latest.current?.getItemProps(1).whileDrag).toBe('object')
  })
})
