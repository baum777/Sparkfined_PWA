import { describe, expect, it } from 'vitest'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import { useRef, useState } from 'react'
import { useFocusTrap } from '@/hooks/useFocusTrap'

function TestModal() {
  const [open, setOpen] = useState(false)
  const initialFocusRef = useRef<HTMLButtonElement>(null)
  const modalRef = useFocusTrap<HTMLDivElement>({
    isActive: open,
    initialFocusRef,
    onEscape: () => setOpen(false),
  })

  return (
    <div>
      <button data-testid="trigger" onClick={() => setOpen(true)}>
        Open modal
      </button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false)
            }
          }}
        >
          <div ref={modalRef} tabIndex={-1} data-testid="modal-content">
            <button ref={initialFocusRef} data-testid="primary-action" onClick={() => setOpen(false)}>
              Close
            </button>
            <button data-testid="secondary-action">Secondary</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

describe('useFocusTrap', () => {
  it('cycles focus forward within the modal', async () => {
    render(<TestModal />)
    const trigger = screen.getByTestId('trigger')
    trigger.focus()
    fireEvent.click(trigger)

    const primaryAction = await waitFor(() => screen.getByTestId('primary-action'))
    const secondaryAction = screen.getByTestId('secondary-action')

    expect(document.activeElement).toBe(primaryAction)

    secondaryAction.focus()
    fireEvent.keyDown(secondaryAction, { key: 'Tab' })

    expect(document.activeElement).toBe(primaryAction)
  })

  it('cycles focus backward and restores focus on close', async () => {
    render(<TestModal />)
    const trigger = screen.getByTestId('trigger')
    trigger.focus()
    fireEvent.click(trigger)

    const primaryAction = await waitFor(() => screen.getByTestId('primary-action'))
    const secondaryAction = screen.getByTestId('secondary-action')

    primaryAction.focus()
    fireEvent.keyDown(primaryAction, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(secondaryAction)

    fireEvent.keyDown(secondaryAction, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByTestId('modal-content')).toBeNull()
    })

    expect(document.activeElement).toBe(trigger)
  })
})
