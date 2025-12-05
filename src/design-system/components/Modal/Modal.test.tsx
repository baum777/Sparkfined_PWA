import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

const onClose = vi.fn()

describe('Modal', () => {
  beforeEach(() => {
    onClose.mockReset()
  })

  it('renders content when open', () => {
    render(
      <Modal isOpen onClose={onClose} title="Create alert" description="Set up a trigger">
        <p>Modal body</p>
      </Modal>
    )

    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByText('Modal body')).toBeInTheDocument()
  })

  it('calls onClose when backdrop clicked', () => {
    render(
      <Modal isOpen onClose={onClose} title="Backdrop">
        Backdrop test
      </Modal>
    )

    fireEvent.click(screen.getByTestId('modal-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when pressing escape', () => {
    render(
      <Modal isOpen onClose={onClose} title="Escape close">
        ESC test
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not render when closed', () => {
    const { queryByTestId } = render(
      <Modal isOpen={false} onClose={onClose} title="Hidden">
        Hidden
      </Modal>
    )

    expect(queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('respects closeOnOverlayClick when disabled', () => {
    render(
      <Modal isOpen onClose={onClose} closeOnOverlayClick={false} title="Locked">
        Locked modal
      </Modal>
    )

    fireEvent.click(screen.getByTestId('modal-backdrop'))
    expect(onClose).not.toHaveBeenCalled()
  })
})
