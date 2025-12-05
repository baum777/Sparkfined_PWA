import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Execute trade</Button>)

    expect(screen.getByRole('button', { name: /execute trade/i })).toBeInTheDocument()
  })

  it('forwards clicks when enabled', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Ping</Button>)

    fireEvent.click(screen.getByRole('button', { name: /ping/i }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles', () => {
    render(
      <Button variant="ghost" data-testid="ghost-button">
        Ghost
      </Button>
    )

    expect(screen.getByTestId('ghost-button').className).toContain('bg-transparent')
  })

  it('shows loader state when pending', () => {
    render(
      <Button isLoading loading>
        Processing
      </Button>
    )

    const button = screen.getByRole('button', { name: /processing/i })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
    expect(button.querySelector('[data-slot="button-loader"]')).toBeTruthy()
  })
})
