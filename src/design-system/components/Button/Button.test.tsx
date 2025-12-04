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
})
