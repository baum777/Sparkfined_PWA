import React from "react";
import ChartHeader from "../sections/chart/ChartHeader";
import CandlesCanvas, { type CanvasHandle } from "../sections/chart/CandlesCanvas";
import { fetchOhlc, type OhlcPoint } from "../sections/chart/marketOhlc";
import IndicatorBar, { type IndicatorState } from "../sections/chart/IndicatorBar";
import { sma, ema, vwap } from "../sections/chart/indicators";
import DrawToolbar from "../sections/chart/draw/DrawToolbar";
import type { Shape, ToolKind } from "../sections/chart/draw/types";
import ZoomPanBar from "../sections/chart/ZoomPanBar";
import MiniMap from "../sections/chart/MiniMap";
import { exportWithHud } from "../sections/chart/export";
import { encodeState, decodeState } from "../lib/urlState";
import ReplayBar from "../sections/chart/ReplayBar";
import { useReplay } from "../sections/chart/replay/useReplay";
import type { Bookmark } from "../sections/chart/replay/types";
import ReplayHud from "../sections/chart/replay/ReplayHud";
import Timeline from "../sections/chart/Timeline";
import { useEvents } from "../sections/chart/events/useEvents";

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
  const [snap, setSnap] = React.useState<boolean>(true);
  const [view, setView] = React.useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>(() => {
    try { return JSON.parse(localStorage.getItem("sparkfined.bookmarks.v1") || "[]"); } catch { return []; }
  });
  const { events, addBookmarkEvent, clearEvents } = useEvents();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

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
  // Reset view to full range when data loads
  React.useEffect(() => {
    if (data && data.length) setView({ start: 0, end: data.length });
  }, [data]);
  // Persist bookmarks
  React.useEffect(() => { localStorage.setItem("sparkfined.bookmarks.v1", JSON.stringify(bookmarks)); }, [bookmarks]);

  // --- Permalink: beim Mount lesen, bei Änderungen schreiben ----------------
  React.useEffect(() => {
    // READ once on mount
    const url = new URL(window.location.href);
    const raw = url.searchParams.get("chart");
    const st = decodeState<any>(raw);
    if (st) {
      if (st.address) setAddress(String(st.address));
      if (st.tf) setTf(st.tf);
      if (st.view) setView(st.view);
      if (typeof st.snap === "boolean") setSnap(st.snap);
      if (st.indState) setIndState(st.indState);
      if (Array.isArray(st.shapes)) setShapes(st.shapes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    // WRITE on state change (replaceState, kein History-Spam)
    const state = { address, tf, view, snap, indState, shapes };
    const url = new URL(window.location.href);
    url.searchParams.set("chart", encodeState(state));
    window.history.replaceState(null, "", url.toString());
  }, [address, tf, view, snap, indState, shapes]);

  // --- Replay ---------------------------------------------------------------
  const replay = useReplay(data || []);
  // Match view to replay cursor when playing
  React.useEffect(() => {
    if (!data?.length || !replay.state.isPlaying) return;
    const cursor = Math.floor(replay.state.cursor);
    const span = Math.max(20, view.end - view.start);
    if (cursor < view.start + 5 || cursor > view.end - 5) {
      const start = Math.max(0, Math.min(cursor - Math.floor(span*0.7), Math.max(0, data.length - span)));
      setView({ start, end: start + span });
    }
  }, [replay.state.cursor, replay.state.isPlaying, data?.length]);

  const onStep = (dir: -1|1, size = 1) => {
    if (!data?.length) return;
    const next = Math.max(0, Math.min(data.length - 1, Math.floor(replay.state.cursor) + dir * size));
    replay.setCursor(next);
    // optional: view follow when paused
    if (!replay.state.isPlaying) {
      const span = Math.max(20, view.end - view.start);
      if (next < view.start + 5 || next > view.end - 5) {
        const start = Math.max(0, Math.min(next - Math.floor(span*0.5), Math.max(0, data.length - span)));
        setView({ start, end: start + span });
      }
    }
  };

  const onJumpTimestamp = (t: number) => {
    if (!data?.length) return;
    const idx = data.findIndex(p => p.t === t);
    if (idx >= 0) {
      replay.setCursor(idx);
      const span = Math.max(20, view.end - view.start);
      const start = Math.max(0, Math.min(idx - Math.floor(span*0.5), Math.max(0, data.length - span)));
      setView({ start, end: start + span });
    }
  };

  const addBookmark = (label?: string) => {
    if (!data?.length) return;
    const idx = Math.floor(replay.state.cursor);
    const b = { id: crypto.randomUUID(), t: data[idx].t, label, createdAt: Date.now() };
    setBookmarks(bs => [b, ...bs].slice(0, 100));
    addBookmarkEvent(b.t, { label });
  };
  const deleteBookmark = (id: string) => setBookmarks(bs => bs.filter(b => b.id !== id));

  // persist drawings
  React.useEffect(() => {
    localStorage.setItem("sparkfined.draw.v1", JSON.stringify(shapes));
  }, [shapes]);

  // hotkeys for tools / undo-redo / replay
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Jump-to-Bookmark (1..6)
      if (!isNaN(Number(e.key)) && Number(e.key) >= 1 && Number(e.key) <= 6 && bookmarks[Number(e.key)-1]) {
        onJumpTimestamp(bookmarks[Number(e.key)-1].t);
        return;
      }
      if (e.key === "ArrowLeft") { e.preventDefault(); onStep(-1, e.shiftKey ? 10 : 1); }
      if (e.key === "ArrowRight"){ e.preventDefault(); onStep( 1, e.shiftKey ? 10 : 1); }
      if (e.code === "Space") { e.preventDefault(); replay.state.isPlaying ? replay.stop() : replay.start(); }
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
  }, [selectedId, shapes, bookmarks, replay.state.isPlaying]);

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
  // Export PNG with HUD (Header + Branding)
  const onExportPngHud = () => {
    const host = document.querySelector("canvas");
    if (!(host instanceof HTMLCanvasElement)) return;
    const dataUrl = exportWithHud(host, {
      title: address ? `CA ${address.slice(0,6)}…${address.slice(-6)}` : "Sparkfined Chart",
      timeframe: tf,
      rangeText,
      brand: "$CRYPTOBER",
      theme: "dark",
    });
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `chart-hud-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const onCopyPngHud = async () => {
    const host = document.querySelector("canvas");
    if (!(host instanceof HTMLCanvasElement)) return;
    const dataUrl = exportWithHud(host, {
      title: address ? `CA ${address.slice(0,6)}…${address.slice(-6)}` : "Sparkfined Chart",
      timeframe: tf,
      rangeText,
      brand: "$CRYPTOBER",
      theme: "dark",
    });
    const blob = await (await fetch(dataUrl)).blob();
    // Clipboard API (sicherer Kontext required: https)
    if (navigator.clipboard && (window as any).ClipboardItem) {
      await navigator.clipboard.write([new (window as any).ClipboardItem({ [blob.type]: blob })]);
      alert("Screenshot (HUD) in die Zwischenablage kopiert.");
    } else {
      alert("Clipboard-API nicht verfügbar – bitte Datei herunterladen.");
    }
  };
  // Session Export/Import (JSON)
  const onExportJSON = () => {
    const payload = {
      ts: new Date().toISOString(),
      address, tf,
      view, snap,
      indState,
      shapes
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sparkfined-session-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  const onImportJSON = async (file: File) => {
    const text = await file.text();
    const json = JSON.parse(text);
    if (json.address) setAddress(String(json.address));
    if (json.tf) setTf(json.tf);
    if (json.view) setView(json.view);
    if (typeof json.snap === "boolean") setSnap(json.snap);
    if (json.indState) setIndState(json.indState);
    if (Array.isArray(json.shapes)) setShapes(json.shapes);
  };
  // Zoom/Pan helpers (10% steps)
  const zoomStep = (factor: number) => {
    if (!data || !data.length) return;
    const len = Math.max(20, view.end - view.start);
    const center = view.start + len / 2;
    const newLen = Math.max(20, Math.min(data.length, Math.round(len * factor)));
    let start = Math.round(center - newLen / 2);
    let end = start + newLen;
    if (start < 0) { start = 0; end = newLen; }
    if (end > data.length) { end = data.length; start = end - newLen; }
    setView({ start, end });
  };
  const onZoomIn  = () => zoomStep(0.85);
  const onZoomOut = () => zoomStep(1.15);
  const onReset   = () => { if (data) setView({ start: 0, end: data.length }); };
  const rangeText = React.useMemo(() => {
    if (!data || !data.length) return "";
    const a = data[Math.max(0, Math.min(view.start, data.length - 1))]?.t;
    const b = data[Math.max(0, Math.min(view.end - 1, data.length - 1))]?.t;
    if (!a || !b) return "";
    const fmt = new Intl.DateTimeFormat(undefined, { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" });
    return `${fmt.format(new Date(a))} – ${fmt.format(new Date(b))} (${view.end - view.start} bars)`;
  }, [data, view]);

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
      <ZoomPanBar
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onReset={onReset}
        snap={snap}
        onToggleSnap={() => setSnap(s => !s)}
        rangeText={rangeText}
      />
      <ReplayBar
        isPlaying={replay.state.isPlaying}
        speed={replay.state.speed}
        onPlay={()=>replay.start(Math.max(view.start, Math.min(view.end-1, Math.floor(replay.state.cursor))))}
        onPause={replay.stop}
        onSpeed={replay.setSpeed}
        onStep={onStep}
        onJump={onJumpTimestamp}
        bookmarks={bookmarks}
        onAddBookmark={addBookmark}
        onDeleteBookmark={deleteBookmark}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button onClick={onExportPngHud} className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800">Export PNG (HUD)</button>
        <button onClick={onCopyPngHud}  className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800">Copy PNG (HUD)</button>
        <button onClick={onExportJSON} className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800">
          Export Session (JSON)
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => { const f = e.currentTarget.files?.[0]; if (f) onImportJSON(f); e.currentTarget.value = ""; }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
        >
          Import Session (JSON)
        </button>
        {selectedId && (
          <>
            <span className="ml-1 text-xs text-zinc-500">Ausgewählt: {selectedId.slice(0,8)}…</span>
            <button
              onClick={() => { pushHistory(shapes); setShapes(shapes.filter(s => s.id !== selectedId)); setSelectedId(null); }}
              className="ml-2 rounded-lg border border-rose-800 px-2 py-1 text-xs text-rose-100 hover:bg-rose-900/30"
            >
              Löschen
            </button>
          </>
        )}
      </div>
      {/* Mini-Map Navigator */}
      <div className="mt-3">
        <MiniMap points={data || []} view={view} onViewChange={setView} />
      </div>
      {/* Event Timeline (Alerts, Bookmarks) */}
      <div className="mt-3">
        <Timeline points={data || []} view={view} events={events} onJump={onJumpTimestamp} />
        <div className="mt-1">
          <button onClick={clearEvents} className="rounded-lg border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800">Events leeren</button>
        </div>
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
          view={view}
          onViewChange={setView}
          snap={snap}
          replayCursor={Math.floor(replay.state.cursor)}
          hud={
            data && data.length
              ? <ReplayHud
                  playing={replay.state.isPlaying}
                  speed={replay.state.speed}
                  cursor={Math.floor(replay.state.cursor)}
                  total={data.length}
                  point={data[Math.floor(replay.state.cursor)]}
                  title={address ? `CA ${address.slice(0,6)}…${address.slice(-6)} · TF ${tf}` : undefined}
                />
              : null
          }
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
