import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WalletMonitoringCard from '@/features/settings/WalletMonitoringCard'
import { useUserSettingsStore } from '@/store/userSettings'
import { WELL_KNOWN_ADDRESSES } from '@/lib/validation/address'
import { afterEach, vi } from 'vitest'

describe('WalletMonitoringCard', () => {
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
    const writeText = vi.fn(async () => undefined)
    Object.defineProperty(global.navigator, 'clipboard', {
      value: {
        writeText,
      },
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('disables actions without an address and copies when provided', async () => {
    const user = userEvent.setup()
    render(<WalletMonitoringCard />)

    const copyButton = screen.getByRole('button', { name: /copy monitored wallet address/i })
    const toggleButton = screen.getByRole('button', { name: /enable wallet monitoring/i })

    expect(copyButton).toBeDisabled()
    expect(toggleButton).toBeDisabled()

    const input = screen.getByTestId('wallet-monitoring-address')
    await user.type(input, `  ${WELL_KNOWN_ADDRESSES.SOL} `)

    await waitFor(() => expect(copyButton).toBeEnabled())
    await user.click(copyButton)

    await screen.findByText('Copied!')
    await waitFor(() => expect(copyButton).toHaveTextContent('Copy address'), { timeout: 2000 })
  })

  it('enables monitoring after entering an address', async () => {
    const user = userEvent.setup()
    render(<WalletMonitoringCard />)

    const input = screen.getByTestId('wallet-monitoring-address')
    await user.type(input, WELL_KNOWN_ADDRESSES.USDC)

    const toggleButton = screen.getByRole('button', { name: /enable wallet monitoring/i })
    await user.click(toggleButton)

    expect(toggleButton).toHaveAttribute('aria-pressed', 'true')
    expect(useUserSettingsStore.getState().walletMonitoring.enabled).toBe(true)
    expect(useUserSettingsStore.getState().walletMonitoring.address).toBe(WELL_KNOWN_ADDRESSES.USDC)
  })
})
