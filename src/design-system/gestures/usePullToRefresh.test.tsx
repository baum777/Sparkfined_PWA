import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { usePullToRefresh } from './usePullToRefresh'

function PullComponent({ onRefresh }: { onRefresh: () => void }) {
  const { containerProps } = usePullToRefresh({ threshold: 40, onRefresh })
  return <div data-testid="pull-area" {...containerProps} />
}

describe('usePullToRefresh', () => {
  it('invokes onRefresh after threshold', () => {
    const onRefresh = vi.fn()
    const { getByTestId } = render(<PullComponent onRefresh={onRefresh} />)
    const target = getByTestId('pull-area')

    fireEvent.touchStart(target, { touches: [{ clientY: 0 }] })
    fireEvent.touchMove(target, { touches: [{ clientY: 100 }] })
    fireEvent.touchEnd(target)

    expect(onRefresh).toHaveBeenCalledTimes(1)
  })
})
