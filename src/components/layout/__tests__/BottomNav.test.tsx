import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import BottomNav from '../BottomNav'

describe('BottomNav', () => {
  it('renders all navigation items', () => {
    render(
      <BrowserRouter>
        <BottomNav />
      </BrowserRouter>
    )

    expect(screen.getByText('Analyze')).toBeTruthy()
    expect(screen.getByText('Journal')).toBeTruthy()
    expect(screen.getByText('Replay')).toBeTruthy()
  })

  it('has correct accessibility attributes', () => {
    render(
      <BrowserRouter>
        <BottomNav />
      </BrowserRouter>
    )

    const nav = screen.getByRole('navigation')
    expect(nav).toBeTruthy()
    expect(nav.getAttribute('aria-label')).toBe('Bottom navigation')
  })

  it('renders navigation links with correct paths', () => {
    render(
      <BrowserRouter>
        <BottomNav />
      </BrowserRouter>
    )

    const analyzeLink = screen.getByLabelText('Analyze')
    const journalLink = screen.getByLabelText('Journal')
    const replayLink = screen.getByLabelText('Replay')

    expect(analyzeLink.getAttribute('href')).toBe('/')
    expect(journalLink.getAttribute('href')).toBe('/journal')
    expect(replayLink.getAttribute('href')).toBe('/replay')
  })
})
