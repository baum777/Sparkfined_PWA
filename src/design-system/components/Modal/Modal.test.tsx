import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

describe('Modal', () => {
  it('renders when open', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Spark" description="Alchemy">
        Body
      </Modal>
    )

    expect(screen.getByText('Spark')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('closes when backdrop clicked', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen onClose={handleClose} title="Modal">
        Content
      </Modal>
    )

    fireEvent.click(screen.getByTestId('ds-modal-backdrop'))
    expect(handleClose).toHaveBeenCalled()
  })

  it('closes on escape key', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen onClose={handleClose} title="Modal">
        Content
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalled()
  })
})
