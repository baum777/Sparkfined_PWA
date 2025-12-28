import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ConnectedWallet,
  WalletProvider,
  WalletRole,
  WalletSettings,
} from '@/types/wallet-tracking';
import { normalizeSolanaAddress, validateSolanaAddress } from '@/lib/validation/address';

interface WalletState {
  // Wallet Management
  wallets: ConnectedWallet[];
  settings: WalletSettings;

  // Actions
  connectWallet: (address: string, provider: WalletProvider, role: WalletRole, label?: string) => void;
  disconnectWallet: (address: string) => void;
  updateWalletLabel: (address: string, label: string) => void;
  toggleWalletActive: (address: string) => void;
  updateWalletSyncTime: (address: string) => void;

  // Settings
  updateSettings: (settings: Partial<WalletSettings>) => void;
  addExcludedToken: (tokenAddress: string) => void;
  removeExcludedToken: (tokenAddress: string) => void;

  // Getters
  getActiveWallets: () => ConnectedWallet[];
  getWalletByRole: (role: WalletRole) => ConnectedWallet | undefined;
  isWalletConnected: (address: string) => boolean;
}

export const DEFAULT_SETTINGS: WalletSettings = {
  wallets: [],
  autoJournalEnabled: true,
  minTradeSize: 10,              // Minimum $10 USD to auto-journal
  excludedTokens: [],
  autoSnapshotEnabled: true,
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallets: [],
      settings: DEFAULT_SETTINGS,

      connectWallet: (address, provider, role, label) => {
        set((state) => {
          const normalizedAddress = normalizeSolanaAddress(address);

          if (!validateSolanaAddress(normalizedAddress)) {
            throw new Error('Invalid Solana address');
          }

          // Check if wallet already exists
          const existingIndex = state.wallets.findIndex(
            (w) => normalizeSolanaAddress(w.address) === normalizedAddress
          );

          const newWallet: ConnectedWallet = {
            address: normalizedAddress,
            provider,
            role,
            label: label || `${provider} (${role})`,
            connectedAt: Date.now(),
            isActive: true,
          };

          if (existingIndex >= 0) {
            throw new Error('Wallet already connected');
          }

          // Check wallet limit by role
          const walletsWithRole = state.wallets.filter((w) => w.role === role);

          if (role === 'main-1' || role === 'main-2') {
            if (walletsWithRole.length > 0) {
              console.warn(`[WalletStore] Already have a ${role} wallet, replacing...`);
              const filtered = state.wallets.filter((w) => w.role !== role);
              return { wallets: [...filtered, newWallet] };
            }
          }

          if (role === 'trading') {
            if (walletsWithRole.length > 0) {
              console.warn(`[WalletStore] Already have a trading wallet, replacing...`);
              const filtered = state.wallets.filter((w) => w.role !== 'trading');
              return { wallets: [...filtered, newWallet] };
            }
          }

          return { wallets: [...state.wallets, newWallet] };
        });
      },

      disconnectWallet: (address) => {
        const normalizedAddress = normalizeSolanaAddress(address);
        set((state) => ({
          wallets: state.wallets.filter(
            (w) => normalizeSolanaAddress(w.address) !== normalizedAddress
          ),
        }));
      },

      updateWalletLabel: (address, label) => {
        const normalizedAddress = normalizeSolanaAddress(address);
        set((state) => ({
          wallets: state.wallets.map((w) =>
            normalizeSolanaAddress(w.address) === normalizedAddress
              ? { ...w, label }
              : w
          ),
        }));
      },

      toggleWalletActive: (address) => {
        const normalizedAddress = normalizeSolanaAddress(address);
        set((state) => ({
          wallets: state.wallets.map((w) =>
            normalizeSolanaAddress(w.address) === normalizedAddress
              ? { ...w, isActive: !w.isActive }
              : w
          ),
        }));
      },

      updateWalletSyncTime: (address) => {
        const normalizedAddress = normalizeSolanaAddress(address);
        set((state) => ({
          wallets: state.wallets.map((w) =>
            normalizeSolanaAddress(w.address) === normalizedAddress
              ? { ...w, lastSyncedAt: Date.now() }
              : w
          ),
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      addExcludedToken: (tokenAddress) => {
        set((state) => {
          if (state.settings.excludedTokens.includes(tokenAddress)) {
            return state;
          }
          return {
            settings: {
              ...state.settings,
              excludedTokens: [...state.settings.excludedTokens, tokenAddress],
            },
          };
        });
      },

      removeExcludedToken: (tokenAddress) => {
        set((state) => ({
          settings: {
            ...state.settings,
            excludedTokens: state.settings.excludedTokens.filter((t) => t !== tokenAddress),
          },
        }));
      },

      getActiveWallets: () => {
        return get().wallets.filter((w) => w.isActive);
      },

      getWalletByRole: (role) => {
        return get().wallets.find((w) => w.role === role);
      },

      isWalletConnected: (address) => {
        const normalizedAddress = normalizeSolanaAddress(address);
        return get().wallets.some(
          (w) => normalizeSolanaAddress(w.address) === normalizedAddress
        );
      },
    }),
    {
      name: 'sparkfined-wallet-store',
      partialize: (state) => ({
        wallets: state.wallets,
        settings: state.settings,
      }),
    }
  )
);

/**
 * Helper: Get all wallet addresses (active only)
 */
export function getActiveWalletAddresses(): string[] {
  const { wallets } = useWalletStore.getState();
  return wallets.filter((w) => w.isActive).map((w) => w.address);
}

/**
 * Helper: Check if any wallet is connected
 */
export function hasConnectedWallets(): boolean {
  const { wallets } = useWalletStore.getState();
  return wallets.length > 0;
}

/**
 * Helper: Get wallet count by role
 */
export function getWalletCountByRole(role: WalletRole): number {
  const { wallets } = useWalletStore.getState();
  return wallets.filter((w) => w.role === role).length;
}
