import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { normalizeSolanaAddress } from '@/lib/validation/address'

export interface WalletMonitoringSettings {
  address: string
  enabled: boolean
}

export interface UserPreferences {
  chartStyle: 'pro' | 'minimal'
  confirmBeforeActions: boolean
  autoSyncWatchlist: boolean
}

interface UserSettingsState {
  walletMonitoring: WalletMonitoringSettings
  preferences: UserPreferences
  setWalletMonitoringAddress: (address: string) => void
  setWalletMonitoringEnabled: (enabled: boolean) => void
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void
}

const DEFAULT_MONITORING: WalletMonitoringSettings = {
  address: '',
  enabled: false,
}

const DEFAULT_PREFERENCES: UserPreferences = {
  chartStyle: 'pro',
  confirmBeforeActions: true,
  autoSyncWatchlist: false,
}

export const useUserSettingsStore = create<UserSettingsState>()(
  persist(
    (set) => ({
      walletMonitoring: DEFAULT_MONITORING,
      preferences: DEFAULT_PREFERENCES,
      setWalletMonitoringAddress: (address: string) => {
        const normalized = normalizeSolanaAddress(address)
        set((state) => ({
          walletMonitoring: {
            address: normalized,
            enabled: normalized ? state.walletMonitoring.enabled : false,
          },
        }))
      },
      setWalletMonitoringEnabled: (enabled: boolean) => {
        set((state) => ({
          walletMonitoring: {
            ...state.walletMonitoring,
            enabled: state.walletMonitoring.address ? enabled : false,
          },
        }))
      },
      setPreference: (key, value) => {
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        }))
      },
    }),
    {
      name: 'sparkfined-user-settings',
      partialize: (state) => ({
        walletMonitoring: state.walletMonitoring,
        preferences: state.preferences,
      }),
    },
  ),
)

export const getWalletMonitoringSettings = (): WalletMonitoringSettings => {
  return useUserSettingsStore.getState().walletMonitoring
}

export const getUserPreferences = (): UserPreferences => {
  return useUserSettingsStore.getState().preferences
}
