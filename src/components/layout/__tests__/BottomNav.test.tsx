import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import BottomNav from '../BottomNav'

describe('BottomNav', () => {
  it('renders all navigation items', () => {
    render(
      <BrowserRouter>
        <BottomNav />
      </BrowserRouter>
    )

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    const navArea = within(nav)

    expect(navArea.getByText('Board')).toBeTruthy()
    expect(navArea.getByText('Analyze')).toBeTruthy()
    expect(navArea.getByText('Chart')).toBeTruthy()
    expect(navArea.getByText('Signals')).toBeTruthy()
    expect(navArea.getByText('Journal')).toBeTruthy()
    expect(navArea.getByText('Settings')).toBeTruthy()
    expect(navArea.getByText('More')).toBeTruthy()
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

    const boardLink = navArea.getByRole('link', { name: /board/i })
    const analyzeLink = navArea.getByRole('link', { name: /analyze/i })
    const chartLink = navArea.getByRole('link', { name: /chart/i })
    const signalsLink = navArea.getByRole('link', { name: /signals/i })
    const journalLink = navArea.getByRole('link', { name: /journal/i })
    const settingsLink = navArea.getByRole('link', { name: /settings/i })

    expect(boardLink.getAttribute('href')).toBe('/dashboard')
    expect(analyzeLink.getAttribute('href')).toBe('/analysis')
    expect(chartLink.getAttribute('href')).toBe('/chart')
    expect(signalsLink.getAttribute('href')).toBe('/signals')
    expect(journalLink.getAttribute('href')).toBe('/journal')
    expect(settingsLink.getAttribute('href')).toBe('/settings')
  })

  it('marks Signals as active when on /signals', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/signals' }]}>
        <BottomNav />
      </MemoryRouter>
    )

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    const signalsLink = within(nav).getByRole('link', { name: /signals/i })
    expect(signalsLink).toBeTruthy()
    expect(signalsLink.getAttribute('aria-current')).toBe('page')
  })

  it('shows Signals in the navigation drawer', () => {
    render(
      <BrowserRouter>
        <BottomNav />
      </BrowserRouter>
    )

    const drawerTrigger = screen.getByTestId('nav-drawer-trigger')
    fireEvent.click(drawerTrigger)

    const drawer = screen.getByRole('dialog', { name: 'Secondary navigation' })
    const signalsLinkInDrawer = within(drawer).getByRole('link', { name: /signals/i })

    expect(signalsLinkInDrawer).toBeTruthy()
  })
})
