import React from "react";
import { fetchOhlc, type OhlcPoint } from "../sections/chart/marketOhlc";
import { kpis, signalMatrix } from "../sections/analyze/analytics";
import Heatmap from "../sections/analyze/Heatmap";
import { encodeState } from "../lib/urlState";
import { encodeToken } from "../lib/shortlink";
import type { TF } from "../lib/timeframe";
import { useAssist } from "../sections/ai/useAssist";

export default function AnalyzePage() {
  const [address, setAddress] = React.useState<string>("");
  const [tf, setTf] = React.useState<TF>("15m");
  const [data, setData] = React.useState<OhlcPoint[]|null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string| null>(null);

  const load = async () => {
    if (!address) return;
    setLoading(true); setError(null);
    try {
      const d = await fetchOhlc({ address, tf });
      setData(d);
    } catch (e:any) {
      setError(e?.message || "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  const metrics = React.useMemo(()=> data ? kpis(data as any, tf) : null, [data, tf]);
  const matrix  = React.useMemo(()=> data ? signalMatrix(data as any) : null, [data]);
  const { loading: aiLoading, result: aiResult, runTemplate } = useAssist();

  const runAI = () => {
    if (!metrics || !matrix) return;
    runTemplate("v1/analyze_bullets", {
      address, tf, metrics,
      matrixRows: matrix.rows
    });
  };
  const insertIntoJournal = async () => {
    if (!aiResult?.text) return;
    // Broadcast — Journal hört zu und fügt ein
    window.dispatchEvent(new CustomEvent("journal:insert", { detail: { text: aiResult.text }}));
    await navigator.clipboard.writeText(aiResult.text);
    alert("AI-Bullets in Zwischenablage + an Journal gesendet");
  };

  const exportJSON = () => {
    const payload = { address, tf, metrics, data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `analyze-${address.slice(0,6)}-${tf}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const exportCSV = () => {
    if (!data) return;
    const head = "t,o,h,l,c,v\n";
    const rows = data.map(p => [p.t, p.o, p.h, p.l, p.c, (p as any).v ?? ""].join(",")).join("\n");
    const blob = new Blob([head + rows], { type:"text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ohlc-${address.slice(0,6)}-${tf}.csv`; a.click();
    URL.revokeObjectURL(url);
  };
  const permalink = React.useMemo(()=> {
    const st = encodeState({ address, tf });
    return `${location.origin}/chart?chart=${st}`;
  }, [address, tf]);
  const shortlink = React.useMemo(()=> {
    try {
      const token = encodeToken({ chart: { address, tf }});
      return `${location.origin}/chart?short=${token}`;
    } catch { return null; }
  }, [address, tf]);

  const ctrl = "rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-200";
  const btn  = "rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input className={ctrl} placeholder="Contract Address (CA)" value={address} onChange={e=>setAddress(e.target.value)} />
        <select className={ctrl} value={tf} onChange={e=>setTf(e.target.value as any)}>
          {["1m","5m","15m","1h","4h","1d"].map(x=> <option key={x} value={x}>{x}</option>)}
        </select>
        <button className={btn} onClick={load} disabled={loading || !address}>{loading?"Lade…":"Analysieren"}</button>
        <a className={btn} href={permalink} target="_blank" rel="noreferrer">→ Chart</a>
        {shortlink && <button className={btn} onClick={()=>navigator.clipboard.writeText(shortlink!)}>Copy Shortlink</button>}
        <button className={btn} onClick={exportJSON} disabled={!data}>Export JSON</button>
        <button className={btn} onClick={exportCSV}  disabled={!data}>Export CSV</button>
      </div>
      {error && <div className="mb-3 rounded border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{error}</div>}

      {!data && <div className="rounded border border-zinc-800 p-6 text-sm text-zinc-400">Gib eine Contract-Adresse ein und klicke „Analysieren".</div>}
      {data && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <KpiCard label="Close (last)" value={fmt(metrics!.lastClose)} />
            <KpiCard label="Change (24h)" value={fmtPct(metrics!.change24h)} tone={tonePct(metrics!.change24h)} />
            <KpiCard label="Volatility (24h, σ·√96)" value={fmtPct(metrics!.volStdev*100)} />
            <KpiCard label="ATR(14)" value={fmt(metrics!.atr14)} />
            <KpiCard label="High/Low Range (24h)" value={fmtPct(metrics!.hiLoPerc)} />
            <KpiCard label="Volume (24h)" value={fmt(metrics!.volumeSum)} />
          </div>
          {/* Heatmap */}
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="mb-2 text-sm text-zinc-200">Indicator-Heatmap</div>
            <Heatmap
              rows={matrix!.rows}
              headers={[..."SMA 9,20,50,200".split(",").map(s=>s.trim())].slice(0,4)}
            />
            <div className="mt-1 text-[11px] text-zinc-500">Bull = Preis über Indikator; Bear = darunter; Flat = gleich/kein Wert.</div>
          </div>
          {/* AI Assist */}
          <div className="mt-4 rounded-xl border border-emerald-900 bg-emerald-950/20 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm text-emerald-200">AI-Assist: Analyse-Bullets</div>
              <div className="flex items-center gap-2">
                <button className={btn} onClick={runAI} disabled={aiLoading}>{aiLoading?"Generiere…":"Generieren"}</button>
                <button className={btn} onClick={insertIntoJournal} disabled={!aiResult?.text}>In Journal einfügen</button>
              </div>
            </div>
            {aiResult?.text
              ? <pre className="whitespace-pre-wrap rounded border border-emerald-800/60 bg-black/30 p-3 text-[12px] text-emerald-100">{aiResult.text}</pre>
              : <div className="text-[12px] text-emerald-300/70">Erzeuge auf Basis der KPIs & Heatmap prägnante Notizen.</div>
            }
            {aiResult && (
              <div className="mt-2 text-[11px] text-zinc-500">
                Provider: {aiResult.provider} · Model: {aiResult.model} · {aiResult.ms} ms ·
                {aiResult.costUsd!=null ? ` ~${aiResult.costUsd.toFixed(4)} $` : " cost n/a"}
              </div>
            )}
          </div>
          {/* Sample window info */}
          <div className="mt-2 text-[11px] text-zinc-500">Samples: {data.length} · TF: {tf}</div>
        </>
      )}
    </div>
  );
}

function KpiCard({label, value, tone}:{label:string; value:string; tone?:"pos"|"neg"|"neu"}) {
  const cls = tone==="pos" ? "text-emerald-300" : tone==="neg" ? "text-rose-300" : "text-zinc-200";
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className={`mt-1 text-lg ${cls}`}>{value}</div>
    </div>
  );
}
function fmt(n:number){ return new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(n); }
function fmtPct(n:number){ return `${(n>=0?"+":"")}${new Intl.NumberFormat(undefined,{ maximumFractionDigits: 2 }).format(n)}%`; }
function tonePct(n:number):"pos"|"neg"|"neu"{ return n>0?"pos":n<0?"neg":"neu"; }
