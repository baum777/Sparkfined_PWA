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

    expect(screen.getByText('Board')).toBeTruthy()
    expect(screen.getByText('Analyze')).toBeTruthy()
    expect(screen.getByText('Chart')).toBeTruthy()
    expect(screen.getByText('Journal')).toBeTruthy()
    expect(screen.getByText('Settings')).toBeTruthy()
    expect(screen.getByText('More')).toBeTruthy()
  })

  it('has correct accessibility attributes', () => {
    render(
      <BrowserRouter>
        <BottomNav />
      </BrowserRouter>
    )

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav).toBeTruthy()
    expect(nav.getAttribute('aria-label')).toBe('Main navigation')
  })

  it('renders navigation links with correct paths', () => {
    render(
      <BrowserRouter>
        <BottomNav />
      </BrowserRouter>
    )

    const boardLink = screen.getByRole('link', { name: /board/i })
    const analyzeLink = screen.getByRole('link', { name: /analyze/i })
    const chartLink = screen.getByRole('link', { name: /chart/i })
    const journalLink = screen.getByRole('link', { name: /journal/i })
    const settingsLink = screen.getByRole('link', { name: /settings/i })

    expect(boardLink.getAttribute('href')).toBe('/dashboard-v2')
    expect(analyzeLink.getAttribute('href')).toBe('/analysis-v2')
    expect(chartLink.getAttribute('href')).toBe('/chart-v2')
    expect(journalLink.getAttribute('href')).toBe('/journal-v2')
    expect(settingsLink.getAttribute('href')).toBe('/settings-v2')
  })
})
