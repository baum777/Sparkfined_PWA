import React from "react";
import {
  TIMEFRAMES,
  TRADE_STATUS_META,
  TRADE_STATUSES,
  computeTradeMetrics,
} from "./types";
import type { JournalNote, TradeStatus, Timeframe } from "./types";

export default function JournalEditor({
  draft, onChange, onSave
}: {
  draft: Partial<JournalNote>;
  onChange: (next: Partial<JournalNote>) => void;
  onSave: () => void;
}) {
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const btn = "rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800";
  const [showTrading, setShowTrading] = React.useState(true);
  const [showContext, setShowContext] = React.useState(false);

  const updateDraft = React.useCallback((patch: Partial<JournalNote>) => {
    onChange({ ...draft, ...patch });
  }, [draft, onChange]);

  const onPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith("image/"));
    if (!item) return;
    const blob = item.getAsFile(); if (!blob) return;
    const dataUrl = await blobToDataUrl(blob);
    updateDraft({ screenshotDataUrl: dataUrl });
  };

  const onPickFile = async (f?: File) => {
    if (!f) return;
    const dataUrl = await blobToDataUrl(f);
    updateDraft({ screenshotDataUrl: dataUrl });
  };

  const numberToInputValue = (value: number | undefined) =>
    typeof value === "number" && Number.isFinite(value) ? String(value) : "";

  const handleNumericChange = (
    field: "entryPrice" | "exitPrice" | "positionSize" | "stopLoss" | "takeProfit"
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw.trim()) {
      updateDraft({ [field]: undefined } as Partial<JournalNote>);
      return;
    }
    const parsed = Number(raw.replace(/,/g, "."));
    updateDraft({ [field]: Number.isFinite(parsed) ? parsed : undefined } as Partial<JournalNote>);
  };

  const sanitizeNumber = (value?: number) =>
    typeof value === "number" && Number.isFinite(value) ? value : undefined;

  const entryPrice = sanitizeNumber(draft.entryPrice);
  const exitPrice = sanitizeNumber(draft.exitPrice);
  const positionSize = sanitizeNumber(draft.positionSize);
  const stopLoss = sanitizeNumber(draft.stopLoss);
  const takeProfit = sanitizeNumber(draft.takeProfit);

  const metrics = React.useMemo(
    () => computeTradeMetrics({ entryPrice, exitPrice, positionSize, stopLoss, takeProfit }),
    [entryPrice, exitPrice, positionSize, stopLoss, takeProfit]
  );

  const pnlValue = metrics.pnl ?? draft.pnl;
  const pnlPercentValue = metrics.pnlPercent ?? draft.pnlPercent;
  const rrValue = metrics.riskRewardRatio ?? draft.riskRewardRatio;

  const pnlTone =
    typeof pnlValue === "number"
      ? pnlValue > 0
        ? "text-emerald-400"
        : pnlValue < 0
          ? "text-rose-400"
          : "text-zinc-300"
      : "text-zinc-400";

  const rrHighlight =
    typeof rrValue === "number" && rrValue >= 2 ? "border-emerald-600 text-emerald-300" : "border-zinc-700 text-zinc-300";

  const SectionToggle: React.FC<{
    title: string;
    description?: string;
    open: boolean;
    onToggle: () => void;
  }> = ({ title, description, open, onToggle }) => (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-left transition hover:border-zinc-700"
    >
      <div>
        <div className="text-sm font-medium text-zinc-200">{title}</div>
        {description && <div className="text-xs text-zinc-400">{description}</div>}
      </div>
      <span className="text-xl text-zinc-400">{open ? "−" : "+"}</span>
    </button>
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="flex flex-col gap-3 md:col-span-2">
          <input
            value={draft.title || ""}
            onChange={e => updateDraft({ title: e.target.value })}
            placeholder="Titel"
            className="mb-2 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-200"
          />
          <textarea
            value={draft.body || ""}
            onChange={e => updateDraft({ body: e.target.value })}
            onPaste={onPaste}
            placeholder="Notiz (Markdown möglich). Bild direkt einfügen (Paste) oder Datei wählen."
            rows={8}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-zinc-200"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              value={(draft.tags || []).join(", ")}
              onChange={e =>
                updateDraft({
                  tags: e.target.value
                    .split(",")
                    .map(s => s.trim())
                    .filter(Boolean)
                })
              }
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

          <div className="space-y-2">
            <SectionToggle
              title="Trading-Daten"
              description="Trades erfassen, Status setzen und Kennzahlen live sehen."
              open={showTrading}
              onToggle={() => setShowTrading(v => !v)}
            />
            {showTrading && (
              <div className="rounded-lg border border-zinc-800 bg-black/30 p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-xs">
                    <span className="text-zinc-400">Status</span>
                    <select
                      value={draft.status || ""}
                      onChange={e =>
                        updateDraft({
                          status: e.target.value ? (e.target.value as TradeStatus) : undefined
                        })
                      }
                      className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
                    >
                      <option value="">—</option>
                      {TRADE_STATUSES.map(status => {
                        const meta = TRADE_STATUS_META[status];
                        return (
                          <option key={status} value={status}>
                            {meta.emoji} {meta.label}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs">
                    <span className="text-zinc-400">Setup / Strategie</span>
                    <input
                      value={draft.setupName || ""}
                      onChange={e => updateDraft({ setupName: e.target.value })}
                      placeholder="z. B. 'Breakout Asia Range'"
                      className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
                    />
                  </label>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <NumberField
                    label="Entry Price"
                    value={numberToInputValue(entryPrice)}
                    onChange={handleNumericChange("entryPrice")}
                  />
                  <NumberField
                    label="Exit Price"
                    value={numberToInputValue(exitPrice)}
                    onChange={handleNumericChange("exitPrice")}
                  />
                  <NumberField
                    label="Position Size"
                    value={numberToInputValue(positionSize)}
                    onChange={handleNumericChange("positionSize")}
                  />
                  <NumberField
                    label="Stop Loss"
                    value={numberToInputValue(stopLoss)}
                    onChange={handleNumericChange("stopLoss")}
                  />
                  <NumberField
                    label="Take Profit"
                    value={numberToInputValue(takeProfit)}
                    onChange={handleNumericChange("takeProfit")}
                  />
                  <div className="rounded border border-zinc-800 bg-zinc-900/60 p-2 text-xs text-zinc-400">
                    <div className="text-[10px] uppercase tracking-wide text-zinc-500">Risk / Reward</div>
                    <div className={`mt-1 inline-flex items-center gap-2 rounded px-2 py-1 text-sm ${rrHighlight}`}>
                      <span>R/R</span>
                      <strong>{rrValue !== undefined ? rrValue.toFixed(2) : "—"}</strong>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                      <div>Risk: {metrics.risk !== undefined ? metrics.risk.toFixed(2) : "—"}</div>
                      <div>Reward: {metrics.reward !== undefined ? metrics.reward.toFixed(2) : "—"}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <div className="rounded border border-zinc-800 bg-zinc-900/60 p-2">
                    <div className="text-[10px] uppercase tracking-wide text-zinc-500">PnL</div>
                    <div className={`mt-1 text-lg font-semibold ${pnlTone}`}>
                      {typeof pnlValue === "number" ? pnlValue.toFixed(2) : "—"}
                    </div>
                    {typeof pnlPercentValue === "number" && (
                      <div className="text-xs text-zinc-400">
                        {pnlPercentValue.toFixed(2)}%
                      </div>
                    )}
                  </div>
                  <div className="rounded border border-zinc-800 bg-zinc-900/60 p-2 text-xs text-zinc-300">
                    <div className="text-[10px] uppercase tracking-wide text-zinc-500">Offene Punkte</div>
                    <ul className="mt-1 space-y-1 text-[11px] leading-relaxed text-zinc-400">
                      <li>
                        <span className="text-zinc-500">Offen:</span>{" "}
                        {(draft.status === "running" || draft.status === "entered") && positionSize
                          ? `${positionSize} Units`
                          : "—"}
                      </li>
                      <li>
                        <span className="text-zinc-500">Stop@</span>{" "}
                        {stopLoss !== undefined ? stopLoss : "—"}
                      </li>
                      <li>
                        <span className="text-zinc-500">TP@</span>{" "}
                        {takeProfit !== undefined ? takeProfit : "—"}
                      </li>
                    </ul>
                  </div>
                  <div className="rounded border border-zinc-800 bg-zinc-900/60 p-2 text-xs text-zinc-300">
                    <div className="text-[10px] uppercase tracking-wide text-zinc-500">Notizen</div>
                    <div className="mt-1 text-[11px] text-zinc-500">
                      R/R &gt; 2 wird grün hervorgehoben. PnL-Farbe folgt Gewinn/Verlust.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <SectionToggle
              title="Chart-Kontext & Metadata"
              description="Zeitleiste, Referenzen und Links zur Idee."
              open={showContext}
              onToggle={() => setShowContext(v => !v)}
            />
            {showContext && (
              <div className="rounded-lg border border-zinc-800 bg-black/30 p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-xs">
                    <span className="text-zinc-400">Timeframe</span>
                    <select
                      value={draft.tf || ""}
                      onChange={e =>
                        updateDraft({
                          tf: e.target.value ? (e.target.value as Timeframe) : undefined
                        })
                      }
                      className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
                    >
                      <option value="">—</option>
                      {TIMEFRAMES.map(tf => (
                        <option key={tf} value={tf}>{tf}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs">
                    <span className="text-zinc-400">Asset / Contract</span>
                    <input
                      value={draft.address || ""}
                      onChange={e => updateDraft({ address: e.target.value })}
                      placeholder="z. B. BTC-PERP"
                      className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs md:col-span-2">
                    <span className="text-zinc-400">Permalink / Chart-Link</span>
                    <input
                      value={draft.permalink || ""}
                      onChange={e => updateDraft({ permalink: e.target.value })}
                      placeholder="https://charting..."
                      className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs md:col-span-2">
                    <span className="text-zinc-400">Regel / Playbook Verweis</span>
                    <input
                      value={draft.ruleId || ""}
                      onChange={e => updateDraft({ ruleId: e.target.value })}
                      placeholder="Optional: Regel-ID oder Link"
                      className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="rounded-lg border border-zinc-800 bg-black/40 p-3">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Vorschau</div>
            <div className="mt-2 rounded border border-zinc-800 bg-black/30 p-2">
              {draft.screenshotDataUrl
                ? <img src={draft.screenshotDataUrl} alt="screenshot" className="max-h-48 w-full rounded object-contain" />
                : <div className="text-[11px] text-zinc-500">Kein Bild</div>}
            </div>
            <div className="mt-3 space-y-2 text-[11px] text-zinc-400">
              <div>
                <span className="text-zinc-500">Status:</span>{" "}
                {draft.status ? `${TRADE_STATUS_META[draft.status].emoji} ${TRADE_STATUS_META[draft.status].label}` : "—"}
              </div>
              <div>
                <span className="text-zinc-500">Setup:</span>{" "}
                {draft.setupName || "—"}
              </div>
              <div>
                <span className="text-zinc-500">TF:</span>{" "}
                {draft.tf || "—"}
              </div>
              <div>
                <span className="text-zinc-500">Asset:</span>{" "}
                {draft.address || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type NumberFieldProps = {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const NumberField: React.FC<NumberFieldProps> = ({ label, value, onChange }) => (
  <label className="flex flex-col gap-1 text-xs">
    <span className="text-zinc-400">{label}</span>
    <input
      value={value}
      onChange={onChange}
      inputMode="decimal"
      type="number"
      step="any"
      className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
    />
  </label>
);

async function blobToDataUrl(b: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const result = r.result;
      if (typeof result === "string") {
        res(result);
      } else {
        res("");
      }
    };
    r.onerror = rej;
    r.readAsDataURL(b);
  });
}
