import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SettingsPage from '@/features/settings/SettingsPage'
import { SettingsProvider } from '@/state/settings'
import { ThemeProvider } from '@/features/theme/ThemeContext'

describe('SettingsPage mobile layout', () => {
  it('renders stacked cards and accessible accordions on mobile widths', () => {
    // Simulate a mobile viewport
    global.innerWidth = 480
    global.dispatchEvent(new Event('resize'))

    render(
      <SettingsProvider>
        <ThemeProvider>
          <SettingsPage />
        </ThemeProvider>
      </SettingsProvider>,
    )

    expect(screen.getByRole('heading', { name: /Settings/i })).toBeInTheDocument()
    const cards = screen.getAllByRole('listitem')
    expect(cards.length).toBeGreaterThan(4)
    expect(screen.getByRole('button', { name: /Destructive actions/i })).toBeInTheDocument()
  })
})
