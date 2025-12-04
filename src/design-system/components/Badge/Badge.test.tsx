import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders children content', () => {
    render(<Badge>ARMED</Badge>)
    expect(screen.getByText('ARMED')).toBeInTheDocument()
  })

  it('applies variant styles', () => {
    render(<Badge variant="triggered">Alert</Badge>)
    expect(screen.getByText('Alert').className).toContain('bg-gold/15')
  })

  it('supports pulsing animation', () => {
    render(<Badge pulsing>Live</Badge>)
    expect(screen.getByText('Live').className).toContain('animate-pulse')
  })
})
