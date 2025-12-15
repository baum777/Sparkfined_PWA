import React from 'react'
import Button from '@/components/ui/Button'
import {
  addConnectedWallet,
  getConnectedWallets,
  removeConnectedWallet,
  type ConnectedWalletRecord,
} from '@/lib/solana/store/connectedWallets'

function truncateMiddle(value: string, left = 6, right = 6) {
  if (value.length <= left + right + 3) return value
  return `${value.slice(0, left)}...${value.slice(-right)}`
}

export default function ConnectedWalletsPanel() {
  const [wallets, setWallets] = React.useState<ConnectedWalletRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)
  const [address, setAddress] = React.useState('')
  const [nickname, setNickname] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  const refresh = React.useCallback(async () => {
    setLoading(true)
    const records = await getConnectedWallets()
    setWallets(records)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    refresh().catch((err) => {
      console.error('Failed to load connected wallets', err)
      setError('Could not load connected wallets')
      setLoading(false)
    })
  }, [refresh])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      setSaving(true)
      await addConnectedWallet({ address, nickname })
      setAddress('')
      setNickname('')
      setFormOpen(false)
      await refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save wallet'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(id?: number) {
    if (!id) return
    try {
      await removeConnectedWallet(id)
      await refresh()
    } catch (err) {
      console.error('Failed to remove wallet', err)
      setError('Unable to remove wallet')
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface/80 p-4 shadow-card-subtle" data-testid="connected-wallets-panel">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-text-primary">Connected Wallets</div>
          <div className="text-xs text-text-secondary">Solana-only trading wallets stored locally.</div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFormOpen((open) => !open)}
          data-testid="add-trading-wallet"
        >
          {formOpen ? 'Cancel' : '+ Add Trading Wallet'}
        </Button>
      </div>

      {formOpen ? (
        <form className="mt-4 space-y-3" onSubmit={handleSave} data-testid="trading-wallet-form">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-primary" htmlFor="wallet-address">
              Wallet Address
            </label>
            <input
              id="wallet-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Base58 Solana address"
              className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary shadow-card-subtle focus:outline-none focus:ring-2 focus:ring-brand/40"
              required
              data-testid="wallet-address-input"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-primary" htmlFor="wallet-nickname">
              Nickname (optional)
            </label>
            <input
              id="wallet-nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., Main trading wallet"
              className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary shadow-card-subtle focus:outline-none focus:ring-2 focus:ring-brand/40"
              data-testid="wallet-nickname-input"
            />
          </div>
          {error ? <div className="text-xs text-danger" data-testid="wallet-error">{error}</div> : null}
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={saving} data-testid="save-wallet">
              {saving ? 'Saving…' : 'Save' }
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setFormOpen(false)
                setAddress('')
                setNickname('')
                setError(null)
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="text-xs text-text-secondary">Loading wallets…</div>
        ) : wallets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface-subtle p-3 text-xs text-text-secondary" data-testid="wallet-empty-state">
            No connected wallets yet. Add a Solana trading wallet to enable on-chain journaling.
          </div>
        ) : (
          wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-elevated p-3 shadow-card-subtle"
              data-testid="connected-wallet-card"
            >
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-text-primary">{wallet.nickname}</div>
                <div className="text-xs text-text-secondary" title={wallet.address}>
                  {truncateMiddle(wallet.address)}
                </div>
                <div className="text-[11px] font-medium uppercase text-brand">{wallet.chain}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(wallet.id)}
                data-testid="remove-wallet"
              >
                Remove
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
