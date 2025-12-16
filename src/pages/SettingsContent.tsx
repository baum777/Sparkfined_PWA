import React from "react";
import { useSettings } from "../state/settings";
import { KEYS, clearNs, clearCaches, pokeServiceWorker, type NamespaceKey } from "../lib/datastore";
import { useTelemetry } from "../state/telemetry";
import { useAISettings } from "../state/ai";
import { useAIContext } from "../state/aiContext";
import {
  getWalletMonitor,
  startWalletMonitoring,
  stopWalletMonitoring,
} from "../lib/walletMonitor";
import {
  getMonitoredWallet,
  getWalletMonitoringEnabled,
  setMonitoredWallet,
  setWalletMonitoringEnabled,
} from "@/lib/wallet/monitoredWallet";
import JournalDataControls from "@/components/settings/JournalDataControls";
import { QuoteCurrencySelect } from "@/components/settings/QuoteCurrencySelect";
import ConnectedWalletsPanel from "@/components/settings/ConnectedWalletsPanel";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Collapsible } from "@/components/ui/Collapsible";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useTheme, type ThemeMode } from "@/lib/theme/useTheme";

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
  const [confirmAction, setConfirmAction] = React.useState<{ type: string; label: string; action: () => void } | null>(null);

  // Wallet monitoring state
  const [walletAddress, setWalletAddress] = React.useState(() => {
    return getMonitoredWallet() ?? "";
  });
  const [monitoringEnabled, setMonitoringEnabled] = React.useState(() => {
    return getWalletMonitoringEnabled();
  });
  const [autoGrok, setAutoGrok] = React.useState(() => {
    return localStorage.getItem("sparkfined.grok.auto") === "true";
  });
  const [monitorStatus, setMonitorStatus] = React.useState<{
    isRunning: boolean;
    walletAddress: string;
    lastChecked: string;
    seenTransactions: number;
  } | null>(null);

  // Update monitor status periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      const monitor = getWalletMonitor();
      if (monitor) {
        setMonitorStatus(monitor.getStatus());
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleWalletChange = (address: string) => {
    setWalletAddress(address);
    setMonitoredWallet(address);
  };

  const toggleMonitoring = (enabled: boolean) => {
    setMonitoringEnabled(enabled);
    setWalletMonitoringEnabled(enabled);

    const monitoredWallet = getMonitoredWallet();

    if (enabled && monitoredWallet) {
      startWalletMonitoring(monitoredWallet);
    localStorage.setItem('sparkfined.wallet.monitoring', enabled ? 'true' : 'false');
    if (enabled && walletAddress) {
      startWalletMonitoring(walletAddress);
    } else {
      stopWalletMonitoring();
    }
  };

  const toggleAutoGrok = (enabled: boolean) => {
    setAutoGrok(enabled);
    localStorage.setItem("sparkfined.grok.auto", enabled ? "true" : "false");
  };

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-3 last:border-b-0">
      <div className="text-sm font-medium text-text-primary">{label}</div>
      <div>{children}</div>
    </div>
  );
  const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select
      {...p}
      className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary shadow-card-subtle transition focus:outline-none focus:ring-2 focus:ring-brand/40"
    />
  );
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${checked ? "border border-brand bg-brand/10 text-brand shadow-glow-accent" : "border border-border text-text-primary hover:bg-interactive-hover"}`}
    >
      {checked ? "ON" : "OFF"}
    </button>
  );

  return (
    <div className={wrapperClassName}>
      {showHeading ? (
        <h1 className="mb-4 text-lg font-semibold text-text-primary md:text-xl">Einstellungen</h1>
      ) : null}
      <div className="rounded-2xl border border-border bg-surface/80 p-4 shadow-card-subtle">
        <Row label="Theme">
          <Select value={theme} onChange={(e) => setTheme(e.target.value as ThemeMode)}>
  const handleFactoryReset = () => {
    Object.keys(KEYS).forEach(ns => clearNs(ns as NamespaceKey));
    setConfirmAction(null);
    alert("All app data cleared. Please reload the page.");
  };

  const handleClearNamespace = (ns: NamespaceKey) => {
    clearNs(ns);
    setConfirmAction(null);
    setMsg(`${ns} cleared successfully.`);
  };

  return (
    <div className={wrapperClassName}>
      {showHeading && (
        <h1 className="mb-6 text-xl font-semibold text-text-primary">Settings</h1>
      )}

      {/* Appearance */}
      <SettingsSection title="Appearance" id="appearance">
        <SettingsRow label="Theme">
          <SettingsSelect value={theme} onChange={(e) => setTheme(e.target.value as ThemeMode)}>
            <option value="system">System</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </SettingsSelect>
        </SettingsRow>
        <QuoteCurrencySelect />
      </SettingsSection>

      <div className="mt-4 rounded-2xl border border-border bg-surface/80 p-4 shadow-card-subtle">
        <Row label="Snap-to-OHLC (Default)">
          <Toggle
            checked={settings.snapDefault}
            onChange={(v) => setSettings({ snapDefault: v })}
          />
        </Row>
        <Row label="Replay Speed (Default)">
          <Select
            value={settings.replaySpeed}
            onChange={(e) => setSettings({ replaySpeed: Number(e.target.value) as any })}
          >
            {[1, 2, 4, 8, 10].map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </Select>
        </Row>
        <Row label="HUD anzeigen">
          <Toggle checked={settings.showHud} onChange={(v) => setSettings({ showHud: v })} />
        </Row>
        <Row label="Timeline anzeigen">
          <Toggle
            checked={settings.showTimeline}
            onChange={(v) => setSettings({ showTimeline: v })}
          />
        </Row>
        <Row label="Mini-Map anzeigen">
          <Toggle
            checked={settings.showMinimap}
            onChange={(v) => setSettings({ showMinimap: v })}
          />
        </Row>
      </div>
      <div className="mt-4 text-xs text-text-tertiary">
        Gespeichert unter <code>sparkfined.settings.v1</code>. Änderungen wirken sofort.
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={resetOnboarding} data-testid="reset-onboarding">
          Reset Onboarding
        </Button>
      </div>
      {/* Chart preferences */}
      <SettingsSection title="Chart Preferences" id="chart">
        <SettingsRow label="Snap to OHLC (default)">
          <SettingsToggle checked={settings.snapDefault} onChange={(v) => setSettings({ snapDefault: v })} />
        </SettingsRow>
        <SettingsRow label="Replay speed (default)">
          <SettingsSelect value={settings.replaySpeed} onChange={(e) => setSettings({ replaySpeed: Number(e.target.value) as 1 | 2 | 4 | 8 | 10 })}>
            {[1, 2, 4, 8, 10].map(s => <option key={s} value={s}>{s}x</option>)}
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

      {/* Wallets */}
      <SettingsSection title="Connected Wallets" id="wallets">
        <ConnectedWalletsPanel />
      </SettingsSection>

      {/* BLOCK 2: Wallet Monitoring */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-text-primary">
        Wallet-Monitoring (Auto-Journal)
      </h2>
      <div className="rounded-2xl border border-border bg-surface/80 p-4 shadow-card-subtle">
        <Row label="Wallet-Adresse">
      {/* Wallet Monitoring */}
      <SettingsSection title="Wallet Monitoring" id="monitoring">
        <p className="mb-3 text-xs text-text-secondary">
          Monitor your wallet for automatic trade detection and journal entry suggestions.
        </p>
        <SettingsRow label="Wallet address">
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => handleWalletChange(e.target.value)}
            placeholder="DezXAZ8z7Pnr..."
            className="w-64 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary shadow-card-subtle focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </Row>
        <Row label="Wallet-Monitoring aktiv">
          <Toggle checked={monitoringEnabled} onChange={toggleMonitoring} />
        </Row>
        <Row label="Auto-Fetch Grok Context">
          <Toggle checked={autoGrok} onChange={toggleAutoGrok} />
        </Row>

        {/* Status display */}
        {monitorStatus && monitorStatus.isRunning && (
          <div className="mt-3 rounded-xl border border-success/60 bg-success/10 p-3 text-xs text-success">
            <div className="mb-1 font-semibold">✅ Monitoring aktiv</div>
            <div className="text-text-secondary">
              <div>
                Wallet: {monitorStatus.walletAddress.slice(0, 8)}...
                {monitorStatus.walletAddress.slice(-6)}
              </div>
              <div>Letzter Check: {new Date(monitorStatus.lastChecked).toLocaleTimeString()}</div>
              <div>Transaktionen gesehen: {monitorStatus.seenTransactions}</div>
            </div>
            className="w-48 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </SettingsRow>
        <SettingsRow label="Enable monitoring">
          <SettingsToggle checked={monitoringEnabled} onChange={toggleMonitoring} />
        </SettingsRow>
        <SettingsRow label="Auto-fetch Grok context">
          <SettingsToggle checked={autoGrok} onChange={toggleAutoGrok} />
        </SettingsRow>
        {monitorStatus && monitorStatus.isRunning && (
          <div className="mt-3 rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-3 text-xs text-emerald-100">
            <p className="font-semibold">✓ Monitoring active</p>
            <p className="mt-1 text-text-secondary">
              {monitorStatus.walletAddress.slice(0, 8)}...{monitorStatus.walletAddress.slice(-6)} ·{" "}
              Last check: {new Date(monitorStatus.lastChecked).toLocaleTimeString()} ·{" "}
              Seen: {monitorStatus.seenTransactions}
            </p>
          </div>
        )}
      </SettingsSection>

        {walletAddress && !monitoringEnabled && (
          <div className="mt-3 rounded-xl border border-border bg-surface-subtle p-3 text-xs text-text-secondary">
            ⏸️ Monitoring pausiert. Aktiviere oben, um Auto-Journal zu starten.
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-text-tertiary">
        <strong>Info:</strong> Wallet-Monitoring erkennt automatisch Buy-Transaktionen und erstellt
        temporäre Journal-Einträge. Du hast 7 Tage Zeit, um sie als "aktiv" zu markieren.
      </div>

      {/* Data Export / Import */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-text-primary">
        Data Export &amp; Backup
      </h2>
      <JournalDataControls />

      {/* Danger Zone */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-text-primary">Danger Zone</h2>
      <div className="rounded-2xl border border-danger/60 bg-danger/5 p-4 shadow-card-subtle">
        <div className="text-xs text-danger">Gezieltes Löschen</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs md:grid-cols-3">
          {Object.entries(KEYS).map(([ns, _key]) => (
            <button
              key={ns}
              className="rounded border border-danger/60 px-2 py-1 font-semibold text-danger transition hover:bg-danger/10"
              onClick={() => {
                if (confirm(`Lösche ${ns}?`)) {
                  clearNs(ns as NamespaceKey);
                  alert(`${ns} gelöscht.`);
                }
              }}
            >
              Clear {ns}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <button
            className="rounded border border-danger/60 px-3 py-2 text-sm font-semibold text-danger transition hover:bg-danger/10"
            onClick={() => {
              if (!confirm("Factory Reset? Alle sparkfined.* Daten werden gelöscht!")) return;
              Object.keys(KEYS).forEach((ns) => clearNs(ns as NamespaceKey));
              alert("Alle App-Daten gelöscht. Bitte Seite neu laden.");
            }}
          >
            Factory Reset
          </button>
        </div>
      </div>

      {/* AI */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-text-primary">AI</h2>
      <div className="rounded-2xl border border-border bg-surface/80 p-4 text-xs text-text-primary shadow-card-subtle">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <label className="inline-flex items-center gap-2">
            Provider
            <select
              className="rounded-xl border border-border bg-surface-elevated px-2 py-1 text-xs text-text-primary shadow-card-subtle"
              value={ai.provider}
              onChange={(e) => setAI({ provider: e.target.value as any })}
            >
              <option value="anthropic">Anthropic</option>
              <option value="openai">OpenAI</option>
              <option value="xai">xAI</option>
            </select>
          </label>
          <label className="inline-flex items-center gap-2">
            Model
            <input
              className="w-48 rounded-xl border border-border bg-surface-elevated px-2 py-1 text-xs text-text-primary shadow-card-subtle"
              placeholder="(optional override)"
      {/* AI Configuration */}
      <SettingsSection title="AI Provider" id="ai">
        <p className="mb-3 text-xs text-text-secondary">
          Configure which AI provider to use for journal analysis and insights.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs text-text-tertiary">Provider</span>
            <SettingsSelect value={ai.provider} onChange={(e) => setAI({ provider: e.target.value as 'anthropic' | 'openai' | 'xai' })}>
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
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
          <label className="inline-flex items-center gap-2">
            maxOutputTokens
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs text-text-tertiary">Max output tokens</span>
            <input
              type="number"
              min={64}
              max={4000}
              className="w-28 rounded-xl border border-border bg-surface-elevated px-2 py-1 text-xs text-text-primary shadow-card-subtle"
              className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
              value={ai.maxOutputTokens ?? 800}
              onChange={(e) => setAI({ maxOutputTokens: Number(e.target.value) })}
            />
          </label>
          <label className="inline-flex items-center gap-2">
            maxCostUsd / Call
          <label className="space-y-1">
            <span className="text-xs text-text-tertiary">Max cost per call (USD)</span>
            <input
              type="number"
              min={0.01}
              step={0.01}
              className="w-28 rounded-xl border border-border bg-surface-elevated px-2 py-1 text-xs text-text-primary shadow-card-subtle"
              className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
              value={ai.maxCostUsd ?? 0.15}
              onChange={(e) => setAI({ maxCostUsd: Number(e.target.value) })}
            />
          </label>
        </div>
        <div className="mt-1 text-[11px] text-text-tertiary">
          Server setzt zusätzlich eine globale Obergrenze via <code>AI_MAX_COST_USD</code>.
        </div>
        <div className="mt-2 text-[11px] text-text-tertiary">
          Keys bleiben serverseitig (.env). Der Client sendet nur Provider/Model + Prompt.
        </div>
      </div>

      {/* Token Budget */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-text-primary">AI Token Budget</h2>
      <div className="rounded-2xl border border-border bg-surface/80 p-4 text-xs text-text-primary shadow-card-subtle">
        <AIStats />
      </div>

      {/* Risk & Playbook Defaults */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-text-primary">
        Risk & Playbook Defaults
      </h2>
      <div className="rounded-2xl border border-border bg-surface/80 p-4 text-xs text-text-primary shadow-card-subtle">
        <div className="mb-2 text-[12px] text-text-secondary">
          Setze Standard-Balance und Preset, die im Analyze/Ideas-Playbook vorgefüllt werden.
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          <label className="flex items-center gap-2">
            Default-Balance
            <input
              className="rounded-xl border border-border bg-surface-elevated px-2 py-1 text-xs text-text-primary shadow-card-subtle"
        <p className="mt-2 text-[11px] text-text-tertiary">
          API keys are stored server-side. Only provider and model preferences are sent with requests.
        </p>
      </SettingsSection>

      {/* AI Token Budget */}
      <SettingsSection title="Token Usage" id="tokens">
        <AIStats />
      </SettingsSection>

      {/* Risk & Playbook Defaults */}
      <SettingsSection title="Risk & Playbook Defaults" id="risk">
        <p className="mb-3 text-xs text-text-secondary">
          Set default values for the Analyze/Ideas playbook.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs text-text-tertiary">Default balance</span>
            <input
              className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
              type="number"
              min={100}
              step={50}
              value={settings.defaultBalance || 1000}
              onChange={(e) => setSettings({ defaultBalance: Number(e.target.value || 0) })}
            />
          </label>
          <label className="flex items-center gap-2">
            Default-Preset
            <select
              className="rounded-xl border border-border bg-surface-elevated px-2 py-1 text-xs text-text-primary shadow-card-subtle"
          <label className="space-y-1">
            <span className="text-xs text-text-tertiary">Default preset</span>
            <SettingsSelect
              value={settings.defaultPlaybookId || "bal-15"}
              onChange={(e) => setSettings({ defaultPlaybookId: e.target.value })}
            >
              <option value="cons-1">Conservative · 1% · ATR×1.5</option>
              <option value="bal-15">Balanced · 1.5% · ATR×2</option>
              <option value="agg-2">Aggressive · 2% · ATR×2.5</option>
            </SettingsSelect>
          </label>
        </div>
      </SettingsSection>

      {/* Monitoring & Tokens */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-text-primary">Monitoring & Tokens</h2>
      <div className="rounded-2xl border border-border bg-surface/80 p-4 text-xs text-text-primary shadow-card-subtle">
        <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-3">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={flags.enabled}
              onChange={(e) => setFlags({ enabled: e.target.checked })}
            />{" "}
            Enabled
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={flags.includeNetwork}
              onChange={(e) => setFlags({ includeNetwork: e.target.checked })}
            />{" "}
            API Timings
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={flags.includeCanvas}
              onChange={(e) => setFlags({ includeCanvas: e.target.checked })}
            />{" "}
            Canvas/FPS
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={flags.includeUser}
              onChange={(e) => setFlags({ includeUser: e.target.checked })}
            />{" "}
            User Events
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={flags.tokenOverlay}
              onChange={(e) => setFlags({ tokenOverlay: e.target.checked })}
            />{" "}
            Token-Overlay
          </label>
          <div className="inline-flex items-center gap-2">
            Sampling
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={flags.sampling}
              onChange={(e) => setFlags({ sampling: Number(e.target.value) })}
              className="w-20 rounded-lg border border-border bg-surface-elevated px-2 py-1 text-xs text-text-primary shadow-card-subtle"
            />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            className="rounded border border-border px-3 py-1.5 font-semibold text-text-primary transition hover:bg-interactive-hover"
            onClick={drain}
          >
            Jetzt senden ({buffer.length})
          </button>
          <span className="text-text-tertiary">Batch alle 15s & beim Tab-Wechsel</span>
        </div>
      </div>

      {/* PWA Controls */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-text-primary">PWA</h2>
      <div className="rounded-2xl border border-border bg-surface/80 p-4 text-xs text-text-primary shadow-card-subtle">
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="rounded border border-border px-3 py-1.5 font-semibold text-text-primary transition hover:bg-interactive-hover"
            onClick={async () => {
              setBusy("Update-Check…");
              const res = await pokeServiceWorker();
              setBusy(null);
              setMsg(
                res === "no-sw"
                  ? "Kein Service Worker gefunden"
                  : res === "message-sent"
                    ? "Update angewiesen (SKIP_WAITING)"
                    : "Update angestoßen"
              );
            }}
          >
            SW-Update anstoßen
          </button>
          <button
            className="rounded border border-border px-3 py-1.5 font-semibold text-text-primary transition hover:bg-interactive-hover"
            onClick={async () => {
              setBusy("Caches leeren…");
              const removed = await clearCaches();
              setBusy(null);
              setMsg(`Caches gelöscht: ${removed.length}`);
            }}
          >
            Caches leeren
          </button>
        </div>
        <div className="mt-3 rounded-lg border border-border bg-surface-subtle p-3 text-[11px] text-text-secondary">
          <div className="mb-1 text-xs font-medium text-text-primary">App Info</div>
          <div>
            Version:{" "}
            <span className="text-text-primary">{import.meta.env.VITE_APP_VERSION ?? "dev"}</span>
          </div>
          <div>
            Build: <span className="text-text-primary">{import.meta.env.MODE}</span>
          </div>
          <div>
            VAPID:{" "}
            <span
              className={import.meta.env.VITE_VAPID_PUBLIC_KEY ? "text-success" : "text-danger"}
            >
              {import.meta.env.VITE_VAPID_PUBLIC_KEY ? "configured" : "missing"}
            </span>
          </div>
      {/* Data Export */}
      <SettingsSection title="Data Export & Backup" id="data">
        <JournalDataControls />
      </SettingsSection>

      {/* Advanced / Diagnostics (collapsed) */}
      <Collapsible
        title="Advanced & Diagnostics"
        defaultOpen={false}
        variant="card"
        className="mt-4"
      >
        <div className="space-y-6">
          {/* Telemetry */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-primary">Telemetry</h4>
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={flags.enabled} onChange={(e) => setFlags({ enabled: e.target.checked })} />
                Enabled
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={flags.includeNetwork} onChange={(e) => setFlags({ includeNetwork: e.target.checked })} />
                API timings
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={flags.includeCanvas} onChange={(e) => setFlags({ includeCanvas: e.target.checked })} />
                Canvas/FPS
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={flags.includeUser} onChange={(e) => setFlags({ includeUser: e.target.checked })} />
                User events
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={flags.tokenOverlay} onChange={(e) => setFlags({ tokenOverlay: e.target.checked })} />
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

          {/* PWA */}
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
                  setMsg(res === "no-sw" ? "No service worker found" : res === "message-sent" ? "Update triggered (SKIP_WAITING)" : "Update initiated");
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
              <p>VAPID: <span className={import.meta.env.VITE_VAPID_PUBLIC_KEY ? "text-emerald-400" : "text-rose-400"}>{import.meta.env.VITE_VAPID_PUBLIC_KEY ? "configured" : "missing"}</span></p>
            </div>
            {busy && <p className="text-xs text-text-secondary">{busy}</p>}
            {msg && <p className="text-xs text-emerald-400">{msg}</p>}
          </div>

          {/* Onboarding */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-primary">Onboarding</h4>
            <Button variant="outline" size="sm" onClick={resetOnboarding} data-testid="reset-onboarding">
              Reset onboarding
            </Button>
          </div>
        </div>
      </Collapsible>

      {/* Danger Zone */}
      <SettingsSection title="Danger Zone" id="danger" variant="danger">
        <p className="mb-3 text-xs text-text-secondary">
          These actions are destructive and cannot be undone.
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          {Object.entries(KEYS).map(([ns]) => (
            <Button
              key={ns}
              variant="destructive"
              size="sm"
              onClick={() => setConfirmAction({
                type: 'clear-ns',
                label: `Clear ${ns}`,
                action: () => handleClearNamespace(ns as NamespaceKey),
              })}
            >
              Clear {ns}
            </Button>
          ))}
        </div>
        <div className="mt-4">
          <Button
            variant="destructive"
            onClick={() => setConfirmAction({
              type: 'factory-reset',
              label: 'Factory reset',
              action: handleFactoryReset,
            })}
          >
            Factory reset
          </Button>
        </div>
      </SettingsSection>

      {/* Confirmation modal */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={`Confirm: ${confirmAction?.label}`}
        subtitle="This action cannot be undone."
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            {confirmAction?.type === 'factory-reset'
              ? 'This will delete all app data including journal entries, alerts, and preferences.'
              : `This will clear the ${confirmAction?.label.replace('Clear ', '')} data.`}
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmAction?.action}>
              {confirmAction?.label}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Helper components
function SettingsSection({ title, id, variant, children }: { title: string; id: string; variant?: 'danger'; children: React.ReactNode }) {
  return (
    <Card
      variant={variant === 'danger' ? 'bordered' : 'default'}
      className={`mt-4 ${variant === 'danger' ? 'border-rose-400/40' : ''}`}
      id={id}
    >
      <CardHeader className="pb-3">
        <CardTitle className={`text-base ${variant === 'danger' ? 'text-rose-400' : ''}`}>{title}</CardTitle>
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
          ? 'border border-brand bg-brand/10 text-brand'
          : 'border border-border text-text-secondary hover:bg-interactive-hover'
      }`}
    >
      {checked ? "ON" : "OFF"}
    </button>
  );
}

function AIStats() {
  const ctx = useAIContext();
  const pct = (ctx.tokenUsed / ctx.tokenBudget) * 100;
  const progressColor = pct > 90 ? "bg-rose-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div>
          Used Tokens: {ctx.tokenUsed.toLocaleString()} / {ctx.tokenBudget.toLocaleString()}
        </div>
        <div className="text-text-tertiary">{pct.toFixed(1)}%</div>
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">
          {ctx.tokenUsed.toLocaleString()} / {ctx.tokenBudget.toLocaleString()} tokens
        </span>
        <span className="text-text-tertiary">{pct.toFixed(1)}%</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
        <div
          className={`h-full transition-all duration-300 ${progressColor}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      {ctx.activeIdeaId && (
        <p className="text-xs text-text-tertiary">
          Active context: {ctx.activeIdeaId.slice(0, 8)}...
        </p>
      )}
      <Button variant="ghost" size="sm" onClick={() => ctx.reset()}>
        Reset counter
      </Button>
    </div>
  );
}
