import React, { useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

// ============================================================================
// WALLET SETTINGS PANEL
// ============================================================================

export default function WalletSettingsPanel() {
  const { settings, updateSettings, addExcludedToken, removeExcludedToken } = useWalletStore();
  const [newTokenAddress, setNewTokenAddress] = useState('');

  const handleMinTradeSizeChange = (value: number) => {
    updateSettings({ minTradeSize: Math.max(1, value) });
  };

  const handleAddExcludedToken = () => {
    const trimmed = newTokenAddress.trim();
    if (trimmed && !settings.excludedTokens.includes(trimmed)) {
      addExcludedToken(trimmed);
      setNewTokenAddress('');
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-text-primary">Auto-Journal Settings</h2>
        <p className="text-xs text-text-secondary">
          Configure automatic journal entry creation from wallet transactions
        </p>
      </div>

      <Card className="space-y-4 p-4">
        {/* ========== AUTO-JOURNAL ENABLED ========== */}
        <SettingRow
          label="Auto-Journal Enabled"
          description="Automatically create journal entries from detected trades"
        >
          <Toggle
            checked={settings.autoJournalEnabled}
            onChange={(value) => updateSettings({ autoJournalEnabled: value })}
          />
        </SettingRow>

        {/* ========== MIN TRADE SIZE ========== */}
        <SettingRow
          label="Minimum Trade Size"
          description="Filter out trades below this USD value (dust filter)"
        >
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={settings.minTradeSize}
              onChange={(e) => handleMinTradeSizeChange(Number(e.target.value))}
              min={1}
              max={10000}
              step={10}
              className="w-24"
            />
            <span className="text-sm text-text-secondary">USD</span>
          </div>
        </SettingRow>

        {/* ========== AUTO SNAPSHOT ========== */}
        <SettingRow
          label="Auto-Capture Chart Screenshot"
          description="Automatically capture chart snapshot when creating journal entry"
        >
          <Toggle
            checked={settings.autoSnapshotEnabled}
            onChange={(value) => updateSettings({ autoSnapshotEnabled: value })}
          />
        </SettingRow>

        {/* ========== EXCLUDED TOKENS ========== */}
        <div className="border-t border-border-subtle pt-4">
          <label className="block text-sm font-medium text-text-primary">
            Excluded Tokens
          </label>
          <p className="mt-1 text-xs text-text-secondary">
            Token addresses to exclude from auto-journaling
          </p>

          {/* Token List */}
          {settings.excludedTokens.length > 0 && (
            <div className="mt-2 space-y-1">
              {settings.excludedTokens.map((token) => (
                <div
                  key={token}
                  className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2"
                >
                  <span className="font-mono text-xs text-text-primary">
                    {token.slice(0, 8)}...{token.slice(-6)}
                  </span>
                  <button
                    onClick={() => removeExcludedToken(token)}
                    className="text-xs text-status-armed-text hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Token Input */}
          <div className="mt-3 flex gap-2">
            <Input
              type="text"
              value={newTokenAddress}
              onChange={(e) => setNewTokenAddress(e.target.value)}
              placeholder="Token address (e.g., So11...)"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddExcludedToken();
                }
              }}
            />
            <button
              onClick={handleAddExcludedToken}
              disabled={!newTokenAddress.trim()}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text-primary transition hover:bg-surface-hover disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      </Card>
    </section>
  );
}

// ============================================================================
// SETTING ROW (Label + Control)
// ============================================================================

type SettingRowProps = {
  label: string;
  description?: string;
  children: React.ReactNode;
};

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border-subtle pb-4 last:border-0 last:pb-0">
      <div className="flex-1">
        <label className="block text-sm font-medium text-text-primary">{label}</label>
        {description && <p className="mt-0.5 text-xs text-text-secondary">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ============================================================================
// TOGGLE COMPONENT
// ============================================================================

type ToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
        checked
          ? 'bg-sentiment-bull'
          : 'bg-border'
      } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
