import React from "react";
import { useSettings } from "../state/settings";
import { KEYS, exportAppData, downloadJson, importAppData, clearNs, clearCaches, pokeServiceWorker, type NamespaceKey } from "../lib/datastore";
import { useTelemetry } from "../state/telemetry";
import { useAISettings } from "../state/ai";
import { useAIContext } from "../state/aiContext";
import { getWalletMonitor, startWalletMonitoring, stopWalletMonitoring } from "../lib/walletMonitor";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useTheme, type ThemeMode } from "@/lib/theme/useTheme";
import { cn } from "@/lib/ui/cn";

interface SettingsPageProps {
  showHeading?: boolean;
  wrapperClassName?: string;
}

export default function SettingsPage({
  showHeading = true,
  wrapperClassName = "mx-auto max-w-3xl p-4 pb-20 md:p-6 md:pb-6",
}: SettingsPageProps) {
  const { settings, setSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const { flags, setFlags, buffer, drain } = useTelemetry();
  const { ai, setAI } = useAISettings();
  const resetOnboarding = useOnboardingStore((state) => state.resetOnboarding);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [pick, setPick] = React.useState<Record<NamespaceKey, boolean>>(() => {
    const base: Record<NamespaceKey, boolean> = {
      settings: true, watchlist: true, alerts: true, alertTriggers: true,
      sessions: true, bookmarks: true, events: true, journal: true
    };
    return base;
  });
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  // BLOCK 2: Wallet monitoring state
  const [walletAddress, setWalletAddress] = React.useState(() => {
    return localStorage.getItem('sparkfined.wallet.monitored') || '';
  });
  const [monitoringEnabled, setMonitoringEnabled] = React.useState(() => {
    return localStorage.getItem('sparkfined.wallet.monitoring') === 'true';
  });
  const [autoGrok, setAutoGrok] = React.useState(() => {
    return localStorage.getItem('sparkfined.grok.auto') === 'true';
  });
  const [monitorStatus, setMonitorStatus] = React.useState<any>(null);

  // Update monitor status
  React.useEffect(() => {
    const interval = setInterval(() => {
      const monitor = getWalletMonitor();
      if (monitor) {
        setMonitorStatus(monitor.getStatus());
      }
    }, 5000); // Update every 5s

    return () => clearInterval(interval);
  }, []);

  const handleWalletChange = (address: string) => {
    setWalletAddress(address);
    localStorage.setItem('sparkfined.wallet.monitored', address);
  };

  const toggleMonitoring = (enabled: boolean) => {
    setMonitoringEnabled(enabled);
    localStorage.setItem('sparkfined.wallet.monitoring', enabled ? 'true' : 'false');

    if (enabled && walletAddress) {
      startWalletMonitoring(walletAddress);
    } else {
      stopWalletMonitoring();
    }
  };

  const toggleAutoGrok = (enabled: boolean) => {
    setAutoGrok(enabled);
    localStorage.setItem('sparkfined.grok.auto', enabled ? 'true' : 'false');
  };

  const wrapperClasses = cn("space-y-6 sm:space-y-8", wrapperClassName);

  return (
    <div className={wrapperClasses}>
      {showHeading ? (
        <h1 className="text-lg font-semibold text-text-primary md:text-xl">Einstellungen</h1>
      ) : null}

      <Card className="rounded-2xl">
        <div className="mb-4 space-y-1">
          <CardTitle className="text-xl">Appearance & Chart Defaults</CardTitle>
          <CardDescription>Steuere Theme und Baseline-Interaktionen für Charts.</CardDescription>
        </div>
        <CardContent className="divide-y divide-border/70 gap-0">
          <SettingRow
            label="Theme"
            description="System folgt den Geräteeinstellungen, falls nicht überschrieben."
            control={(
              <select
                className="input w-40"
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeMode)}
              >
                <option value="system">System</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            )}
          />
          <SettingRow
            label="Snap-to-OHLC (Default)"
            description="Aktiviere präzise Cursor-Snap-Punkte in Replay & Chart."
            control={<TogglePill checked={settings.snapDefault} onChange={(v) => setSettings({ snapDefault: v })} />}
          />
          <SettingRow
            label="Replay Speed (Default)"
            control={(
              <select
                className="input w-32"
                value={settings.replaySpeed}
                onChange={(e) => setSettings({ replaySpeed: Number(e.target.value) as any })}
              >
                {[1, 2, 4, 8, 10].map((s) => (
                  <option key={s} value={s}>{`${s}x`}</option>
                ))}
              </select>
            )}
          />
          <SettingRow
            label="HUD anzeigen"
            control={<TogglePill checked={settings.showHud} onChange={(v) => setSettings({ showHud: v })} />}
          />
          <SettingRow
            label="Timeline anzeigen"
            control={<TogglePill checked={settings.showTimeline} onChange={(v) => setSettings({ showTimeline: v })} />}
          />
          <SettingRow
            label="Mini-Map anzeigen"
            control={<TogglePill checked={settings.showMinimap} onChange={(v) => setSettings({ showMinimap: v })} />}
          />
        </CardContent>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-tertiary">
            Gespeichert unter <code className="text-text-secondary">sparkfined.settings.v1</code>. Änderungen wirken sofort.
          </p>
          <Button
            variant="outline"
            onClick={resetOnboarding}
            data-testid="reset-onboarding"
          >
            Reset Onboarding
          </Button>
        </div>
      </Card>

      <Card className="rounded-2xl">
        <div className="mb-4 space-y-1">
          <CardTitle className="text-xl">Wallet-Monitoring (Auto-Journal)</CardTitle>
          <CardDescription>Automatische Journal-Entwürfe auf Basis beobachteter Buy-Transaktionen.</CardDescription>
        </div>
        <CardContent className="space-y-4">
          <SettingRow
            label="Wallet-Adresse"
            description="Adresse, die kontinuierlich überwacht wird."
            control={(
              <Input
                type="text"
                value={walletAddress}
                onChange={(e) => handleWalletChange(e.target.value)}
                placeholder="DezXAZ8z7Pnr..."
                className="w-64"
              />
            )}
          />
          <SettingRow
            label="Wallet-Monitoring aktiv"
            control={<TogglePill checked={monitoringEnabled} onChange={toggleMonitoring} />}
          />
          <SettingRow
            label="Auto-Fetch Grok Context"
            control={<TogglePill checked={autoGrok} onChange={toggleAutoGrok} />}
          />

          {monitorStatus && monitorStatus.isRunning ? (
            <div className="rounded-2xl border border-brand/40 bg-brand/10 px-4 py-3 text-sm text-brand">
              <div className="mb-1 font-semibold">Monitoring aktiv</div>
              <div className="space-y-1 text-text-primary">
                <div>Wallet: {monitorStatus.walletAddress.slice(0, 8)}...{monitorStatus.walletAddress.slice(-6)}</div>
                <div className="text-text-secondary">Letzter Check: {new Date(monitorStatus.lastChecked).toLocaleTimeString()}</div>
                <div className="text-text-secondary">Transaktionen gesehen: {monitorStatus.seenTransactions}</div>
              </div>
            </div>
          ) : null}

          {walletAddress && !monitoringEnabled ? (
            <div className="rounded-2xl border border-border bg-surface-subtle px-4 py-3 text-sm text-text-secondary">
              ⏸️ Monitoring pausiert. Aktiviere oben, um Auto-Journal zu starten.
            </div>
          ) : null}
        </CardContent>
        <p className="mt-3 text-xs text-text-tertiary">
          <strong className="text-text-secondary">Info:</strong> Wallet-Monitoring erkennt automatisch Buy-Transaktionen und erstellt temporäre Journal-Einträge. Du hast 7 Tage Zeit, um sie als "aktiv" zu markieren.
        </p>
      </Card>

      <Card className="rounded-2xl">
        <div className="mb-4 space-y-1">
          <CardTitle className="text-xl">Daten — Export / Import</CardTitle>
          <CardDescription>Sichere deine Sparkfined-Daten oder importiere Backups.</CardDescription>
        </div>
        <CardContent className="space-y-4">
          <p className="text-xs text-text-secondary">Wähle Bereiche für Export:</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-text-primary md:grid-cols-3">
            {Object.keys(KEYS).map((k) => {
              const key = k as NamespaceKey;
              return (
                <label key={k} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                  <input
                    type="checkbox"
                    checked={!!pick[key]}
                    onChange={() => setPick((p) => ({ ...p, [key]: !p[key] }))}
                    className="h-4 w-4 accent-brand"
                  />
                  <span className="text-text-secondary">{k}</span>
                </label>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const selected = Object.entries(pick).filter(([, v]) => v).map(([k]) => k as NamespaceKey);
                const payload = exportAppData(selected);
                downloadJson(`sparkfined-backup-${new Date().toISOString().slice(0, 10)}.json`, payload);
              }}
            >
              Export JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const f = e.currentTarget.files?.[0];
                if (!f) return;
                setBusy("Import…");
                setMsg(null);
                try {
                  const res = await importAppData(f, "merge");
                  setMsg(`Import erfolgreich: ${res.imported.join(", ")}`);
                } catch (e: any) {
                  setMsg(`Import-Fehler: ${e?.message || e}`);
                }
                setBusy(null);
                e.currentTarget.value = "";
              }}
            />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              Import JSON (Merge)
            </Button>
          </div>
          {busy ? <div className="text-[11px] text-text-tertiary">{busy}</div> : null}
          {msg ? <div className="text-[11px] text-brand">{msg}</div> : null}
        </CardContent>
      </Card>

      <Card variant="bordered" className="rounded-2xl border-rose-900/60 bg-rose-950/40">
        <div className="mb-3 space-y-1">
          <CardTitle className="text-xl text-rose-50">Danger Zone</CardTitle>
          <CardDescription className="text-rose-100/80">Gezieltes Löschen nach Namespace oder kompletter Reset.</CardDescription>
        </div>
        <CardContent className="space-y-4 text-sm text-rose-50">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {Object.entries(KEYS).map(([ns, _key]) => (
              <Button
                key={ns}
                variant="destructive"
                size="sm"
                className="justify-center"
                onClick={() => {
                  if (confirm(`Lösche ${ns}?`)) {
                    clearNs(ns as NamespaceKey);
                    alert(`${ns} gelöscht.`);
                  }
                }}
              >
                Clear {ns}
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-rose-800/80 bg-rose-950/60 px-4 py-3">
            <p className="text-xs text-rose-100/80">Factory Reset löscht alle sparkfined.* Daten.</p>
            <div>
              <Button
                variant="destructive"
                className="w-full justify-center sm:w-auto"
                onClick={() => {
                  if (!confirm("Factory Reset? Alle sparkfined.* Daten werden gelöscht!")) return;
                  Object.keys(KEYS).forEach((ns) => clearNs(ns as NamespaceKey));
                  alert("Alle App-Daten gelöscht. Bitte Seite neu laden.");
                }}
              >
                Factory Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <div className="mb-3 space-y-1">
          <CardTitle className="text-xl">AI</CardTitle>
          <CardDescription>Provider, Modelle und Limits für AI-Aufrufe.</CardDescription>
        </div>
        <CardContent className="space-y-4 text-sm text-text-secondary">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <SettingRow
              label="Provider"
              control={(
                <select
                  className="input"
                  value={ai.provider}
                  onChange={(e) => setAI({ provider: e.target.value as any })}
                >
                  <option value="anthropic">Anthropic</option>
                  <option value="openai">OpenAI</option>
                  <option value="xai">xAI</option>
                </select>
              )}
            />
            <SettingRow
              label="Model Override"
              description="Optionales Modell für alle Prompts."
              control={(
                <Input
                  placeholder="(optional override)"
                  value={ai.model || ""}
                  onChange={(e) => setAI({ model: e.target.value || undefined })}
                  className="w-full md:w-72"
                />
              )}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <SettingRow
              label="maxOutputTokens"
              control={(
                <Input
                  type="number"
                  min={64}
                  max={4000}
                  value={ai.maxOutputTokens ?? 800}
                  onChange={(e) => setAI({ maxOutputTokens: Number(e.target.value) })}
                  className="w-28"
                />
              )}
            />
            <SettingRow
              label="maxCostUsd / Call"
              control={(
                <Input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={ai.maxCostUsd ?? 0.15}
                  onChange={(e) => setAI({ maxCostUsd: Number(e.target.value) })}
                  className="w-32"
                />
              )}
            />
          </div>
          <p className="text-[11px] text-text-tertiary">
            Server setzt zusätzlich eine globale Obergrenze via <code className="text-text-secondary">AI_MAX_COST_USD</code>. Keys bleiben serverseitig (.env). Der Client sendet nur Provider/Model + Prompt.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <div className="mb-3 space-y-1">
          <CardTitle className="text-xl">AI Token Budget</CardTitle>
          <CardDescription>Überblick über genutzte Tokens.</CardDescription>
        </div>
        <CardContent className="text-sm text-text-secondary">
          <AIStats />
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <div className="mb-3 space-y-1">
          <CardTitle className="text-xl">Risk & Playbook Defaults</CardTitle>
          <CardDescription>Vorgefüllte Werte für Analyze/Ideas-Playbook.</CardDescription>
        </div>
        <CardContent className="space-y-4 text-sm text-text-secondary">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <SettingRow
              label="Default-Balance"
              control={(
                <Input
                  type="number"
                  min={100}
                  step={50}
                  value={settings.defaultBalance || 1000}
                  onChange={(e) => setSettings({ defaultBalance: Number(e.target.value || 0) })}
                  className="w-32"
                />
              )}
            />
            <SettingRow
              label="Default-Preset"
              control={(
                <select
                  className="input"
                  value={settings.defaultPlaybookId || "bal-15"}
                  onChange={(e) => setSettings({ defaultPlaybookId: e.target.value })}
                >
                  <option value="cons-1">Conservative · 1% · ATR×1.5</option>
                  <option value="bal-15">Balanced · 1.5% · ATR×2</option>
                  <option value="agg-2">Aggressive · 2% · ATR×2.5</option>
                </select>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <div className="mb-3 space-y-1">
          <CardTitle className="text-xl">Monitoring & Tokens</CardTitle>
          <CardDescription>Steuere Telemetrie-Level und Token-Overlay.</CardDescription>
        </div>
        <CardContent className="space-y-4 text-sm text-text-secondary">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <input type="checkbox" checked={flags.enabled} onChange={(e) => setFlags({ enabled: e.target.checked })} className="h-4 w-4 accent-brand" />
              <span className="text-text-primary">Enabled</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <input type="checkbox" checked={flags.includeNetwork} onChange={(e) => setFlags({ includeNetwork: e.target.checked })} className="h-4 w-4 accent-brand" />
              <span className="text-text-primary">API Timings</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <input type="checkbox" checked={flags.includeCanvas} onChange={(e) => setFlags({ includeCanvas: e.target.checked })} className="h-4 w-4 accent-brand" />
              <span className="text-text-primary">Canvas/FPS</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <input type="checkbox" checked={flags.includeUser} onChange={(e) => setFlags({ includeUser: e.target.checked })} className="h-4 w-4 accent-brand" />
              <span className="text-text-primary">User Events</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <input type="checkbox" checked={flags.tokenOverlay} onChange={(e) => setFlags({ tokenOverlay: e.target.checked })} className="h-4 w-4 accent-brand" />
              <span className="text-text-primary">Token-Overlay</span>
            </label>
            <div className="inline-flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
              <span className="text-text-primary">Sampling</span>
              <Input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={flags.sampling}
                onChange={(e) => setFlags({ sampling: Number(e.target.value) })}
                className="w-24"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" size="sm" onClick={drain}>
              Jetzt senden ({buffer.length})
            </Button>
            <span className="text-xs text-text-tertiary">Batch alle 15s & beim Tab-Wechsel</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <div className="mb-3 space-y-1">
          <CardTitle className="text-xl">PWA</CardTitle>
          <CardDescription>Service Worker steuern und App-Metadaten einsehen.</CardDescription>
        </div>
        <CardContent className="space-y-4 text-sm text-text-secondary">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setBusy("Update-Check…");
                const res = await pokeServiceWorker();
                setBusy(null);
                setMsg(
                  res === "no-sw"
                    ? "Kein Service Worker gefunden"
                    : res === "message-sent"
                      ? "Update angewiesen (SKIP_WAITING)"
                      : "Update angestoßen",
                );
              }}
            >
              SW-Update anstoßen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setBusy("Caches leeren…");
                const removed = await clearCaches();
                setBusy(null);
                setMsg(`Caches gelöscht: ${removed.length}`);
              }}
            >
              Caches leeren
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-surface-subtle px-4 py-3 text-xs">
            <div className="mb-1 text-xs font-medium text-text-secondary">App Info</div>
            <div className="space-y-1 text-text-primary">
              <div>
                Version: <span className="text-text-secondary">{import.meta.env.VITE_APP_VERSION ?? "dev"}</span>
              </div>
              <div>Build: <span className="text-text-secondary">{import.meta.env.MODE}</span></div>
              <div>
                VAPID: <span className={import.meta.env.VITE_VAPID_PUBLIC_KEY ? "text-brand" : "text-warn"}>{import.meta.env.VITE_VAPID_PUBLIC_KEY ? "configured" : "missing"}</span>
              </div>
            </div>
          </div>
          {busy ? <div className="text-[11px] text-text-tertiary">{busy}</div> : null}
          {msg ? <div className="text-[11px] text-brand">{msg}</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description ? <p className="text-xs text-text-tertiary">{description}</p> : null}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function TogglePill({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
        checked
          ? "border-brand bg-brand/10 text-brand shadow-[0_0_0_1px_rgba(var(--color-border-focus)/0.4)] hover:bg-brand/15"
          : "border-border text-text-primary hover:bg-interactive-hover"
      )}
    >
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          checked ? "bg-brand shadow-[0_0_0_3px_rgba(var(--color-brand)/0.3)]" : "bg-border"
        )}
        aria-hidden
      />
      {checked ? "Aktiv" : "Inaktiv"}
    </button>
  );
}

function AIStats() {
  const ctx = useAIContext();
  const pct = (ctx.tokenUsed / ctx.tokenBudget) * 100;
  const progressColor = pct > 90 ? "bg-rose-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-text-primary">
        <div>Used Tokens: {ctx.tokenUsed.toLocaleString()} / {ctx.tokenBudget.toLocaleString()}</div>
        <div className="text-text-tertiary">{pct.toFixed(1)}%</div>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface">
        <div
          className={`h-full transition-all duration-300 ${progressColor}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      {ctx.activeIdeaId && (
        <div className="mt-2 text-[11px] text-text-tertiary">
          Active Context: Idea {ctx.activeIdeaId.slice(0, 8)}...
        </div>
      )}
      <Button
        variant="secondary"
        size="sm"
        className="mt-3"
        onClick={() => ctx.reset()}
      >
        Reset Counter
      </Button>
    </div>
  );
}
