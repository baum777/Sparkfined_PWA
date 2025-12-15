import { beforeEach, describe, expect, it } from 'vitest';
import { useWalletStore, DEFAULT_SETTINGS } from '@/store/walletStore';
import { WELL_KNOWN_ADDRESSES } from '@/lib/validation/address';

describe('walletStore', () => {
  const address = WELL_KNOWN_ADDRESSES.SOL;

  beforeEach(() => {
    useWalletStore.persist?.clearStorage?.();
    useWalletStore.setState({
      wallets: [],
      settings: { ...DEFAULT_SETTINGS, wallets: [...DEFAULT_SETTINGS.wallets] },
    });
  });

  it('normalizes addresses before storing them', () => {
    useWalletStore
      .getState()
      .connectWallet(`  ${address}\n`, 'manual', 'trading', 'Test Wallet');

    const storedWallets = useWalletStore.getState().wallets;
    expect(storedWallets).toHaveLength(1);
    const stored = storedWallets[0];
    expect(stored?.address).toBe(address);
    expect(useWalletStore.getState().isWalletConnected(`\t${address}  `)).toBe(true);
  });

  it('prevents duplicate wallets after normalization', () => {
    useWalletStore.getState().connectWallet(address, 'manual', 'trading');

    expect(() =>
      useWalletStore
        .getState()
        .connectWallet(` ${address} `, 'manual', 'trading', 'Duplicate')
    ).toThrow('Wallet already connected');
  });

  it('rejects invalid Solana addresses', () => {
    expect(() =>
      useWalletStore
        .getState()
        .connectWallet('0xdeadbeef', 'manual', 'trading')
    ).toThrow('Invalid Solana address');

    expect(() =>
      useWalletStore
        .getState()
        .connectWallet('IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII', 'manual', 'trading')
    ).toThrow('Invalid Solana address');
  });

  it('removes wallets using normalized addresses', () => {
    useWalletStore.getState().connectWallet(address, 'manual', 'trading');
    useWalletStore.getState().disconnectWallet(`  ${address}\t`);

    expect(useWalletStore.getState().wallets).toHaveLength(0);
  });
});
