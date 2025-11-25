import React, { useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import type { WalletProvider, WalletRole } from '@/types/wallet-tracking';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// ============================================================================
// WALLET CONNECTION SECTION
// ============================================================================

export default function WalletConnectionSection() {
  const { wallets, connectWallet, disconnectWallet, updateWalletLabel } = useWalletStore();
  const [showConnectDialog, setShowConnectDialog] = useState(false);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Connected Wallets</h2>
          <p className="text-xs text-text-secondary">
            Connect up to 2 main wallets + 1 trading wallet for auto-journaling
          </p>
        </div>
        <Button
          onClick={() => setShowConnectDialog(true)}
          variant="outline"
          size="sm"
        >
          + Connect Wallet
        </Button>
      </div>

      {/* Connected Wallets List */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <WalletSlot role="main-1" wallets={wallets} />
        <WalletSlot role="main-2" wallets={wallets} />
        <WalletSlot role="trading" wallets={wallets} />
      </div>

      {/* TODO Codex: Implement WalletConnectDialog */}
      {showConnectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">Connect Wallet</h3>
            <p className="mb-4 text-sm text-text-secondary">
              TODO Codex: Implement Solana Wallet Adapter integration
            </p>
            {/* TODO Codex: Add Solana Wallet Adapter buttons */}
            {/* - Phantom */}
            {/* - Solflare */}
            {/* - Backpack */}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
}

// ============================================================================
// WALLET SLOT (Individual Wallet Card)
// ============================================================================

type WalletSlotProps = {
  role: WalletRole;
  wallets: ReturnType<typeof useWalletStore.getState>['wallets'];
};

function WalletSlot({ role, wallets }: WalletSlotProps) {
  const wallet = wallets.find((w) => w.role === role);
  const { disconnectWallet, updateWalletLabel, toggleWalletActive } = useWalletStore();
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState('');

  const roleLabel = {
    'main-1': 'Main Wallet 1',
    'main-2': 'Main Wallet 2',
    trading: 'Trading Wallet',
  }[role];

  if (!wallet) {
    return (
      <Card className="flex h-28 items-center justify-center border-dashed p-4">
        <div className="text-center">
          <p className="text-xs font-medium text-text-secondary">{roleLabel}</p>
          <p className="mt-1 text-xs text-text-tertiary">Not connected</p>
        </div>
      </Card>
    );
  }

  const handleSaveLabel = () => {
    if (labelDraft.trim()) {
      updateWalletLabel(wallet.address, labelDraft.trim());
    }
    setIsEditingLabel(false);
  };

  return (
    <Card className="relative p-4">
      {/* Active Toggle */}
      <button
        onClick={() => toggleWalletActive(wallet.address)}
        className={`absolute right-2 top-2 h-6 w-6 rounded-full border text-xs font-semibold transition ${
          wallet.isActive
            ? 'border-sentiment-bull bg-sentiment-bull-bg text-sentiment-bull'
            : 'border-border-subtle bg-surface text-text-tertiary'
        }`}
        title={wallet.isActive ? 'Active' : 'Inactive'}
      >
        {wallet.isActive ? '✓' : '○'}
      </button>

      {/* Role Label */}
      <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">{roleLabel}</p>

      {/* Wallet Address */}
      <p className="mt-2 font-mono text-sm text-text-primary">
        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
      </p>

      {/* Wallet Label (Editable) */}
      {isEditingLabel ? (
        <div className="mt-2">
          <input
            type="text"
            value={labelDraft}
            onChange={(e) => setLabelDraft(e.target.value)}
            placeholder="Wallet label"
            className="w-full rounded border border-border bg-surface-elevated px-2 py-1 text-xs text-text-primary"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveLabel();
              if (e.key === 'Escape') setIsEditingLabel(false);
            }}
          />
        </div>
      ) : (
        <button
          onClick={() => {
            setLabelDraft(wallet.label || '');
            setIsEditingLabel(true);
          }}
          className="mt-1 text-xs text-text-secondary hover:text-text-primary"
        >
          {wallet.label || 'Add label'}
        </button>
      )}

      {/* Provider Badge */}
      <p className="mt-2 text-xs text-text-tertiary">
        {wallet.provider} · {new Date(wallet.connectedAt).toLocaleDateString()}
      </p>

      {/* Disconnect Button */}
      <button
        onClick={() => {
          if (confirm(`Disconnect ${wallet.label || wallet.address}?`)) {
            disconnectWallet(wallet.address);
          }
        }}
        className="mt-3 text-xs text-status-armed-text hover:underline"
      >
        Disconnect
      </button>
    </Card>
  );
}
