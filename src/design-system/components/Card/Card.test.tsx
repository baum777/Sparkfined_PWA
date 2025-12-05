import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { Card, CardContent, CardHeader, CardTitle } from './Card'

describe('Card', () => {
  it('renders with glow variant', () => {
    render(
      <Card variant="glow" data-testid="spark-card">
        <CardHeader>
          <CardTitle>Session stats</CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>
    )

    expect(screen.getByTestId('spark-card').className).toContain('shadow-glow-spark')
  })

  it('supports keyboard activation when interactive', () => {
    const handleClick = vi.fn()
    render(
      <Card interactive onClick={handleClick}>
        Clickable card
      </Card>
    )

    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
