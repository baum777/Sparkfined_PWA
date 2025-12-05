import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Alert } from './Alert'

describe('Alert', () => {
  it('renders title and description', () => {
    render(<Alert title="BTCUSDT" description="RSI above 60" />)
    expect(screen.getByText('BTCUSDT')).toBeInTheDocument()
    expect(screen.getByText('RSI above 60')).toBeInTheDocument()
  })

  it('renders badge and actions', () => {
    render(
      <Alert
        title="Triggered"
        badge={<span data-testid="badge">ARMED</span>}
        actions={<button type="button">Acknowledge</button>}
      />
    )

    expect(screen.getByTestId('badge')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /acknowledge/i })).toBeInTheDocument()
  })
})
