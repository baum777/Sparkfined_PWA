import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card'

describe('Card', () => {
  it('renders content with header and description', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Stats</CardTitle>
          <CardDescription>Performance overview</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>
    )

    expect(screen.getByText('Stats')).toBeInTheDocument()
    expect(screen.getByText('Performance overview')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('sets interactive role when clickable', () => {
    const handleClick = vi.fn()
    render(
      <Card variant="interactive" onClick={handleClick}>
        Interactive
      </Card>
    )

    const card = screen.getByRole('button')
    fireEvent.click(card)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies glow variant styles', () => {
    render(<Card variant="glow">Glow</Card>)
    expect(screen.getByText('Glow').className).toContain('shadow-glow-spark')
  })
})
