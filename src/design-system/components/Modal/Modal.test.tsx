import '@testing-library/jest-dom'

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Button } from '../Button/Button'
import { Modal } from './Modal'

describe('Design System Modal', () => {
  it('renders title and children when open', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Spark Modal" description="Details">
        <p>Body content</p>
      </Modal>
    )

    expect(screen.getByRole('heading', { name: /spark modal/i })).toBeInTheDocument()
    expect(screen.getByText(/body content/i)).toBeInTheDocument()
  })

  it('invokes onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} title="Backdrop test">
        <div />
      </Modal>
    )

    const backdrop = screen.getByTestId('modal-backdrop')
    fireEvent.click(backdrop)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on escape', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} title="Escape test">
        <Button>Confirm</Button>
      </Modal>
    )

    const dialog = screen.getByRole('dialog')
    fireEvent.keyDown(dialog, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
