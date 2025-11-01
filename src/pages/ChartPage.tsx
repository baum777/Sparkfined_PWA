import React from "react";
import ChartHeader from "../sections/chart/ChartHeader";
import CandlesCanvas, { type CanvasHandle } from "../sections/chart/CandlesCanvas";
import { fetchOhlc, type OhlcPoint } from "../sections/chart/marketOhlc";
import IndicatorBar, { type IndicatorState } from "../sections/chart/IndicatorBar";
import { sma, ema, vwap } from "../sections/chart/indicators";
import DrawToolbar from "../sections/chart/draw/DrawToolbar";
import type { Shape, ToolKind } from "../sections/chart/draw/types";

export default function ChartPage() {
  const [address, setAddress] = React.useState<string>("");
  const [tf, setTf] = React.useState<"1m"|"5m"|"15m"|"1h"|"4h"|"1d">("15m");
  const [data, setData] = React.useState<OhlcPoint[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const [indState, setIndState] = React.useState<IndicatorState>({ sma20: true, ema20: true, vwap: false });
  const [inds, setInds] = React.useState<{ sma20?: (number|undefined)[]; ema20?: (number|undefined)[]; vwap?: (number|undefined)[] }>({});
  const [tool, setTool] = React.useState<ToolKind>("cursor");
  const [shapes, setShapes] = React.useState<Shape[]>(() => {
    try { return JSON.parse(localStorage.getItem("sparkfined.draw.v1") || "[]") ?? []; } catch { return []; }
  });
  const [undo, setUndo] = React.useState<Shape[][]>([]);
  const [redo, setRedo] = React.useState<Shape[][]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const canvasRef = React.useRef<CanvasHandle | null>(null);

  const load = React.useCallback(async () => {
    if (!address.trim()) { setData(null); setError(null); return; }
    setLoading(true); setError(null);
    try {
      const d = await fetchOhlc({ address: address.trim(), tf });
      setData(d);
    } catch (e:any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, [address, tf]);

  React.useEffect(() => { /* auto-load when params set */ load(); }, [load]);
  React.useEffect(() => {
    if (!data || data.length === 0) { setInds({}); return; }
    const next: typeof inds = {};
    if (indState.sma20) next.sma20 = sma(data, 20);
    if (indState.ema20) next.ema20 = ema(data, 20);
    if (indState.vwap)  next.vwap  = vwap(data);
    setInds(next);
  }, [data, indState]);

  // persist drawings
  React.useEffect(() => {
    localStorage.setItem("sparkfined.draw.v1", JSON.stringify(shapes));
  }, [shapes]);

  // hotkeys for tools / undo-redo
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault(); doUndo(); return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault(); doRedo(); return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          e.preventDefault();
          pushHistory(shapes);
          setShapes(shapes.filter(s => s.id !== selectedId));
          setSelectedId(null);
        }
      }
      if (e.key === "Escape") setTool("cursor");
      if (e.key.toLowerCase() === "h") setTool("hline");
      if (e.key.toLowerCase() === "t") setTool("trend");
      if (e.key.toLowerCase() === "f") setTool("fib");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, shapes]);

  const pushHistory = (prev: Shape[]) => {
    setUndo(u => [prev, ...u].slice(0, 100));
    setRedo([]);
  };
  const doUndo = () => {
    setUndo(u => {
      if (!u.length) return u;
      setRedo(r => [shapes, ...r].slice(0, 100));
      setShapes(u[0]);
      return u.slice(1);
    });
  };
  const doRedo = () => {
    setRedo(r => {
      if (!r.length) return r;
      setUndo(u => [shapes, ...u].slice(0, 100));
      setShapes(r[0]);
      return r.slice(1);
    });
  };
  const clearAll = () => {
    if (!shapes.length) return;
    pushHistory(shapes);
    setShapes([]);
  };
  const onShapesChange = (next: Shape[]) => {
    pushHistory(shapes);
    setShapes(next);
  };
  const onExportPNG = () => {
    const dataUrl = canvasRef.current?.exportPNG();
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `chart-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <ChartHeader
        value={address}
        onChange={setAddress}
        timeframe={tf}
        onTimeframe={setTf}
        onLoad={load}
        loading={loading}
      />
      <IndicatorBar value={indState} onChange={setIndState} />
      <DrawToolbar
        tool={tool}
        onTool={setTool}
        onUndo={doUndo}
        onRedo={doRedo}
        canUndo={undo.length>0}
        canRedo={redo.length>0}
        onClear={clearAll}
      />
      <div className="mt-2">
        <button onClick={onExportPNG} className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800">
          Export PNG
        </button>
        {selectedId && <span className="ml-3 text-xs text-zinc-500">Ausgewählt: {selectedId.slice(0,8)}… (Entf zum Löschen)</span>}
      </div>
      <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-2">
        {error && <div className="m-2 rounded border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{error}</div>}
        <CandlesCanvas
          ref={canvasRef}
          points={data || []}
          loading={loading}
          indicators={inds}
          onHoverIndex={setHoverIdx}
          tool={tool}
          shapes={shapes}
          onShapesChange={onShapesChange}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        {!address && (
          <div className="p-4 text-sm text-zinc-500">
            Tipp: Füge eine Solana Contract Address (CA) ein und klicke <em>Load</em>.  
            Hotkeys: <kbd>1</kbd>=1m <kbd>2</kbd>=5m <kbd>3</kbd>=15m <kbd>4</kbd>=1h <kbd>5</kbd>=4h <kbd>6</kbd>=1d, <kbd>Enter</kbd>=Load
          </div>
        )}
        {!!address && (!data || data.length===0) && !loading && !error && (
          <div className="p-4 text-sm text-zinc-500">
            Keine OHLC-Daten für diese Adresse / Timeframe gefunden. Prüfe Address/TF oder versuche einen anderen Zeitraum.
          </div>
        )}
      </div>
    </div>
  );
}
