import '@testing-library/jest-dom'

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert } from './Alert'
import { Button } from '../Button/Button'

describe('Design System Alert', () => {
  it('renders title, description and badge', () => {
    render(
      <Alert
        variant="armed"
        title="Alert armed"
        description="We will ping you once the spread narrows."
        badge={<span data-testid="badge">ARMED</span>}
      />
    )

    expect(screen.getByText(/alert armed/i)).toBeInTheDocument()
    expect(screen.getByText(/spread narrows/i)).toBeInTheDocument()
    expect(screen.getByTestId('badge')).toBeInTheDocument()
  })

  it('renders actions slot', () => {
    render(
      <Alert
        variant="paused"
        title="Paused"
        actions={<Button size="sm">Resume</Button>}
      />
    )

    expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument()
  })
})
