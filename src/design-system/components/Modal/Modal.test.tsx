import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { Modal } from './Modal'

describe('Modal', () => {
  it('renders dialog when open', () => {
    render(
      <Modal isOpen onClose={() => undefined} title="Spark Modal">
        <p>Body</p>
      </Modal>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose}>
        Content
      </Modal>
    )

    const backdrop = screen.getByTestId('modal-backdrop')
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalled()
  })

  it('unmounts when closed', () => {
    const { rerender } = render(
      <Modal isOpen onClose={() => undefined}>
        Content
      </Modal>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    rerender(
      <Modal isOpen={false} onClose={() => undefined}>
        Content
      </Modal>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
