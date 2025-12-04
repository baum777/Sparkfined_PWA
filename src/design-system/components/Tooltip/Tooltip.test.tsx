import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('shows tooltip content on hover after delay', async () => {
    render(
      <Tooltip content="More info">
        <button type="button">Trigger</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Trigger')
    fireEvent.mouseEnter(trigger)
    await act(async () => {
      vi.advanceTimersByTime(200)
    })

    expect(screen.getByRole('tooltip')).toHaveTextContent('More info')
  })

  it('hides tooltip on mouse leave', async () => {
    render(
      <Tooltip content="More info">
        <button type="button">Trigger</button>
      </Tooltip>
    )
    const trigger = screen.getByText('Trigger')
    fireEvent.mouseEnter(trigger)
    await act(async () => {
      vi.advanceTimersByTime(200)
    })
    fireEvent.mouseLeave(trigger)
    await act(async () => {
      vi.advanceTimersByTime(200)
    })
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})
