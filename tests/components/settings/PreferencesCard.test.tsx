import '@testing-library/jest-dom/vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import PreferencesCard from '@/features/settings/PreferencesCard'
import { useUserSettingsStore } from '@/store/userSettings'

describe('PreferencesCard', () => {
  beforeEach(() => {
    useUserSettingsStore.persist?.clearStorage?.()
    useUserSettingsStore.setState({
      walletMonitoring: { address: '', enabled: false },
      preferences: {
        chartStyle: 'pro',
        confirmBeforeActions: true,
        autoSyncWatchlist: false,
      },
    })
  })

  it('switches chart style preference', async () => {
    const user = userEvent.setup()
    render(<PreferencesCard />)

    const options = screen.getByRole('list')
    const items = within(options).getAllByRole('listitem')
    const minimalButton = items[1]

    await user.click(minimalButton)

    expect(useUserSettingsStore.getState().preferences.chartStyle).toBe('minimal')
    expect(minimalButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('toggles confirmation preference', async () => {
    const user = userEvent.setup()
    render(<PreferencesCard />)

    const confirmToggle = screen.getByRole('button', { name: /Confirm actions toggle/i })
    await user.click(confirmToggle)

    expect(useUserSettingsStore.getState().preferences.confirmBeforeActions).toBe(false)
    expect(confirmToggle).toHaveAttribute('aria-pressed', 'false')
  })
})
