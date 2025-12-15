import React from "react";
import { useSettings } from "../state/settings";
import { KEYS, clearNs, clearCaches, pokeServiceWorker, type NamespaceKey } from "../lib/datastore";
import { useTelemetry } from "../state/telemetry";
import { useAISettings } from "../state/ai";
import { useAIContext } from "../state/aiContext";
import { getWalletMonitor, startWalletMonitoring, stopWalletMonitoring } from "../lib/walletMonitor";
import JournalDataControls from "@/components/settings/JournalDataControls";
import ConnectedWalletsPanel from "@/components/settings/ConnectedWalletsPanel";
import Button from "@/components/ui/Button";
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

  const Row = ({ label, children }:{label:string;children:React.ReactNode}) => (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-3 last:border-b-0">
      <div className="text-sm font-medium text-text-primary">{label}</div>
      <div>{children}</div>
    </div>
  );
  const Select = (p:React.SelectHTMLAttributes<HTMLSelectElement>) =>
    <select
      {...p}
      className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary shadow-card-subtle transition focus:outline-none focus:ring-2 focus:ring-brand/40"
    />;
  const Toggle = ({checked,onChange}:{checked:boolean;onChange:(v:boolean)=>void}) =>
    <button
      onClick={()=>onChange(!checked)}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${checked ? 'border border-brand bg-brand/10 text-brand shadow-glow-accent' : 'border border-border text-text-primary hover:bg-interactive-hover'}`}
    >
      {checked?"ON":"OFF"}
    </button>;

  return (
    <div className={wrapperClassName}>
      {showHeading ? (
        <h1 className="mb-4 text-lg font-semibold text-text-primary md:text-xl">Einstellungen</h1>
      ) : null}
      <div className="rounded-2xl border border-border bg-surface/80 p-4 shadow-card-subtle">
        <Row label="Theme">
          <Select value={theme} onChange={(e)=>setTheme(e.target.value as ThemeMode)}>
            <option value="system">System</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </Select>
        </Row>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface/80 p-4 shadow-card-subtle">
        <Row label="Snap-to-OHLC (Default)">
          <Toggle checked={settings.snapDefault} onChange={(v)=>setSettings({snapDefault:v})}/>
        </Row>
        <Row label="Replay Speed (Default)">
          <Select value={settings.replaySpeed} onChange={(e)=>setSettings({replaySpeed: Number(e.target.value) as any})}>
            {[1,2,4,8,10].map(s=><option key={s} value={s}>{s}x</option>)}
          </Select>
        </Row>
        <Row label="HUD anzeigen">
          <Toggle checked={settings.showHud} onChange={(v)=>setSettings({showHud:v})}/>
        </Row>
        <Row label="Timeline anzeigen">
          <Toggle checked={settings.showTimeline} onChange={(v)=>setSettings({showTimeline:v})}/>
        </Row>
        <Row label="Mini-Map anzeigen">
          <Toggle checked={settings.showMinimap} onChange={(v)=>setSettings({showMinimap:v})}/>
        </Row>
      </div>
      <div className="mt-4 text-xs text-text-tertiary">
        Gespeichert unter <code>sparkfined.settings.v1</code>. Änderungen wirken sofort.
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          onClick={resetOnboarding}
          data-testid="reset-onboarding"
        >
          Reset Onboarding
        </Button>
      </div>

      <h2 className="mt-6 mb-2 text-sm font-semibold text-text-primary">Connected Wallets</h2>
      <ConnectedWalletsPanel />

      {/* BLOCK 2: Wallet Monitoring */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-text-primary">Wallet-Monitoring (Auto-Journal)</h2>
      <div className="rounded-2xl border border-border bg-surface/80 p-4 shadow-card-subtle">
        <Row label="Wallet-Adresse">
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => handleWalletChange(e.target.value)}
            placeholder="DezXAZ8z7Pnr..."
            className="w-64 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary shadow-card-subtle focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </Row>
        <Row label="Wallet-Monitoring aktiv">
          <Toggle
            checked={monitoringEnabled}
            onChange={toggleMonitoring}
          />
        </Row>
        <Row label="Auto-Fetch Grok Context">
          <Toggle
            checked={autoGrok}
            onChange={toggleAutoGrok}
          />
        </Row>

        {/* Status display */}
        {monitorStatus && monitorStatus.isRunning && (
          <div className="mt-3 rounded-xl border border-success/60 bg-success/10 p-3 text-xs text-success">
            <div className="mb-1 font-semibold">✅ Monitoring aktiv</div>
            <div className="text-text-secondary">
              <div>Wallet: {monitorStatus.walletAddress.slice(0, 8)}...{monitorStatus.walletAddress.slice(-6)}</div>
              <div>Letzter Check: {new Date(monitorStatus.lastChecked).toLocaleTimeString()}</div>
              <div>Transaktionen gesehen: {monitorStatus.seenTransactions}</div>
            </div>
          </div>
        )}

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
      <h2 className="mt-6 mb-2 text-sm font-semibold text-text-primary">Data Export &amp; Backup</h2>
      <JournalDataControls />

      {/* Danger Zone */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-text-primary">Danger Zone</h2>
      <div className="rounded-2xl border border-danger/60 bg-danger/5 p-4 shadow-card-subtle">
        <div className="text-xs text-danger">Gezieltes Löschen</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs md:grid-cols-3">
          {Object.entries(KEYS).map(([ns, _key])=>(
            <button key={ns}
              className="rounded border border-danger/60 px-2 py-1 font-semibold text-danger transition hover:bg-danger/10"
              onClick={()=>{ if(confirm(`Lösche ${ns}?`)) { clearNs(ns as NamespaceKey); alert(`${ns} gelöscht.`);} }}>
              Clear {ns}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <button className="rounded border border-danger/60 px-3 py-2 text-sm font-semibold text-danger transition hover:bg-danger/10"
            onClick={()=>{
              if (!confirm("Factory Reset? Alle sparkfined.* Daten werden gelöscht!")) return;
              Object.keys(KEYS).forEach(ns => clearNs(ns as NamespaceKey));
              alert("Alle App-Daten gelöscht. Bitte Seite neu laden.");
            }}>
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
            <select className="rounded-xl border border-border bg-surface-elevated px-2 py-1 text-xs text-text-primary shadow-card-subtle"
                    value={ai.provider} onChange={(e)=>setAI({ provider: e.target.value as any })}>
              <option value="anthropic">Anthropic</option>
              <option value="openai">OpenAI</option>
              <option value="xai">xAI</option>
            </select>
          </label>
          <label className="inline-flex items-center gap-2">
            Model
            <input className="w-48 rounded-xl border border-border bg-surface-elevated px-2 py-1 text-xs text-text-primary shadow-card-subtle"
                   placeholder="(optional override)"
                   value={ai.model || ""} onChange={(e)=>setAI({ model: e.target.value || undefined })}/>
          </label>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
          <label className="inline-flex items-center gap-2">
            maxOutputTokens
            <input type="number" min={64} max={4000}
                   className="w-28 rounded-xl border border-border bg-surface-elevated px-2 py-1 text-xs text-text-primary shadow-card-subtle"
                   value={ai.maxOutputTokens ?? 800}
                   onChange={(e)=>setAI({ maxOutputTokens: Number(e.target.value) })}/>
          </label>
          <label className="inline-flex items-center gap-2">
            maxCostUsd / Call
            <input type="number" min={0.01} step={0.01}
                   className="w-28 rounded-xl border border-border bg-surface-elevated px-2 py-1 text-xs text-text-primary shadow-card-subtle"
                   value={ai.maxCostUsd ?? 0.15}
                   onChange={(e)=>setAI({ maxCostUsd: Number(e.target.value) })}/>
          </label>
        </div>
        <div className="mt-1 text-[11px] text-text-tertiary">
          Server setzt zusätzlich eine globale Obergrenze via <code>AI_MAX_COST_USD</code>.
        </div>
        <div className="mt-2 text-[11px] text-text-tertiary">Keys bleiben serverseitig (.env). Der Client sendet nur Provider/Model + Prompt.</div>
      </div>

      {/* Token Budget */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-text-primary">AI Token Budget</h2>
      <div className="rounded-2xl border border-border bg-surface/80 p-4 text-xs text-text-primary shadow-card-subtle">
        <AIStats/>
      </div>

      {/* Risk & Playbook Defaults */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-text-primary">Risk & Playbook Defaults</h2>
      <div className="rounded-2xl border border-border bg-surface/80 p-4 text-xs text-text-primary shadow-card-subtle">
        <div className="mb-2 text-[12px] text-text-secondary">
          Setze Standard-Balance und Preset, die im Analyze/Ideas-Playbook vorgefüllt werden.
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          <label className="flex items-center gap-2">Default-Balance
            <input className="rounded-xl border border-border bg-surface-elevated px-2 py-1 text-xs text-text-primary shadow-card-subtle"
                   type="number" min={100} step={50}
                   value={settings.defaultBalance||1000}
                   onChange={e=>setSettings({ defaultBalance: Number(e.target.value||0) })}/>
          </label>
          <label className="flex items-center gap-2">Default-Preset
            <select className="rounded-xl border border-border bg-surface-elevated px-2 py-1 text-xs text-text-primary shadow-card-subtle"
                    value={settings.defaultPlaybookId||"bal-15"}
                    onChange={e=>setSettings({ defaultPlaybookId: e.target.value })}>
              <option value="cons-1">Conservative · 1% · ATR×1.5</option>
              <option value="bal-15">Balanced · 1.5% · ATR×2</option>
              <option value="agg-2">Aggressive · 2% · ATR×2.5</option>
            </select>
          </label>
        </div>
      </div>

      {/* Monitoring & Tokens */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-text-primary">Monitoring & Tokens</h2>
      <div className="rounded-2xl border border-border bg-surface/80 p-4 text-xs text-text-primary shadow-card-subtle">
        <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-3">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flags.enabled} onChange={e=>setFlags({enabled: e.target.checked})}/> Enabled</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flags.includeNetwork} onChange={e=>setFlags({includeNetwork: e.target.checked})}/> API Timings</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flags.includeCanvas} onChange={e=>setFlags({includeCanvas: e.target.checked})}/> Canvas/FPS</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flags.includeUser} onChange={e=>setFlags({includeUser: e.target.checked})}/> User Events</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flags.tokenOverlay} onChange={e=>setFlags({tokenOverlay: e.target.checked})}/> Token-Overlay</label>
          <div className="inline-flex items-center gap-2">
            Sampling
            <input type="number" min={0} max={1} step={0.05} value={flags.sampling} onChange={e=>setFlags({sampling: Number(e.target.value)})}
                   className="w-20 rounded-lg border border-border bg-surface-elevated px-2 py-1 text-xs text-text-primary shadow-card-subtle"
            />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button className="rounded border border-border px-3 py-1.5 font-semibold text-text-primary transition hover:bg-interactive-hover" onClick={drain}>Jetzt senden ({buffer.length})</button>
          <span className="text-text-tertiary">Batch alle 15s & beim Tab-Wechsel</span>
        </div>
      </div>

      {/* PWA Controls */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-text-primary">PWA</h2>
      <div className="rounded-2xl border border-border bg-surface/80 p-4 text-xs text-text-primary shadow-card-subtle">
        <div className="flex flex-wrap items-center gap-2">
          <button className="rounded border border-border px-3 py-1.5 font-semibold text-text-primary transition hover:bg-interactive-hover"
            onClick={async ()=>{
              setBusy("Update-Check…");
              const res = await pokeServiceWorker();
              setBusy(null);
              setMsg(res==="no-sw" ? "Kein Service Worker gefunden"
                     : res==="message-sent" ? "Update angewiesen (SKIP_WAITING)"
                     : "Update angestoßen");
            }}>
            SW-Update anstoßen
          </button>
          <button className="rounded border border-border px-3 py-1.5 font-semibold text-text-primary transition hover:bg-interactive-hover"
            onClick={async ()=>{
              setBusy("Caches leeren…");
              const removed = await clearCaches();
              setBusy(null);
              setMsg(`Caches gelöscht: ${removed.length}`);
            }}>
            Caches leeren
          </button>
        </div>
        <div className="mt-3 rounded-lg border border-border bg-surface-subtle p-3 text-[11px] text-text-secondary">
          <div className="mb-1 text-xs font-medium text-text-primary">App Info</div>
          <div>Version: <span className="text-text-primary">{import.meta.env.VITE_APP_VERSION ?? "dev"}</span></div>
          <div>Build: <span className="text-text-primary">{import.meta.env.MODE}</span></div>
          <div>VAPID: <span className={import.meta.env.VITE_VAPID_PUBLIC_KEY ? "text-success" : "text-danger"}>{import.meta.env.VITE_VAPID_PUBLIC_KEY ? "configured" : "missing"}</span></div>
        </div>
        {busy && <div className="mt-2 text-[11px] text-text-secondary">{busy}</div>}
        {msg && <div className="mt-1 text-[11px] text-success">{msg}</div>}
      </div>
    </div>
  );
}

function AIStats() {
  const ctx = useAIContext();
  const pct = (ctx.tokenUsed / ctx.tokenBudget) * 100;
  const progressColor = pct > 90 ? "bg-danger" : pct > 70 ? "bg-brand" : "bg-success";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div>Used Tokens: {ctx.tokenUsed.toLocaleString()} / {ctx.tokenBudget.toLocaleString()}</div>
        <div className="text-text-tertiary">{pct.toFixed(1)}%</div>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
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
      <button
        className="mt-2 rounded border border-border px-3 py-1.5 text-xs font-semibold text-text-primary transition hover:bg-interactive-hover"
        onClick={() => ctx.reset()}
      >
        Reset Counter
      </button>
    </div>
  );
}
