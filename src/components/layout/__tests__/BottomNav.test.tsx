import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import BottomNav from '@/features/shell/BottomNavBar'

describe('BottomNav', () => {
  it('renders all navigation items', () => {
    render(
      <BrowserRouter>
        <BottomNav />
      </BrowserRouter>
    )

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    const navArea = within(nav)

    expect(navArea.getByText('Dashboard')).toBeTruthy()
    expect(navArea.getByText('Journal')).toBeTruthy()
    expect(navArea.getByText('Chart')).toBeTruthy()
    expect(navArea.getByText('Watchlist')).toBeTruthy()
    expect(navArea.getByText('Alerts')).toBeTruthy()
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

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    const navArea = within(nav)

    const dashboardLink = navArea.getByRole('link', { name: /dashboard/i })
    const journalLink = navArea.getByRole('link', { name: /journal/i })
    const chartLink = navArea.getByRole('link', { name: /chart/i })
    const watchlistLink = navArea.getByRole('link', { name: /watchlist/i })
    const alertsLink = navArea.getByRole('link', { name: /alerts/i })

    expect(dashboardLink.getAttribute('href')).toBe('/dashboard')
    expect(journalLink.getAttribute('href')).toBe('/journal')
    expect(chartLink.getAttribute('href')).toBe('/chart')
    expect(watchlistLink.getAttribute('href')).toBe('/watchlist')
    expect(alertsLink.getAttribute('href')).toBe('/alerts')
  })

  it('marks Alerts as active for nested alert paths', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/alerts/123' }]}>
        <BottomNav />
      </MemoryRouter>
    )

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    const alertsLink = within(nav).getByRole('link', { name: /alerts/i })
    expect(alertsLink).toBeTruthy()
    expect(alertsLink.getAttribute('aria-current')).toBe('page')
  })
})
