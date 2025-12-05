import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Execute</Button>)
    expect(screen.getByRole('button', { name: /execute/i })).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button', { name: /secondary/i })
    expect(button.className).toMatch(/border-spark/)
  })

  it('fires onClick when enabled', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button', { name: /click/i }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('prevents onClick when loading', () => {
    const handleClick = vi.fn()
    render(
      <Button isLoading onClick={handleClick}>
        Saving
      </Button>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
