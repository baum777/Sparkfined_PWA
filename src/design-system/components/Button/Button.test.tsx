import '@testing-library/jest-dom'

import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Design System Button', () => {
  it('renders label and applies default variant', () => {
    render(<Button>Save trade</Button>)

    const button = screen.getByRole('button', { name: /save trade/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-gradient-spark')
  })

  it('invokes onClick for enabled states', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Execute</Button>)

    const button = screen.getByRole('button', { name: /execute/i })
    await userEvent.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disables interactions when loading', () => {
    render(
      <Button isLoading>
        Loading
      </Button>
    )

    const button = screen.getByRole('button', { name: /loading/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })
})
