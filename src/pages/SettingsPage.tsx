import React from "react";
import { useSettings } from "../state/settings";
import { KEYS, exportAppData, downloadJson, importAppData, clearNs, clearCaches, pokeServiceWorker, type NamespaceKey } from "../lib/datastore";
import { useTelemetry } from "../state/telemetry";
import { useAISettings } from "../state/ai";
import { useAIContext } from "../state/aiContext";
import { getWalletMonitor, startWalletMonitoring, stopWalletMonitoring } from "../lib/walletMonitor";
import { useTheme, type ThemeMode } from "@/lib/theme/useTheme";

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

  const Row = ({ label, children }:{label:string;children:React.ReactNode}) => (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-800 py-3">
      <div className="text-sm text-zinc-300">{label}</div>
      <div>{children}</div>
    </div>
  );
  const Select = (p:React.SelectHTMLAttributes<HTMLSelectElement>) =>
    <select {...p} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-200" />;
  const Toggle = ({checked,onChange}:{checked:boolean;onChange:(v:boolean)=>void}) =>
    <button onClick={()=>onChange(!checked)} className={`rounded px-2 py-1 text-sm border ${checked?"border-emerald-700 bg-emerald-900/30 text-emerald-100":"border-zinc-700 text-zinc-200 hover:bg-zinc-800"}`}>{checked?"ON":"OFF"}</button>;

  return (
    <div className={wrapperClassName}>
      {showHeading ? (
        <h1 className="mb-4 text-lg font-semibold text-zinc-100 md:text-xl">Einstellungen</h1>
      ) : null}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <Row label="Theme">
          <Select value={theme} onChange={(e)=>setTheme(e.target.value as ThemeMode)}>
            <option value="system">System</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </Select>
        </Row>
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
      <div className="mt-4 text-xs text-zinc-500">
        Gespeichert unter <code>sparkfined.settings.v1</code>. Änderungen wirken sofort.
      </div>

      {/* BLOCK 2: Wallet Monitoring */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-zinc-200">Wallet-Monitoring (Auto-Journal)</h2>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <Row label="Wallet-Adresse">
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => handleWalletChange(e.target.value)}
            placeholder="DezXAZ8z7Pnr..."
            className="w-64 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-200"
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
          <div className="mt-3 rounded border border-emerald-800/40 bg-emerald-950/20 p-3 text-xs text-emerald-200">
            <div className="mb-1 font-semibold">✅ Monitoring aktiv</div>
            <div className="text-emerald-300/80">
              <div>Wallet: {monitorStatus.walletAddress.slice(0, 8)}...{monitorStatus.walletAddress.slice(-6)}</div>
              <div>Letzter Check: {new Date(monitorStatus.lastChecked).toLocaleTimeString()}</div>
              <div>Transaktionen gesehen: {monitorStatus.seenTransactions}</div>
            </div>
          </div>
        )}

        {walletAddress && !monitoringEnabled && (
          <div className="mt-3 rounded border border-zinc-700 bg-zinc-900/60 p-3 text-xs text-zinc-400">
            ⏸️ Monitoring pausiert. Aktiviere oben, um Auto-Journal zu starten.
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-zinc-500">
        <strong>Info:</strong> Wallet-Monitoring erkennt automatisch Buy-Transaktionen und erstellt
        temporäre Journal-Einträge. Du hast 7 Tage Zeit, um sie als "aktiv" zu markieren.
      </div>

      {/* Data Export / Import */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-zinc-200">Daten — Export / Import</h2>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="mb-2 text-xs text-zinc-400">Wähle Bereiche für Export:</div>
        <div className="mb-3 grid grid-cols-2 gap-2 text-xs text-zinc-300 md:grid-cols-3">
          {Object.keys(KEYS).map(k => {
            const key = k as NamespaceKey;
            return (
              <label key={k} className="inline-flex items-center gap-2">
                <input type="checkbox" checked={!!pick[key]} onChange={()=>setPick(p=>({ ...p, [key]: !p[key] }))}/>
                <span>{k}</span>
              </label>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
            onClick={()=>{
              const selected = Object.entries(pick).filter(([,v])=>v).map(([k])=>k as NamespaceKey);
              const payload = exportAppData(selected);
              downloadJson(`sparkfined-backup-${new Date().toISOString().slice(0,10)}.json`, payload);
            }}
          >Export JSON</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden"
                 onChange={async (e)=>{
                   const f = e.currentTarget.files?.[0]; if (!f) return;
                   setBusy("Import…"); setMsg(null);
                   try {
                     const res = await importAppData(f, "merge");
                     setMsg(`Import erfolgreich: ${res.imported.join(", ")}`);
                   } catch(e:any){ setMsg(`Import-Fehler: ${e?.message||e}`); }
                   setBusy(null); e.currentTarget.value = "";
                 }} />
          <button className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                  onClick={()=>fileRef.current?.click()}>Import JSON (Merge)</button>
        </div>
        {busy && <div className="mt-2 text-[11px] text-zinc-400">{busy}</div>}
        {msg &&  <div className="mt-2 text-[11px] text-emerald-300">{msg}</div>}
      </div>

      {/* Danger Zone */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-zinc-200">Danger Zone</h2>
      <div className="rounded-xl border border-rose-900 bg-rose-950/30 p-4">
        <div className="text-xs text-rose-100">Gezieltes Löschen</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs md:grid-cols-3">
          {Object.entries(KEYS).map(([ns, _key])=>(
            <button key={ns}
              className="rounded border border-rose-900 px-2 py-1 text-rose-100 hover:bg-rose-900/20"
              onClick={()=>{ if(confirm(`Lösche ${ns}?`)) { clearNs(ns as NamespaceKey); alert(`${ns} gelöscht.`);} }}>
              Clear {ns}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <button className="rounded border border-rose-900 px-3 py-2 text-sm text-rose-100 hover:bg-rose-900/20"
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
      <h2 className="mt-6 mb-2 text-sm font-semibold text-zinc-200">AI</h2>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <label className="inline-flex items-center gap-2">
            Provider
            <select className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                    value={ai.provider} onChange={(e)=>setAI({ provider: e.target.value as any })}>
              <option value="anthropic">Anthropic</option>
              <option value="openai">OpenAI</option>
              <option value="xai">xAI</option>
            </select>
          </label>
          <label className="inline-flex items-center gap-2">
            Model
            <input className="w-48 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                   placeholder="(optional override)"
                   value={ai.model || ""} onChange={(e)=>setAI({ model: e.target.value || undefined })}/>
          </label>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
          <label className="inline-flex items-center gap-2">
            maxOutputTokens
            <input type="number" min={64} max={4000}
                   className="w-28 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                   value={ai.maxOutputTokens ?? 800}
                   onChange={(e)=>setAI({ maxOutputTokens: Number(e.target.value) })}/>
          </label>
          <label className="inline-flex items-center gap-2">
            maxCostUsd / Call
            <input type="number" min={0.01} step={0.01}
                   className="w-28 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                   value={ai.maxCostUsd ?? 0.15}
                   onChange={(e)=>setAI({ maxCostUsd: Number(e.target.value) })}/>
          </label>
        </div>
        <div className="mt-1 text-[11px] text-zinc-500">
          Server setzt zusätzlich eine globale Obergrenze via <code>AI_MAX_COST_USD</code>.
        </div>
        <div className="mt-2 text-[11px] text-zinc-500">Keys bleiben serverseitig (.env). Der Client sendet nur Provider/Model + Prompt.</div>
      </div>

      {/* Token Budget */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-zinc-200">AI Token Budget</h2>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
        <AIStats/>
      </div>

      {/* Risk & Playbook Defaults */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-zinc-200">Risk & Playbook Defaults</h2>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
        <div className="mb-2 text-[12px] text-zinc-400">
          Setze Standard-Balance und Preset, die im Analyze/Ideas-Playbook vorgefüllt werden.
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          <label className="flex items-center gap-2">Default-Balance
            <input className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs"
                   type="number" min={100} step={50}
                   value={settings.defaultBalance||1000}
                   onChange={e=>setSettings({ defaultBalance: Number(e.target.value||0) })}/>
          </label>
          <label className="flex items-center gap-2">Default-Preset
            <select className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs"
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
      <h2 className="mt-6 mb-2 text-sm font-semibold text-zinc-200">Monitoring & Tokens</h2>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
        <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-3">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flags.enabled} onChange={e=>setFlags({enabled: e.target.checked})}/> Enabled</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flags.includeNetwork} onChange={e=>setFlags({includeNetwork: e.target.checked})}/> API Timings</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flags.includeCanvas} onChange={e=>setFlags({includeCanvas: e.target.checked})}/> Canvas/FPS</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flags.includeUser} onChange={e=>setFlags({includeUser: e.target.checked})}/> User Events</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flags.tokenOverlay} onChange={e=>setFlags({tokenOverlay: e.target.checked})}/> Token-Overlay</label>
          <div className="inline-flex items-center gap-2">
            Sampling
            <input type="number" min={0} max={1} step={0.05} value={flags.sampling} onChange={e=>setFlags({sampling: Number(e.target.value)})}
                   className="w-20 rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5 text-xs text-zinc-200"/>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button className="rounded border border-zinc-700 px-2 py-1 hover:bg-zinc-800" onClick={drain}>Jetzt senden ({buffer.length})</button>
          <span className="text-zinc-500">Batch alle 15s & beim Tab-Wechsel</span>
        </div>
      </div>

      {/* PWA Controls */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-zinc-200">PWA</h2>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
        <div className="flex flex-wrap items-center gap-2">
          <button className="rounded border border-zinc-700 px-2 py-1 hover:bg-zinc-800"
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
          <button className="rounded border border-zinc-700 px-2 py-1 hover:bg-zinc-800"
            onClick={async ()=>{
              setBusy("Caches leeren…");
              const removed = await clearCaches();
              setBusy(null);
              setMsg(`Caches gelöscht: ${removed.length}`);
            }}>
            Caches leeren
          </button>
        </div>
        <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-[11px] text-zinc-500">
          <div className="mb-1 text-xs font-medium text-zinc-400">App Info</div>
          <div>Version: <span className="text-zinc-300">{import.meta.env.VITE_APP_VERSION ?? "dev"}</span></div>
          <div>Build: <span className="text-zinc-300">{import.meta.env.MODE}</span></div>
          <div>VAPID: <span className={import.meta.env.VITE_VAPID_PUBLIC_KEY ? "text-emerald-400" : "text-amber-400"}>{import.meta.env.VITE_VAPID_PUBLIC_KEY ? "configured" : "missing"}</span></div>
        </div>
      </div>
    </div>
  );
}

function AIStats() {
  const ctx = useAIContext();
  const pct = (ctx.tokenUsed / ctx.tokenBudget) * 100;
  const progressColor = pct > 90 ? "bg-rose-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500";
  
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div>Used Tokens: {ctx.tokenUsed.toLocaleString()} / {ctx.tokenBudget.toLocaleString()}</div>
        <div className="text-zinc-500">{pct.toFixed(1)}%</div>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        <div 
          className={`h-full transition-all duration-300 ${progressColor}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      {ctx.activeIdeaId && (
        <div className="mt-2 text-[11px] text-zinc-500">
          Active Context: Idea {ctx.activeIdeaId.slice(0, 8)}...
        </div>
      )}
      <button 
        className="mt-2 rounded border border-zinc-700 px-2 py-1 hover:bg-zinc-800" 
        onClick={() => ctx.reset()}
      >
        Reset Counter
      </button>
    </div>
  );
}
