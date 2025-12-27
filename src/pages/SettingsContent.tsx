import React from "react";

import { useSettings } from "../state/settings";
import { KEYS, clearCaches, clearNs, pokeServiceWorker, type NamespaceKey } from "../lib/datastore";
import { useTelemetry } from "../state/telemetry";
import { useAISettings } from "../state/ai";
import { useAIContext } from "../state/aiContext";
import { getWalletMonitor, startWalletMonitoring, stopWalletMonitoring } from "../lib/walletMonitor";
import { Telemetry } from "@/lib/TelemetryService";
import {
  getMonitoredWallet,
  getWalletMonitoringEnabled,
  setMonitoredWallet,
  setWalletMonitoringEnabled,
} from "@/lib/wallet/monitoredWallet";
import { isValidSolanaAddress } from "@/lib/wallet/address";
import JournalDataControls from "@/components/settings/JournalDataControls";
import { QuoteCurrencySelect } from "@/components/settings/QuoteCurrencySelect";
import ConnectedWalletsPanel from "@/components/settings/ConnectedWalletsPanel";
import { Settings as SettingsIcon } from "@/lib/icons";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Collapsible } from "@/components/ui/Collapsible";
import { Modal } from "@/components/ui/Modal";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useTheme, type ThemeMode } from "@/lib/theme/useTheme";
import { getPermission, isNotificationsSupported, requestPermission } from "@/api/push";

interface SettingsContentProps {
  showHeading?: boolean;
  wrapperClassName?: string;
}

export default function SettingsContent({
  showHeading = true,
  wrapperClassName = "mx-auto max-w-3xl p-4 pb-20 md:p-6 md:pb-6",
}: SettingsContentProps) {
  const { settings, setSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const { flags, setFlags, buffer, drain } = useTelemetry();
  const { ai, setAI } = useAISettings();
  const resetOnboarding = useOnboardingStore((state) => state.resetOnboarding);

  const [busy, setBusy] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<{
    type: "clear-ns" | "factory-reset";
    label: string;
    action: () => void;
  } | null>(null);
  const [confirmText, setConfirmText] = React.useState("");

  // Wallet monitoring state (single source-of-truth persisted via setMonitoredWallet).
  const [walletAddress, setWalletAddress] = React.useState(() => getMonitoredWallet() ?? "");
  const [monitoringEnabled, setMonitoringEnabled] = React.useState(() => getWalletMonitoringEnabled());
  const [autoGrok, setAutoGrok] = React.useState(() => localStorage.getItem("sparkfined.grok.auto") === "true");
  const [monitorStatus, setMonitorStatus] = React.useState<{
    isRunning: boolean;
    walletAddress: string;
    lastChecked: string;
    seenTransactions: number;
  } | null>(null);
  const notificationsSupported = isNotificationsSupported();
  const [notificationPermission, setNotificationPermission] = React.useState<NotificationPermission>(() =>
    getPermission(),
  );
  const [notificationMessage, setNotificationMessage] = React.useState<string | null>(null);
  const notificationStatusLabel = notificationsSupported
    ? notificationPermission === "granted"
      ? "Enabled"
      : notificationPermission === "denied"
        ? "Blocked"
        : "Not enabled"
    : "Unsupported";

  const trimmedWallet = walletAddress.trim();
  const isWalletValid = trimmedWallet.length === 0 ? true : isValidSolanaAddress(trimmedWallet);

  React.useEffect(() => {
    if (!monitoringEnabled) {
      setMonitorStatus(null);
      return;
    }

    const interval = window.setInterval(() => {
      const monitor = getWalletMonitor();
      setMonitorStatus(monitor ? monitor.getStatus() : null);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [monitoringEnabled]);

  const handleWalletChange = (address: string) => {
    setWalletAddress(address);
    setMonitoredWallet(address);

    if (!monitoringEnabled) return;

    const next = address.trim();
    if (next && isValidSolanaAddress(next)) {
      startWalletMonitoring(next);
    } else {
      stopWalletMonitoring();
    }
  };

  const toggleMonitoring = (enabled: boolean) => {
    setMonitoringEnabled(enabled);
    setWalletMonitoringEnabled(enabled);

    if (!enabled) {
      stopWalletMonitoring();
      return;
    }

    const next = walletAddress.trim();
    if (next && isValidSolanaAddress(next)) {
      startWalletMonitoring(next);
      return;
    }

    stopWalletMonitoring();
  };

  const toggleAutoGrok = (enabled: boolean) => {
    setAutoGrok(enabled);
    localStorage.setItem("sparkfined.grok.auto", enabled ? "true" : "false");
  };

  const handleEnableNotifications = async () => {
    setNotificationMessage(null);
    Telemetry.log("ui.settings.notification_permission_requested", 1, {
      supported: notificationsSupported,
      previousPermission: notificationPermission,
    });
    const nextPermission = await requestPermission();
    setNotificationPermission(nextPermission);

    if (nextPermission === "granted") {
      setNotificationMessage("Browser notifications enabled. We'll use this for alert triggers.");
      return;
    }

    if (nextPermission === "denied") {
      setNotificationMessage("Notifications are blocked. Enable them in your browser settings.");
      return;
    }

    setNotificationMessage("Permission dismissed. You can enable notifications any time.");
  };

  const handleFactoryReset = () => {
    Object.keys(KEYS).forEach((ns) => clearNs(ns as NamespaceKey));
    setConfirmAction(null);
    setConfirmText("");
    setMsg("All app data cleared. Please reload the page.");
    Telemetry.log("ui.settings.factory_reset", 1);
  };

  const handleClearNamespace = (ns: NamespaceKey) => {
    clearNs(ns);
    setConfirmAction(null);
    setConfirmText("");
    setMsg(`${ns} cleared successfully.`);
  };

  React.useEffect(() => {
    setConfirmText("");
  }, [confirmAction?.type, confirmAction?.label]);

  const requiresTypedConfirm = confirmAction?.type === "factory-reset";
  const typedConfirmPhrase = "RESET";
  const typedConfirmMatches = !requiresTypedConfirm || confirmText.trim().toUpperCase() === typedConfirmPhrase;

  return (
    <div className={wrapperClassName}>
      {showHeading ? (
        <div className="flex items-center gap-3" data-testid="settings-page">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-subtle">
            <SettingsIcon className="h-5 w-5 text-text-tertiary" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Settings</h1>
            <p className="text-sm text-text-secondary">Manage your preferences, diagnostics, and backups.</p>
          </div>
        </div>
      ) : null}

      <SettingsSection
        title="Appearance"
        description="Customize how Sparkfined looks and formats currency."
        id="appearance"
        priority
      >
        <SettingsRow label="Theme">
          <SettingsSelect
            value={theme}
            onChange={(e) => {
              const next = e.target.value as ThemeMode;
              setTheme(next);
              Telemetry.log("ui.settings.theme_changed", 1, { theme: next });
            }}
          >
            <option value="system">System</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </SettingsSelect>
        </SettingsRow>
        <QuoteCurrencySelect />
      </SettingsSection>

      <SettingsSection title="Chart Preferences" description="Defaults for snap, replay, and overlays." id="chart">
        <SettingsRow label="Snap to OHLC (default)">
          <SettingsToggle checked={settings.snapDefault} onChange={(v) => setSettings({ snapDefault: v })} />
        </SettingsRow>
        <SettingsRow label="Replay speed (default)">
          <SettingsSelect
            value={settings.replaySpeed}
            onChange={(e) => setSettings({ replaySpeed: Number(e.target.value) as 1 | 2 | 4 | 8 | 10 })}
          >
            {[1, 2, 4, 8, 10].map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </SettingsSelect>
        </SettingsRow>
        <SettingsRow label="Show HUD">
          <SettingsToggle checked={settings.showHud} onChange={(v) => setSettings({ showHud: v })} />
        </SettingsRow>
        <SettingsRow label="Show timeline">
          <SettingsToggle checked={settings.showTimeline} onChange={(v) => setSettings({ showTimeline: v })} />
        </SettingsRow>
        <SettingsRow label="Show mini-map">
          <SettingsToggle checked={settings.showMinimap} onChange={(v) => setSettings({ showMinimap: v })} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Notifications" description="Browser permission status and request flow." id="notifications">
        <p className="mb-3 text-xs text-text-secondary">
          Enable browser notifications for alert triggers. Push delivery is stubbed in this build.
        </p>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-text-primary">Browser notifications</p>
              <p className="text-xs text-text-tertiary">Status: {notificationStatusLabel}</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleEnableNotifications}
              disabled={!notificationsSupported || notificationPermission === "granted"}
            >
              Enable Browser Notifications
            </Button>
          </div>
          {!notificationsSupported ? (
            <p className="text-xs text-text-tertiary">
              Notifications are not supported in this browser.
            </p>
          ) : null}
          {notificationPermission === "denied" ? (
            <p className="text-xs text-rose-400">
              Notifications are blocked. Update your browser settings to re-enable.
            </p>
          ) : null}
          {notificationMessage ? <p className="text-xs text-text-secondary">{notificationMessage}</p> : null}
        </div>
      </SettingsSection>

      <SettingsSection title="Connected Wallets" description="Trading wallets stored locally (Solana)." id="wallets">
        <ConnectedWalletsPanel />
      </SettingsSection>

      <SettingsSection
        title="Wallet Monitoring"
        description="Monitor a wallet for automatic trade detection and journaling hints."
        id="monitoring"
      >
        <p className="mb-3 text-xs text-text-secondary">
          Monitor your wallet for automatic trade detection and journal entry suggestions.
        </p>

        <SettingsRow label="Monitored wallet address">
          <div className="space-y-1">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => handleWalletChange(e.target.value)}
              placeholder="DezXAZ8z7Pnr..."
              className="w-64 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
              data-testid="settings-monitored-wallet"
            />
            {!isWalletValid ? <p className="text-[11px] text-rose-400">Invalid Solana address.</p> : null}
          </div>
        </SettingsRow>

        <SettingsRow label="Enable monitoring">
          <SettingsToggle checked={monitoringEnabled} onChange={toggleMonitoring} />
        </SettingsRow>
        <SettingsRow label="Auto-fetch Grok context">
          <SettingsToggle checked={autoGrok} onChange={toggleAutoGrok} />
        </SettingsRow>

        {monitorStatus && monitorStatus.isRunning ? (
          <div className="mt-3 rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-3 text-xs">
            <p className="font-semibold text-emerald-200">Monitoring active</p>
            <p className="mt-1 text-text-secondary">
              {monitorStatus.walletAddress.slice(0, 8)}...{monitorStatus.walletAddress.slice(-6)} · Last check:{" "}
              {new Date(monitorStatus.lastChecked).toLocaleTimeString()} · Seen: {monitorStatus.seenTransactions}
            </p>
          </div>
        ) : monitoringEnabled ? (
          <div className="mt-3 rounded-lg border border-border bg-surface-subtle p-3 text-xs text-text-secondary">
            Monitoring is enabled but not running (set a valid wallet address).
          </div>
        ) : null}
      </SettingsSection>

      <SettingsSection title="Token Usage" id="tokens">
        <AIStats />
      </SettingsSection>

      <SettingsSection title="Risk & Playbook Defaults" id="risk">
        <p className="mb-3 text-xs text-text-secondary">Set default values for the Analyze/Ideas playbook.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs text-text-tertiary">Default balance</span>
            <input
              className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
              type="number"
              min={100}
              step={50}
              value={settings.defaultBalance ?? 1000}
              onChange={(e) => setSettings({ defaultBalance: Number(e.target.value || 0) })}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-text-tertiary">Default preset</span>
            <SettingsSelect
              value={settings.defaultPlaybookId ?? "bal-15"}
              onChange={(e) => setSettings({ defaultPlaybookId: e.target.value })}
            >
              <option value="cons-1">Conservative · 1% · ATR×1.5</option>
              <option value="bal-15">Balanced · 1.5% · ATR×2</option>
              <option value="agg-2">Aggressive · 2% · ATR×2.5</option>
            </SettingsSelect>
          </label>
        </div>
      </SettingsSection>

      <SettingsSection title="Data Export & Backup" id="data">
        <JournalDataControls />
      </SettingsSection>

      <Collapsible title="Advanced & Diagnostics" defaultOpen={false} variant="card">
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-primary">AI Provider</h4>
            <p className="text-xs text-text-secondary">
              Configure which AI provider to use for journal analysis and insights.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs text-text-tertiary">Provider</span>
                <SettingsSelect
                  value={ai.provider}
                  onChange={(e) => setAI({ provider: e.target.value as "anthropic" | "openai" | "xai" })}
                >
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="openai">OpenAI (GPT)</option>
                  <option value="xai">xAI (Grok)</option>
                </SettingsSelect>
              </label>
              <label className="space-y-1">
                <span className="text-xs text-text-tertiary">Model override (optional)</span>
                <input
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
                  placeholder="e.g., claude-3-opus"
                  value={ai.model || ""}
                  onChange={(e) => setAI({ model: e.target.value || undefined })}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-text-tertiary">Max output tokens</span>
                <input
                  type="number"
                  min={64}
                  max={4000}
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
                  value={ai.maxOutputTokens ?? 800}
                  onChange={(e) => setAI({ maxOutputTokens: Number(e.target.value) })}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-text-tertiary">Max cost per call (USD)</span>
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
                  value={ai.maxCostUsd ?? 0.15}
                  onChange={(e) => setAI({ maxCostUsd: Number(e.target.value) })}
                />
              </label>
            </div>
            <p className="text-[11px] text-text-tertiary">
              API keys are stored server-side. Only provider/model preferences are sent with requests.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-primary">Telemetry</h4>
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={flags.enabled} onChange={(e) => setFlags({ enabled: e.target.checked })} />
                Enabled
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={flags.includeNetwork}
                  onChange={(e) => setFlags({ includeNetwork: e.target.checked })}
                />
                API timings
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={flags.includeCanvas}
                  onChange={(e) => setFlags({ includeCanvas: e.target.checked })}
                />
                Canvas/FPS
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={flags.includeUser} onChange={(e) => setFlags({ includeUser: e.target.checked })} />
                User events
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={flags.tokenOverlay}
                  onChange={(e) => setFlags({ tokenOverlay: e.target.checked })}
                />
                Token overlay
              </label>
              <label className="inline-flex items-center gap-2">
                Sampling
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.05}
                  value={flags.sampling}
                  onChange={(e) => setFlags({ sampling: Number(e.target.value) })}
                  className="w-16 rounded border border-border bg-surface-elevated px-2 py-1 text-xs"
                />
              </label>
            </div>
            <Button variant="ghost" size="sm" onClick={drain}>
              Send now ({buffer.length} queued)
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-primary">PWA Controls</h4>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  setBusy("Checking for updates…");
                  const res = await pokeServiceWorker();
                  setBusy(null);
                  setMsg(
                    res === "no-sw"
                      ? "No service worker found"
                      : res === "message-sent"
                        ? "Update triggered (SKIP_WAITING)"
                        : "Update initiated",
                  );
                }}
              >
                Check for updates
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  setBusy("Clearing caches…");
                  const removed = await clearCaches();
                  setBusy(null);
                  setMsg(`Caches cleared: ${removed.length}`);
                }}
              >
                Clear caches
              </Button>
            </div>
            <div className="rounded-lg border border-border bg-surface-subtle p-3 text-xs text-text-secondary">
              <p className="mb-1 font-medium text-text-primary">App Info</p>
              <p>Version: {import.meta.env.VITE_APP_VERSION ?? "dev"}</p>
              <p>Build: {import.meta.env.MODE}</p>
              <p>
                VAPID:{" "}
                <span className={import.meta.env.VITE_VAPID_PUBLIC_KEY ? "text-emerald-400" : "text-rose-400"}>
                  {import.meta.env.VITE_VAPID_PUBLIC_KEY ? "configured" : "missing"}
                </span>
              </p>
            </div>
            {busy && <p className="text-xs text-text-secondary">{busy}</p>}
            {msg && <p className="text-xs text-emerald-400">{msg}</p>}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-primary">Onboarding</h4>
            <Button variant="outline" size="sm" onClick={resetOnboarding} data-testid="reset-onboarding">
              Reset onboarding
            </Button>
          </div>
        </div>
      </Collapsible>

      <SettingsSection title="Danger Zone" description="Destructive actions that cannot be undone." id="danger" variant="danger">
        <p className="mb-3 text-xs text-text-secondary">These actions are destructive and cannot be undone.</p>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          {Object.entries(KEYS).map(([ns]) => (
            <Button
              key={ns}
              variant="destructive"
              size="sm"
              onClick={() =>
                setConfirmAction({
                  type: "clear-ns",
                  label: `Clear ${ns}`,
                  action: () => handleClearNamespace(ns as NamespaceKey),
                })
              }
            >
              Clear {ns}
            </Button>
          ))}
        </div>
        <div className="mt-4">
          <Button
            variant="destructive"
            onClick={() =>
              setConfirmAction({
                type: "factory-reset",
                label: "Factory reset",
                action: handleFactoryReset,
              })
            }
          >
            Factory reset
          </Button>
        </div>
      </SettingsSection>

      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={`Confirm: ${confirmAction?.label}`}
        subtitle="This action cannot be undone."
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            {confirmAction?.type === "factory-reset"
              ? "This will delete all app data including journal entries, alerts, and preferences."
              : `This will clear the ${confirmAction?.label.replace("Clear ", "")} data.`}
          </p>
          {requiresTypedConfirm ? (
            <div className="space-y-2">
              <p className="text-xs text-text-secondary">
                Type <span className="font-semibold text-text-primary">{typedConfirmPhrase}</span> to enable the reset button.
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
                placeholder={typedConfirmPhrase}
                autoComplete="off"
              />
            </div>
          ) : null}
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => confirmAction?.action()}
              disabled={!typedConfirmMatches}
            >
              {confirmAction?.label}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  id,
  variant,
  priority,
  children,
}: {
  title: string;
  description?: string;
  id: string;
  variant?: "danger";
  priority?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card
      variant={variant === "danger" ? "bordered" : "default"}
      className={[
        priority ? "ring-1 ring-brand/20" : "",
        variant === "danger" ? "border-rose-400/40" : "",
      ].join(" ")}
      id={id}
    >
      <CardHeader className="pb-3">
        <div className="space-y-1">
          <CardTitle className={`text-base ${variant === "danger" ? "text-rose-400" : ""}`}>{title}</CardTitle>
          {description ? <p className="text-xs text-text-secondary">{description}</p> : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 py-3 last:border-b-0">
      <span className="text-sm text-text-primary">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function SettingsSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
    />
  );
}

function SettingsToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
        checked
          ? "border border-brand bg-brand/10 text-brand"
          : "border border-border text-text-secondary hover:bg-interactive-hover"
      }`}
    >
      {checked ? "ON" : "OFF"}
    </button>
  );
}

function AIStats() {
  const ctx = useAIContext();
  const pct = ctx.tokenBudget > 0 ? (ctx.tokenUsed / ctx.tokenBudget) * 100 : 0;
  const progressColor = pct > 90 ? "bg-rose-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">
          {ctx.tokenUsed.toLocaleString()} / {ctx.tokenBudget.toLocaleString()} tokens
        </span>
        <span className="text-text-tertiary">{pct.toFixed(1)}%</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
        <div className={`h-full transition-all duration-300 ${progressColor}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      {ctx.activeIdeaId ? <p className="text-xs text-text-tertiary">Active context: {ctx.activeIdeaId.slice(0, 8)}...</p> : null}
      <Button variant="ghost" size="sm" onClick={() => ctx.reset()}>
        Reset counter
      </Button>
    </div>
  );
}
