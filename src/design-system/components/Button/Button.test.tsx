import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders children content', () => {
    render(<Button>Execute</Button>)
    expect(screen.getByRole('button', { name: 'Execute' })).toBeInTheDocument()
  })

  it('applies variant specific classes', () => {
    render(<Button variant="primary">Primary</Button>)
    const button = screen.getByRole('button', { name: 'Primary' })
    expect(button.className).toContain('bg-gradient-spark')
  })

  it('prevents clicks when disabled', () => {
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        Delete
      </Button>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders spinner when loading', () => {
    render(<Button isLoading>Processing</Button>)
    expect(screen.getByTestId('button-spinner')).toBeInTheDocument()
  })

  it('renders optional icons when provided', () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon">L</span>}
        rightIcon={<span data-testid="right-icon">R</span>}
      >
        Iconic
      </Button>
    )

    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('applies size classes', () => {
    render(<Button size="xl">Gigantic</Button>)
    const button = screen.getByRole('button', { name: 'Gigantic' })
    expect(button.className).toContain('h-16')
  })
})
