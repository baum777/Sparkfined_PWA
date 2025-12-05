import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('renders label and helper text', () => {
    render(<Input label="Price" helperText="USD" placeholder="0.00" />)
    expect(screen.getByLabelText('Price')).toBeInTheDocument()
    expect(screen.getByText('USD')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(<Input label="Price" errorText="Required" />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Required')
    expect(screen.getByLabelText('Price')).toHaveAttribute('aria-invalid', 'true')
  })

  it('supports left and right icons', () => {
    render(
      <Input
        label="Search"
        leftIcon={<span data-testid="left">L</span>}
        rightIcon={<span data-testid="right">R</span>}
      />
    )
    expect(screen.getByTestId('left')).toBeInTheDocument()
    expect(screen.getByTestId('right')).toBeInTheDocument()
  })
})
