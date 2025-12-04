import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Alert } from './Alert'

describe('Alert', () => {
  it('renders title, description and badge', () => {
    render(
      <Alert
        title="BTC Alert"
        description="Price closes above 42k"
        badge={<span data-testid="badge">ARMED</span>}
      />
    )

    expect(screen.getByText('BTC Alert')).toBeInTheDocument()
    expect(screen.getByText('Price closes above 42k')).toBeInTheDocument()
    expect(screen.getByTestId('badge')).toBeInTheDocument()
  })

  it('uses alert role for triggered variant', () => {
    render(<Alert variant="triggered" title="Triggered" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('uses status role for non-triggered variant', () => {
    render(<Alert variant="armed" title="Status" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(
      <Alert
        title="Paused alert"
        actions={<button data-testid="action">Resume</button>}
      />
    )

    expect(screen.getByTestId('action')).toBeInTheDocument()
  })

  it('renders accent bar for visual emphasis', () => {
    const { container } = render(<Alert title="Accent" />)
    const accent = container.querySelector('[aria-hidden="true"]')
    expect(accent).not.toBeNull()
  })
})
