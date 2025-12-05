import '@testing-library/jest-dom'

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card'

describe('Design System Card', () => {
  it('renders card sections', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Session stats</CardTitle>
          <CardDescription>Last 24h performance</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    )

    expect(screen.getByText(/session stats/i)).toBeInTheDocument()
    expect(screen.getByText(/last 24h/i)).toBeInTheDocument()
    expect(screen.getByText(/footer/i)).toBeInTheDocument()
  })

  it('supports interactive click and keyboard activation', async () => {
    const onClick = vi.fn()
    render(
      <Card interactive onClick={onClick}>
        Interactive
      </Card>
    )

    const card = screen.getByRole('button', { name: /interactive/i })
    await userEvent.click(card)
    expect(onClick).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(card, { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(2)
  })
})
