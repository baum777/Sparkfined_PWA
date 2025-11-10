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
import { encodeToken, decodeToken } from "../lib/shortlink";
import { decodeRuleToken, type TestRulePayload } from "../lib/ruleToken";
import TestOverlay, { type Hit as TestHit } from "../sections/chart/TestOverlay";
import ReplayBar from "../sections/chart/ReplayBar";
import { useReplay } from "../sections/chart/replay/useReplay";
import type { Bookmark } from "../sections/chart/replay/types";
import ReplayHud from "../sections/chart/replay/ReplayHud";
import Timeline from "../sections/chart/Timeline";
import { useEvents } from "../sections/chart/events/useEvents";
import { runBacktest, type BacktestResult, type AlertRule } from "../sections/chart/backtest";
import BacktestPanel from "../sections/chart/BacktestPanel";
import { useSettings } from "../state/settings";
import { useTelemetry } from "../state/telemetry";
import { getSession } from "../lib/ReplayService";
import { getEntry } from "../lib/JournalService";
import type { ChartState } from "@/types/journal";

export default function ChartPage() {
  const { settings } = useSettings();
  const { enqueue } = useTelemetry();
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
  const [snap, setSnap] = React.useState<boolean>(settings.snapDefault);
  const [view, setView] = React.useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>(() => {
    try { return JSON.parse(localStorage.getItem("sparkfined.bookmarks.v1") || "[]"); } catch { return []; }
  });
  const { events, addBookmarkEvent, clearEvents } = useEvents();
  const [btResult, setBtResult] = React.useState<BacktestResult | null>(null);
  const [btServerMs, setBtServerMs] = React.useState<number | null>(null);
  const [btPage, setBtPage] = React.useState(0);
  const [btHasMore, setBtHasMore] = React.useState(false);
  const [testHits, setTestHits] = React.useState<TestHit[]>([]);
  const [testActive, setTestActive] = React.useState(false);
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
    // READ once on mount - shortlink has priority
    const url = new URL(window.location.href);
    const tok = url.searchParams.get("short");
    
    // A) Replay Session: ?replaySession=<id> - highest priority
    const replaySessionId = url.searchParams.get("replaySession");
    if (replaySessionId) {
      loadReplaySession(replaySessionId);
      return;
    }
    
    // B) Test-Modus: ?test=<token>
    const testTok = url.searchParams.get("test");
    if (testTok) {
      const payload = decodeRuleToken(testTok);
      if (payload) {
        setAddress(payload.address || "");
        setTf((payload.tf as any) || "15m");
        // wir deferen den eigentlichen Test-Run, bis Daten geladen sind (unten)
        (window as any).__PENDING_TEST_RULE__ = payload;
      }
    } else if (tok) {
      const obj = decodeToken(tok) as any;
      if (obj && obj.chart) {
        try {
          if (obj.chart.address) setAddress(String(obj.chart.address));
          if (obj.chart.tf) setTf(obj.chart.tf);
          if (obj.chart.view) setView(obj.chart.view);
          if (typeof obj.chart.snap === "boolean") setSnap(obj.chart.snap);
          if (obj.chart.indState) setIndState(obj.chart.indState);
          if (Array.isArray(obj.chart.shapes)) setShapes(obj.chart.shapes);
        } catch (err) {
          console.error('Failed to parse saved chart state:', err);
        }
      }
    } else {
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
    }
  }, []); // Only run once on mount
  
  // Load chart state from replay session
  const loadReplaySession = React.useCallback(async (sessionId: string) => {
    try {
      const session = await getSession(sessionId);
      if (!session) {
        console.error("Replay session not found:", sessionId);
        return;
      }

      // If session has cached OHLC, use it
      if (session.ohlcCache && session.ohlcCache.length > 0) {
        setData(session.ohlcCache as OhlcPoint[]);
      }

      // If session is linked to journal entry, load chart state
      if (session.journalEntryId) {
        const entry = await getEntry(session.journalEntryId);
        if (entry?.chartSnapshot?.state) {
          const chartState = entry.chartSnapshot.state;
          
          // Restore chart state
          if (chartState.address) setAddress(chartState.address);
          if (chartState.timeframe) setTf(chartState.timeframe as any);
          if (chartState.view) setView(chartState.view);
          
          // Restore indicators
          if (chartState.indicators) {
            const newIndState: IndicatorState = { sma20: false, ema20: false, vwap: false };
            chartState.indicators.forEach(ind => {
              if (ind.type === "sma" && ind.enabled) newIndState.sma20 = true;
              if (ind.type === "ema" && ind.enabled) newIndState.ema20 = true;
              if (ind.type === "vwap" && ind.enabled) newIndState.vwap = true;
            });
            setIndState(newIndState);
          }
          
          // Restore shapes (drawings)
          // Note: chartState.shapes might have different structure than Shape[]
          // For now, skip shapes restoration to avoid type errors
          // TODO: Map chartState.shapes to proper Shape[] format
          // if (chartState.shapes) {
          //   setShapes(chartState.shapes as Shape[]);
          // }
        }
      }

      console.log("✅ Loaded replay session:", session.name || sessionId);
    } catch (error) {
      console.error("Error loading replay session:", error);
    }
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
  // apply default replay speed from settings
  React.useEffect(() => {
    replay.setSpeed(settings.replaySpeed);
  }, [settings.replaySpeed, replay]);
  // Match view to replay cursor when playing
  React.useEffect(() => {
    if (!data?.length || !replay.state.isPlaying) return;
    const cursor = Math.floor(replay.state.cursor);
    const span = Math.max(20, view.end - view.start);
    if (cursor < view.start + 5 || cursor > view.end - 5) {
      const start = Math.max(0, Math.min(cursor - Math.floor(span*0.7), Math.max(0, data.length - span)));
      setView({ start, end: start + span });
    }
  }, [replay.state.cursor, replay.state.isPlaying, data?.length, view.start, view.end]);

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
    const point = data[idx];
    if (!point) return;
    const b = { id: crypto.randomUUID(), t: point.t, label, createdAt: Date.now() };
    setBookmarks(bs => [b, ...bs].slice(0, 100));
    addBookmarkEvent(b.t, { label });
    enqueue({ id: crypto.randomUUID(), ts: Date.now(), type: "user.bookmark.add", attrs: { t: b.t, label } } as any);
  };
  const deleteBookmark = (id: string) => setBookmarks(bs => bs.filter(b => b.id !== id));

  // Collect alert rules from localStorage (client-side rules built earlier)
  const alertKey = "sparkfined.alerts.v1";
  const readRules = (): AlertRule[] => {
    try {
      const raw = JSON.parse(localStorage.getItem(alertKey) || "[]");
      // Normalize minimal subset needed for backtest
      return (raw as any[]).map((r, idx) => {
        if (r.kind === "price-cross") return { id: r.id || `pc-${idx}`, kind:"price-cross", op:r.op || ">", value:Number(r.value) } as AlertRule;
        if (r.kind === "pct-change-24h") return { id: r.id || `pct-${idx}`, kind:"pct-change-24h", op:r.op || ">", value:Number(r.value) } as AlertRule;
        return null;
      }).filter(Boolean) as AlertRule[];
    } catch { return []; }
  };

  const runBt = () => {
    if (!data?.length) return;
    const rules = readRules();
    const res = runBacktest({ ohlc: data, rules, fromIdx: view.start, toIdx: view.end });
    setBtResult(res);
    // push events to timeline for playback
    res.hits.forEach(h => addBookmarkEvent(h.t, { ruleId:h.ruleId, kind:h.kind, c:h.c }));
  };

  // Wenn Daten geladen & pending Test vorhanden → Backtest (Server) mit Single-Rule ausführen
  React.useEffect(() => {
    const pending = (window as any).__PENDING_TEST_RULE__ as TestRulePayload | undefined;
    if (!pending || !data?.length) return;
    (async () => {
      const body = {
        ohlc: data,
        rules: [pending.rule],
        fromIdx: 0,
        toIdx: data.length,
        tf
      };
      const res = await fetch("/api/backtest", {
        method:"POST",
        headers:{ "content-type":"application/json" },
        body: JSON.stringify(body)
      }).then((r): any=>r.json()).catch((): any=>null);
      if (res?.ok) {
        setTestHits(res.hits || []);
        setTestActive(true);
        // Optional: Marker in Timeline einstreuen
        (res.hits || []).forEach((h:any) => addBookmarkEvent(h.t, { ruleId:h.ruleId, kind:h.kind, c:h.c, test:true }));
      }
      (window as any).__PENDING_TEST_RULE__ = undefined;
    })();
  }, [data, tf, addBookmarkEvent]); // Include callback in deps

  const clearTest = () => {
    setTestHits([]);
    setTestActive(false);
    // Optional: Test-Bookmarks entfernen, falls du dafür ein Flag gesetzt hast
  };

  const runBtServer = async (opts?: { page?: number }) => {
    if (!data?.length) return;
    const rules = readRules();
    const t0 = performance.now();
    const res = await fetch("/api/backtest", {
      method:"POST",
      headers:{ "content-type":"application/json" },
      body: JSON.stringify({
        ohlc: data, rules,
        fromIdx: view.start, toIdx: view.end,
        tf, page: opts?.page ?? 0, pageSize: 500
      })
    }).then((r): any=>r.json()).catch((): any=>null);
    const t1 = performance.now();
    if (!res || !res.ok) { alert("Server Backtest Fehler"); return; }
    setBtServerMs(res.ms ?? Math.round(t1 - t0));
    setBtResult({ hits: res.hits, perRule: res.perRule });
    setBtPage(res.page ?? 0);
    setBtHasMore(!!res.hasMore);
    res.hits.forEach((h:any) => addBookmarkEvent(h.t, { ruleId:h.ruleId, kind:h.kind, c:h.c }));
  };

  // persist drawings
  React.useEffect(() => {
    localStorage.setItem("sparkfined.draw.v1", JSON.stringify(shapes));
  }, [shapes]);

  // hotkeys for tools / undo-redo / replay
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Jump-to-Bookmark (1..6)
      const keyNum = Number(e.key);
      const bookmark = bookmarks[keyNum - 1];
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 6 && bookmark) {
        onJumpTimestamp(bookmark.t);
        return;
      }
      if (e.key === "ArrowLeft") { e.preventDefault(); onStep(-1, e.shiftKey ? 10 : 1); return; }
      if (e.key === "ArrowRight"){ e.preventDefault(); onStep( 1, e.shiftKey ? 10 : 1); return; }
      if (e.code === "Space") { 
        e.preventDefault(); 
        if (replay.state.isPlaying) {
          replay.stop();
        } else {
          replay.start();
        }
        return; 
      }
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
      const prevShapes = u[0];
      if (prevShapes) {
        setRedo(r => [shapes, ...r].slice(0, 100));
        setShapes(prevShapes);
      }
      return u.slice(1);
    });
  };
  const doRedo = () => {
    setRedo(r => {
      if (!r.length) return r;
      const nextShapes = r[0];
      if (nextShapes) {
        setUndo(u => [shapes, ...u].slice(0, 100));
        setShapes(nextShapes);
      }
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
  const onCopyShortlink = async () => {
    const state = { address, tf, view, snap, indState, shapes };
    const token = encodeToken({ chart: state });
    const url = `${location.origin}/chart?short=${token}`;
    await navigator.clipboard.writeText(url);
    alert("Shortlink kopiert");
  };
  // Quick Add to Journal: Snapshot + Permalink
  const onSaveToJournal = async () => {
    const host = document.querySelector("canvas");
    if (!(host instanceof HTMLCanvasElement)) return;
    const dataUrl = exportWithHud(host, {
      title: address ? `CA ${address.slice(0,6)}…${address.slice(-6)}` : "Sparkfined Chart",
      timeframe: tf,
      rangeText,
      brand: "$CRYPTOBER",
      theme: "dark",
    });
    const url = new URL(window.location.href);
    const state = { address, tf, view, snap, indState, shapes };
    url.searchParams.set("chart", encodeState(state));
    const permalink = url.toString();
    // broadcast draft payload for Journal page to pick up (lightweight bus)
    window.dispatchEvent(new CustomEvent("journal:draft", { detail: { screenshotDataUrl: dataUrl, permalink, address, tf } }));
    alert("Journal-Entwurf vorbereitet. Wechsle zum Journal-Tab, der Entwurf ist vorausgefüllt.");
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
    <div className="mx-auto max-w-6xl px-4 py-4 pb-20 md:py-6 md:pb-6">
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
        <button onClick={onCopyShortlink} className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800">Copy Shortlink</button>
        <button onClick={onSaveToJournal} className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800">→ Journal (Snapshot)</button>
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
      {settings.showMinimap && (
        <div className="mt-3">
          <MiniMap points={data || []} view={view} onViewChange={setView} />
        </div>
      )}
      {/* Event Timeline (Alerts, Bookmarks) */}
      {settings.showTimeline && (
        <div className="mt-3">
          <Timeline points={data || []} view={view} events={events} onJump={onJumpTimestamp} />
          <div className="mt-1">
            <button onClick={clearEvents} className="rounded-lg border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800">Events leeren</button>
          </div>
        </div>
      )}
      {/* Backtesting Panel */}
      <BacktestPanel
        rulesCount={readRules().length}
        onRun={runBt}
        result={btResult}
        onJump={onJumpTimestamp}
        onServerRun={()=>runBtServer({ page: 0 })}
        serverMs={btServerMs}
        paging={{
          page: btPage,
          hasMore: btHasMore,
          next: () => runBtServer({ page: btPage + 1 }),
          prev: () => runBtServer({ page: Math.max(0, btPage - 1) }),
        }}
      />
      {testActive && <TestOverlay hits={testHits} onClear={clearTest} />}
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
            settings.showHud && data && data.length
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
