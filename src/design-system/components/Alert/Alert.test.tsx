import { render, screen } from '@testing-library/react'
import { Alert } from './Alert'

describe('Alert', () => {
  it('renders title, description and badge', () => {
    render(
      <Alert
        title="Alert Armed"
        description="Watching BTC breakout"
        badge={<span data-testid="badge">ARMED</span>}
      />
    )

    expect(screen.getByText('Alert Armed')).toBeInTheDocument()
    expect(screen.getByText('Watching BTC breakout')).toBeInTheDocument()
    expect(screen.getByTestId('badge')).toBeInTheDocument()
  })

  it('applies variant tone', () => {
    render(<Alert title="Paused" variant="paused" />)

    const container = screen.getByRole('status')
    expect(container.className).toContain('bg-smoke')
  })
})
