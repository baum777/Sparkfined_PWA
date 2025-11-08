import React from "react";
import type { JournalNote, TradeStatus, Timeframe } from "./types";

export default function JournalEditor({
  draft, onChange, onSave
}: {
  draft: Partial<JournalNote>;
  onChange: (next: Partial<JournalNote>) => void;
  onSave: () => void;
}) {
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const [showTrading, setShowTrading] = React.useState(false);
  const [showMetadata, setShowMetadata] = React.useState(false);
  const btn = "rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800";

  const onPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith("image/"));
    if (!item) return;
    const blob = item.getAsFile(); if (!blob) return;
    const dataUrl = await blobToDataUrl(blob);
    onChange({ ...draft, screenshotDataUrl: dataUrl });
  };

  const onPickFile = async (f?: File) => {
    if (!f) return;
    const dataUrl = await blobToDataUrl(f);
    onChange({ ...draft, screenshotDataUrl: dataUrl });
  };

  // Auto-calculate PnL wenn Entry/Exit gesetzt sind
  React.useEffect(() => {
    if (draft.entryPrice && draft.exitPrice && draft.positionSize) {
      const pnl = (draft.exitPrice - draft.entryPrice) * draft.positionSize;
      const pnlPercent = ((draft.exitPrice - draft.entryPrice) / draft.entryPrice) * 100;
      onChange({ ...draft, pnl, pnlPercent });
    }
  }, [draft.entryPrice, draft.exitPrice, draft.positionSize]);

  // Auto-calculate Risk/Reward
  React.useEffect(() => {
    if (draft.entryPrice && draft.stopLoss && draft.takeProfit) {
      const risk = Math.abs(draft.entryPrice - draft.stopLoss);
      const reward = Math.abs(draft.takeProfit - draft.entryPrice);
      const rr = risk > 0 ? reward / risk : 0;
      onChange({ ...draft, riskRewardRatio: rr });
    }
  }, [draft.entryPrice, draft.stopLoss, draft.takeProfit]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="grid gap-2 md:grid-cols-3">
        <div className="md:col-span-2">
          <input
            value={draft.title || ""}
            onChange={e => onChange({ ...draft, title: e.target.value })}
            placeholder="Titel"
            className="mb-2 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-200"
          />
          <textarea
            value={draft.body || ""}
            onChange={e => onChange({ ...draft, body: e.target.value })}
            onPaste={onPaste}
            placeholder="Notiz (Markdown möglich). Bild direkt einfügen (Paste) oder Datei wählen."
            rows={8}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-zinc-200"
          />
          
          {/* Trading-spezifische Felder (ausklappbar) */}
          <div className="mt-2">
            <button
              className="mb-2 text-xs text-cyan-300 hover:text-cyan-200"
              onClick={() => setShowTrading(!showTrading)}
            >
              {showTrading ? "▼" : "►"} Trading-Daten {draft.status && `(${draft.status})`}
            </button>
            {showTrading && (
              <div className="mb-2 grid gap-2 rounded border border-cyan-900/40 bg-cyan-950/10 p-2 md:grid-cols-2">
                <div>
                  <label className="text-[10px] text-zinc-400">Status</label>
                  <select
                    value={draft.status || ""}
                    onChange={e => onChange({ ...draft, status: (e.target.value || undefined) as TradeStatus })}
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                  >
                    <option value="">— Wählen —</option>
                    <option value="idea">💡 Idee</option>
                    <option value="entered">📍 Eingestiegen</option>
                    <option value="running">🏃 Laufend</option>
                    <option value="winner">🎉 Winner</option>
                    <option value="loser">📉 Loser</option>
                    <option value="breakeven">➖ Breakeven</option>
                    <option value="cancelled">❌ Abgebrochen</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400">Setup/Strategie</label>
                  <input
                    value={draft.setup || ""}
                    onChange={e => onChange({ ...draft, setup: e.target.value || undefined })}
                    placeholder="z.B. Breakout, Reversal..."
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400">Entry Preis</label>
                  <input
                    type="number"
                    step="any"
                    value={draft.entryPrice ?? ""}
                    onChange={e => onChange({ ...draft, entryPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0.00"
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400">Exit Preis</label>
                  <input
                    type="number"
                    step="any"
                    value={draft.exitPrice ?? ""}
                    onChange={e => onChange({ ...draft, exitPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0.00"
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400">Stop Loss</label>
                  <input
                    type="number"
                    step="any"
                    value={draft.stopLoss ?? ""}
                    onChange={e => onChange({ ...draft, stopLoss: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0.00"
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400">Take Profit</label>
                  <input
                    type="number"
                    step="any"
                    value={draft.takeProfit ?? ""}
                    onChange={e => onChange({ ...draft, takeProfit: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0.00"
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400">Position Size (USD)</label>
                  <input
                    type="number"
                    step="any"
                    value={draft.positionSize ?? ""}
                    onChange={e => onChange({ ...draft, positionSize: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="100"
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                  />
                </div>
                {draft.riskRewardRatio && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-400">R/R:</span>
                    <span className="text-xs font-medium text-emerald-300">
                      {draft.riskRewardRatio.toFixed(2)}
                    </span>
                  </div>
                )}
                {draft.pnl !== undefined && (
                  <div className="md:col-span-2">
                    <div className="rounded bg-black/40 p-2 text-center">
                      <div className="text-[10px] text-zinc-400">P&L</div>
                      <div className={`text-lg font-bold ${draft.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {draft.pnl >= 0 ? "+" : ""}{draft.pnl.toFixed(2)} USD
                        {draft.pnlPercent !== undefined && (
                          <span className="ml-2 text-sm">
                            ({draft.pnlPercent >= 0 ? "+" : ""}{draft.pnlPercent.toFixed(2)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Metadata (CA, TF, RuleId) */}
          <div className="mt-2">
            <button
              className="mb-2 text-xs text-zinc-400 hover:text-zinc-300"
              onClick={() => setShowMetadata(!showMetadata)}
            >
              {showMetadata ? "▼" : "►"} Chart-Kontext & Metadata
            </button>
            {showMetadata && (
              <div className="mb-2 grid gap-2 rounded border border-zinc-700/40 bg-zinc-900/20 p-2 md:grid-cols-3">
                <div>
                  <label className="text-[10px] text-zinc-400">Contract Address</label>
                  <input
                    value={draft.address || ""}
                    onChange={e => onChange({ ...draft, address: e.target.value || undefined })}
                    placeholder="0x..."
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400">Timeframe</label>
                  <select
                    value={draft.tf || ""}
                    onChange={e => onChange({ ...draft, tf: (e.target.value || undefined) as Timeframe })}
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                  >
                    <option value="">— Wählen —</option>
                    <option value="1m">1m</option>
                    <option value="5m">5m</option>
                    <option value="15m">15m</option>
                    <option value="1h">1h</option>
                    <option value="4h">4h</option>
                    <option value="1d">1d</option>
                    <option value="1w">1w</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400">Rule ID</label>
                  <input
                    value={draft.ruleId || ""}
                    onChange={e => onChange({ ...draft, ruleId: e.target.value || undefined })}
                    placeholder="rule-123..."
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              value={(draft.tags || []).join(", ")}
              onChange={e => onChange({ ...draft, tags: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) })}
              placeholder="Tags (comma,separated)"
              className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
            />
            <button className={btn} onClick={() => fileRef.current?.click()}>Bild wählen</button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.currentTarget.files?.[0]; onPickFile(f || undefined); e.currentTarget.value = ""; }}
            />
            <button className={btn} onClick={onSave}>Speichern</button>
            {draft.permalink && <a className={btn} href={draft.permalink} target="_blank" rel="noreferrer">Permalink öffnen</a>}
          </div>
        </div>
        <div>
          <div className="text-xs text-zinc-400">Vorschau</div>
          <div className="mt-1 rounded border border-zinc-800 bg-black/30 p-2">
            {draft.screenshotDataUrl
              ? <img src={draft.screenshotDataUrl} alt="screenshot" className="max-h-48 w-full rounded object-contain" />
              : <div className="text-[11px] text-zinc-500">Kein Bild</div>}
          </div>
          {draft.address && <div className="mt-2 text-[11px] text-zinc-500">CA: {draft.address}</div>}
          {draft.tf && <div className="text-[11px] text-zinc-500">TF: {draft.tf}</div>}
          {draft.status && (
            <div className="mt-1 text-[11px] text-zinc-500">
              Status: <span className="font-medium">{draft.status}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

async function blobToDataUrl(b: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const result = r.result;
      if (typeof result === 'string') {
        res(result);
      } else {
        res('');
      }
    };
    r.onerror = rej;
    r.readAsDataURL(b);
  });
}
