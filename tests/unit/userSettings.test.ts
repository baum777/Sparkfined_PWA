import { beforeEach, describe, expect, it } from 'vitest'
import { useUserSettingsStore } from '@/store/userSettings'

describe('userSettingsStore', () => {
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

  it('normalizes addresses and clears enable state when empty', () => {
    useUserSettingsStore.getState().setWalletMonitoringAddress('  So11111111111111111111111111111111111111112  ')

    expect(useUserSettingsStore.getState().walletMonitoring).toEqual({
      address: 'So11111111111111111111111111111111111111112',
      enabled: false,
    })

    useUserSettingsStore.getState().setWalletMonitoringAddress('  ')
    expect(useUserSettingsStore.getState().walletMonitoring.enabled).toBe(false)
  })

  it('requires an address before enabling monitoring', () => {
    useUserSettingsStore.getState().setWalletMonitoringEnabled(true)
    expect(useUserSettingsStore.getState().walletMonitoring.enabled).toBe(false)

    useUserSettingsStore.getState().setWalletMonitoringAddress('So11111111111111111111111111111111111111112')
    useUserSettingsStore.getState().setWalletMonitoringEnabled(true)

    expect(useUserSettingsStore.getState().walletMonitoring.enabled).toBe(true)
  })

  it('preserves enabled state when updating the monitored address', () => {
    useUserSettingsStore.getState().setWalletMonitoringAddress('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
    useUserSettingsStore.getState().setWalletMonitoringEnabled(true)

    useUserSettingsStore.getState().setWalletMonitoringAddress('So11111111111111111111111111111111111111112')

    expect(useUserSettingsStore.getState().walletMonitoring).toEqual({
      address: 'So11111111111111111111111111111111111111112',
      enabled: true,
    })
  })

  it('updates preferences while keeping other state intact', () => {
    useUserSettingsStore.getState().setPreference('chartStyle', 'minimal')
    useUserSettingsStore.getState().setPreference('autoSyncWatchlist', true)

    expect(useUserSettingsStore.getState().preferences).toEqual({
      chartStyle: 'minimal',
      confirmBeforeActions: true,
      autoSyncWatchlist: true,
    })
    expect(useUserSettingsStore.getState().walletMonitoring.address).toBe('')
  })
})
