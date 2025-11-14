import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

// Mock Icons
const WalletIcon = () => <span>👛</span>;
const CheckIcon = () => <span>✓</span>;
const AIIcon = () => <span>🤖</span>;
const BellIcon = () => <span>🔔</span>;
const SyncIcon = () => <span>🔄</span>;

const SettingsPage: React.FC = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [aiProvider, setAiProvider] = useState('auto');

  const walletAddress = '7xKXt...9a8b';
  const accessLevel = 'beta';

  const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }> = ({
    checked,
    onChange,
    disabled = false,
  }) => {
    return (
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${checked ? 'bg-blue-500' : 'bg-neutral-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage your account and preferences</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Account & Access */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Account & Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Wallet Connection */}
            <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  <WalletIcon />
                </div>
                <div>
                  {isWalletConnected ? (
                    <>
                      <p className="text-sm font-medium text-neutral-100">
                        Connected: {walletAddress}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Solana Wallet
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-neutral-100">
                        No wallet connected
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Connect to unlock premium features
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isWalletConnected && (
                  <Badge variant="success">{accessLevel}</Badge>
                )}
                <Button
                  variant={isWalletConnected ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => setIsWalletConnected(!isWalletConnected)}
                >
                  {isWalletConnected ? 'Disconnect' : 'Connect Wallet'}
                </Button>
              </div>
            </div>

            {/* Usage Stats */}
            {isWalletConnected && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-800/30 rounded-lg">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">AI Requests (This Month)</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold font-mono tabular-nums">47</p>
                    <p className="text-xs text-neutral-500 mb-1">/ 100</p>
                  </div>
                  <div className="w-full bg-neutral-700 rounded-full h-1.5 mt-2">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '47%' }}></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Storage Used</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold font-mono tabular-nums">12</p>
                    <p className="text-xs text-neutral-500 mb-1">MB / 50 MB</p>
                  </div>
                  <div className="w-full bg-neutral-700 rounded-full h-1.5 mt-2">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '24%' }}></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>AI Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                AI Provider Selection
              </label>
              <div className="space-y-2">
                {[
                  { value: 'auto', label: 'Auto (Cost-Optimized)', description: 'Uses OpenAI for most tasks, Grok for crypto-specific analysis' },
                  { value: 'openai', label: 'OpenAI', description: 'Cost-efficient for high-volume tasks (~$0.15/1M tokens)' },
                  { value: 'grok', label: 'Grok (xAI)', description: 'Crypto-native reasoning (~$5/1M tokens)' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg border-2 transition-colors cursor-pointer
                      ${
                        aiProvider === option.value
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-neutral-700 hover:border-neutral-600'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="aiProvider"
                      value={option.value}
                      checked={aiProvider === option.value}
                      onChange={(e) => setAiProvider(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-100">{option.label}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-xl">
                  <BellIcon />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-100">
                    Browser Push Notifications
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Receive alerts when price targets are hit
                  </p>
                </div>
              </div>
              <Toggle checked={pushEnabled} onChange={setPushEnabled} />
            </div>
            {pushEnabled && (
              <div className="ml-9 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <CheckIcon /> Notifications enabled
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>App Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Auto Sync */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-xl">
                  <SyncIcon />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-100">
                    Auto-sync when online
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Automatically sync data when internet connection is available
                  </p>
                </div>
              </div>
              <Toggle checked={autoSync} onChange={setAutoSync} />
            </div>

            {autoSync && (
              <div className="ml-9 flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                <p className="text-xs text-neutral-400">
                  Last synced: 2 minutes ago
                </p>
                <Button variant="ghost" size="sm" leftIcon={<SyncIcon />}>
                  Sync Now
                </Button>
              </div>
            )}

            {/* Theme (Future) */}
            <div className="pt-4 border-t border-neutral-800">
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Theme
              </label>
              <div className="flex items-center gap-2">
                <select
                  disabled
                  className="px-3 py-2 bg-zinc-800 border border-neutral-700 rounded-lg text-sm text-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option>Dark</option>
                  <option>Light</option>
                  <option>Auto</option>
                </select>
                <Badge variant="neutral">Coming Q2 2025</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About & Support */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>About & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-400">App Version</p>
              <p className="text-sm font-mono text-neutral-100">0.9.0</p>
            </div>
            <div className="pt-3 border-t border-neutral-800 space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                View Changelog
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Report Issue
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Privacy Policy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card variant="default" className="border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-500">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-100">Clear Cache</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Free up storage by clearing cached data
                </p>
              </div>
              <Button variant="secondary" size="sm">
                Clear Cache
              </Button>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
              <div>
                <p className="text-sm font-medium text-neutral-100">Reset All Settings</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Reset all preferences to default values
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Reset Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SettingsPage;
