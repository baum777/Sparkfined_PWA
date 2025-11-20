import React from "react";
import { fmtNum, fmtTime } from "../../lib/format";
import type { Shape, ToolKind } from "./draw/types";
import { dist, distPointToSegment, snapPriceToOhlc } from "./draw/hit";

export type OhlcPoint = { t: number; o: number; h: number; l: number; c: number; v?: number };

export type IndicatorSets = {
  sma20?: Array<number | undefined>;
  ema20?: Array<number | undefined>;
  vwap?: Array<number | undefined>;
};

export type CanvasHandle = {
  exportPNG: () => string; // returns dataURL
};

const CandlesCanvas = React.forwardRef<CanvasHandle, {
  points: OhlcPoint[];
  loading: boolean;
  indicators?: IndicatorSets;
  onHoverIndex?: (idx: number | null) => void;
  tool?: ToolKind;
  shapes?: Shape[];
  onShapesChange?: (next: Shape[]) => void;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  view: { start: number; end: number };
  onViewChange: (v: { start: number; end: number }) => void;
  snap?: boolean;
  replayCursor?: number;
  hud?: React.ReactNode;
}>(({
  points, loading, indicators, onHoverIndex, tool = "cursor", shapes = [], onShapesChange, selectedId, onSelect, view, onViewChange, snap = true, replayCursor, hud
}, ref) => {
  const refCanvas = React.useRef<HTMLCanvasElement | null>(null);
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = React.useState<{ x: number; y: number } | null>(null);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const layoutRef = React.useRef<{ X0:number; X1:number; Y0:number; Y1:number; min:number; max:number; n:number; start:number; end:number } | null>(null);
  const [drag, setDrag] = React.useState<null | { id:string; handle:"line"|"a"|"b"; start:{x:number;y:number}; shape:Shape }>(null);
  const [panning, setPanning] = React.useState<null | { start:{x:number;y:number}; view:{start:number;end:number} }>(null);

  React.useEffect(() => {
    const el = refCanvas.current; if (!el) return;
    const ctx = el.getContext("2d"); if (!ctx) return;
    const DPR = Math.max(1, window.devicePixelRatio || 1);
    const Wcss = el.clientWidth;
    const Hcss = 360;
    el.width = Math.floor(Wcss * DPR);
    el.height = Math.floor(Hcss * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const W = Wcss;
    const H = Hcss;
    ctx.clearRect(0,0,W,H);
    // Background
    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0,0,W,H);
    // Axes paddings
    const padL = 56, padR = 10, padT = 10, padB = 20;
    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let i=1;i<6;i++){ const y = padT + ( (H - padT - padB)/6 )*i; ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-padR,y); ctx.stroke(); }
    const N = points?.length || 0;
    const start = Math.max(0, Math.min(view.start, Math.max(0, N - 1)));
    const end   = Math.max(start + 1, Math.min(view.end, N));
    const slice = points.slice(start, end);
    if (!slice.length) {
      // empty guide
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = "12px ui-sans-serif, system-ui";
      ctx.fillText("Keine Daten geladen.", padL+8, padT+24);
      return;
    }
    // Scales
    const min = Math.min(...slice.map(p=>p.l));
    const max = Math.max(...slice.map(p=>p.h));
    const span = Math.max(1e-12, max - min);
    const X0 = padL, X1 = W - padR, Y0 = padT, Y1 = H - padB;
    const n = slice.length;
    const cw = Math.max(2, ((X1 - X0) / n) * 0.7);
    layoutRef.current = { X0, X1, Y0, Y1, min, max, n, start, end };
    // Y labels (right)
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "11px ui-sans-serif, system-ui";
    for (let i=0;i<=4;i++){
      const y = Y0 + ((Y1 - Y0)/4)*i;
      const val = max - (span/4)*i;
      ctx.fillText(fmtNum(val), 6, y+3);
    }
    // Candles
    slice.forEach((p, i) => {
      const x = X0 + (i * (X1 - X0) / n);
      const yo = Y1 - ((p.o - min) * (Y1 - Y0) / span);
      const yc = Y1 - ((p.c - min) * (Y1 - Y0) / span);
      const yh = Y1 - ((p.h - min) * (Y1 - Y0) / span);
      const yl = Y1 - ((p.l - min) * (Y1 - Y0) / span);
      const up = p.c >= p.o;
      ctx.strokeStyle = up ? "#10B981" : "#F43F5E";
      ctx.fillStyle = up ? "#10B981" : "#F43F5E";
      // wick
      ctx.beginPath(); ctx.moveTo(x, yh); ctx.lineTo(x, yl); ctx.stroke();
      // body
      const bx = x - cw/2;
      const by = Math.min(yo, yc);
      const bh = Math.max(2, Math.abs(yo - yc));
      ctx.fillRect(bx, by, cw, bh);
    });
    // Indicators (lines)
    const drawLine = (series?: Array<number | undefined>, color = "#93C5FD") => {
      if (!series) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < n; i++) {
        const v = series[i + start];
        if (typeof v !== "number" || Number.isNaN(v)) continue;
        const x = X0 + (i * (X1 - X0) / n);
        const y = Y1 - ((v - min) * (Y1 - Y0) / span);
        if (!started) { ctx.moveTo(x, y); started = true; }
        else { ctx.lineTo(x, y); }
      }
      if (started) ctx.stroke();
    };
    drawLine(indicators?.sma20, "#7DD3FC");  // light cyan
    drawLine(indicators?.ema20, "#FBBF24");  // amber
    drawLine(indicators?.vwap,  "#A78BFA");  // violet
    // Crosshair + tooltip
    if (hover) {
      const { x: mx, y: my } = hover;
      // find nearest index
      const ratio = (mx - X0) / Math.max(1, (X1 - X0));
      const idxLocal = Math.min(n - 1, Math.max(0, Math.round(ratio * n)));
      const idx = start + idxLocal;
      if (idx !== hoverIdx) setHoverIdx(idx);
      const p = points[idx];
      if (!p) return; // Guard: ensure point exists
      const cx = X0 + (idxLocal * (X1 - X0) / n);
      const cy = Y1 - ((p.c - min) * (Y1 - Y0) / span);
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(cx, Y0); ctx.lineTo(cx, Y1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X0, cy); ctx.lineTo(X1, cy); ctx.stroke();
      ctx.setLineDash([]);
      // dot
      ctx.fillStyle = "#e5e5e5";
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI*2); ctx.fill();
      // tooltip
      const overlay = overlayRef.current;
      if (overlay) {
        overlay.style.display = "block";
        overlay.style.left = `${Math.min(X1-200, Math.max(X0, cx+12))}px`;
        overlay.style.top  = `${Math.max(Y0+8, cy-24)}px`;
        const smaV = indicators?.sma20?.[idx];
        const emaV = indicators?.ema20?.[idx];
        const vwapV = indicators?.vwap?.[idx];
        overlay.innerHTML = `
          <div class="rounded-md border border-zinc-700 bg-zinc-900/95 px-2 py-1 text-xs text-zinc-200 shadow">
            <div>${fmtTime(p.t ?? 0)}</div>
            <div>O ${fmtNum(p.o ?? 0)} H ${fmtNum(p.h ?? 0)} L ${fmtNum(p.l ?? 0)} C ${fmtNum(p.c ?? 0)}</div>
            <div class="mt-0.5">
              ${smaV != null ? `<span class="text-cyan-200">SMA20</span> ${fmtNum(smaV)}&nbsp;` : ""}
              ${emaV != null ? `<span class="text-amber-300">EMA20</span> ${fmtNum(emaV)}&nbsp;` : ""}
              ${vwapV != null ? `<span class="text-violet-300">VWAP</span> ${fmtNum(vwapV)}&nbsp;` : ""}
            </div>
          </div>`;
      }
    } else {
      const overlay = overlayRef.current;
      if (overlay) overlay.style.display = "none";
    }
    // Replay Cursor marker (falls aktiv)
    if (typeof replayCursor === "number" && replayCursor >= start && replayCursor < end) {
      const iLocal = replayCursor - start;
      const cx = X0 + (iLocal * (X1 - X0) / n);
      ctx.strokeStyle = "rgba(16,185,129,0.7)"; // emerald
      ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(cx, Y0); ctx.lineTo(cx, Y1); ctx.stroke();
      ctx.setLineDash([]);
    }
    // --- Drawings layer -----------------------------------------------------
    const pxY = (price:number) => Y1 - ((price - min) * (Y1 - Y0) / (Math.max(1e-12, max - min)));
    const pxX = (idx:number) => {
      const iLocal = (idx - start);
      return X0 + (iLocal * (X1 - X0) / Math.max(1, n));
    };
    const drawH = (y:number, color="#60A5FA") => { // blue-400
      ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([6,4]);
      ctx.beginPath(); ctx.moveTo(X0, y); ctx.lineTo(X1, y); ctx.stroke(); ctx.setLineDash([]);
    };
    const drawTrend = (ax:number, ay:number, bx:number, by:number, color="#F59E0B") => { // amber-500
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    };
    const drawFib = (a:{x:number,y:number}, b:{x:number,y:number}) => {
      const top = Math.min(a.y, b.y), bot = Math.max(a.y, b.y);
      const levels = [0, 0.236, 0.382, 0.5, 0.618, 1];
      ctx.lineWidth = 1;
      levels.forEach((lv,i) => {
        const y = bot - (bot - top) * lv;
        ctx.strokeStyle = i===3 ? "#E879F9" : "#C084FC"; // magenta highlight at 0.5
        ctx.setLineDash(i===3 ? [8,4] : [4,4]);
        ctx.beginPath(); ctx.moveTo(X0, y); ctx.lineTo(X1, y); ctx.stroke();
      });
      ctx.setLineDash([]);
    };
    // Persisted shapes + Selection/Handles
    shapes.forEach(s => {
      const sel = s.id === selectedId;
      if (s.kind === "hline") {
        const y = pxY(s.price);
        drawH(y, sel ? "#60A5FA" : "#94A3B8");
        if (sel) {
          // Handle rechts
          const hx = X1 - 8, hy = y;
          ctx.fillStyle = "#60A5FA";
          ctx.fillRect(hx-4, hy-4, 8, 8);
        }
      }
      if (s.kind === "trend") {
        const ax = pxX(s.a.idx), ay = pxY(s.a.price);
        const bx = pxX(s.b.idx), by = pxY(s.b.price);
        drawTrend(ax, ay, bx, by, sel ? "#F59E0B" : "#A8A29E");
        if (sel) {
          ctx.fillStyle = "#F59E0B";
          ctx.beginPath(); ctx.arc(ax, ay, 5, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI*2); ctx.fill();
        }
      }
      if (s.kind === "fib") {
        const a = { x:pxX(s.a.idx), y:pxY(s.a.price) };
        const b = { x:pxX(s.b.idx), y:pxY(s.b.price) };
        drawFib(a, b);
        if (sel) {
          ctx.fillStyle = "#C084FC";
          ctx.beginPath(); ctx.arc(a.x, a.y, 5, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI*2); ctx.fill();
        }
      }
    });
  }, [points, hover, indicators, hoverIdx, shapes, selectedId, view, replayCursor]);

  // Pointer events & resize
  React.useEffect(() => {
    const el = refCanvas.current; if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      setHover(pt);
      if (panning && layoutRef.current) {
        const L = layoutRef.current;
        const dx = pt.x - panning.start.x;
        const bars = Math.round(dx / Math.max(1, (L.X1 - L.X0)) * L.n);
        const N = (L.end - L.start);
        const newStart = Math.max(0, panning.view.start - bars);
        const maxStart = Math.max(0, (points.length - N));
        const clampedStart = Math.min(newStart, maxStart);
        onViewChange({ start: clampedStart, end: clampedStart + N });
      }
      // Dragging
      if (drag && layoutRef.current && onShapesChange) {
        const L = layoutRef.current;
        const mx = pt.x, my = pt.y;
        const dx = mx - drag.start.x;
        const dy = my - drag.start.y;
        // translate px delta ? data space
        const idxDelta = Math.round(dx / Math.max(1, (L.X1 - L.X0)) * L.n);
        const priceDelta = -dy / Math.max(1, (L.Y1 - L.Y0)) * (L.max - L.min);
        const s = drag.shape;
        let next: Shape | null = null;
        if (s.kind === "hline") {
          let newPrice = s.price + priceDelta;
          if (snap) {
            const idx = clampIdx(Math.round((mx - L.X0) / Math.max(1, (L.X1 - L.X0)) * L.n) + L.start, points.length);
            newPrice = snapPriceToOhlc(idx, newPrice, points as any).price ?? newPrice;
          }
          next = { ...s, price: newPrice, updatedAt: Date.now() };
        } else if (s.kind === "trend") {
          const mut = (pt:{idx:number;price:number}) => {
            let idx = clampIdx(pt.idx + idxDelta, points.length);
            let price = pt.price + priceDelta;
            if (snap) { const sres = snapPriceToOhlc(idx, price, points as any); idx = sres.idx; price = sres.price ?? price; }
            return { idx, price };
          };
          if (drag.handle === "a") next = { ...s, a: mut(s.a), updatedAt: Date.now() };
          else if (drag.handle === "b") next = { ...s, b: mut(s.b), updatedAt: Date.now() };
          else next = { ...s, a: mut(s.a), b: mut(s.b), updatedAt: Date.now() };
        } else if (s.kind === "fib") {
          const mut = (pt:{idx:number;price:number}) => {
            let idx = clampIdx(pt.idx + idxDelta, points.length);
            let price = pt.price + priceDelta;
            if (snap) { const sres = snapPriceToOhlc(idx, price, points as any); idx = sres.idx; price = sres.price ?? price; }
            return { idx, price };
          };
          if (drag.handle === "a") next = { ...s, a: mut(s.a), updatedAt: Date.now() };
          else if (drag.handle === "b") next = { ...s, b: mut(s.b), updatedAt: Date.now() };
          else next = { ...s, a: mut(s.a), b: mut(s.b), updatedAt: Date.now() };
        }
        if (next) {
          onShapesChange([next, ...shapes.filter(x => x.id !== next.id)]);
          setDrag({ ...drag, start: { x: mx, y: my }, shape: next });
        }
      }
    };
    const onLeave = () => setHover(null);
    const onDown = (e: MouseEvent) => {
      if (!layoutRef.current) return;
      const L = layoutRef.current;
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      // Start pan with Shift+Drag (cursor mode)
      if (tool === "cursor" && e.shiftKey) {
        setPanning({ start: { x: mx, y: my }, view });
        return;
      }
      // Selection / Drag start (if cursor mode)
      if (tool === "cursor") {
        // hit-test handles first
        const hit = hitTest(mx, my, L, shapes);
        if (onSelect) onSelect(hit?.id ?? null);
        if (hit && onShapesChange) {
          const base = shapes.find(s => s.id === hit.id)!;
          setDrag({ id: hit.id, handle: hit.handle, start: { x: mx, y: my }, shape: base });
        }
        return;
      }
    };
    const onClick = (e: MouseEvent) => {
      if (tool === "cursor" || !layoutRef.current || !onShapesChange) return;
      const L = layoutRef.current;
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const idx = Math.round((mx - L.X0) / Math.max(1, (L.X1 - L.X0)) * L.n);
      const price = L.max - ((my - L.Y0) / Math.max(1, (L.Y1 - L.Y0))) * (L.max - L.min);
      const now = Date.now();
      if (tool === "hline") {
        const h = { id: crypto.randomUUID(), kind: "hline" as const, price, createdAt: now, updatedAt: now };
        onShapesChange([h, ...shapes]);
        return;
      }
      if (tool === "trend") {
        // if last draft is trend with missing 'b', complete it; else start new
        const last = shapes.find(s => (s as any)._draft === true && s.kind === "trend") as any;
        if (last) {
          const done = { ...last, b: { idx, price }, updatedAt: now };
          delete done._draft;
          onShapesChange([done, ...shapes.filter(s => s.id !== last.id)]);
        } else {
          const draft: any = { id: crypto.randomUUID(), kind: "trend", a: { idx, price }, b: { idx, price }, createdAt: now, updatedAt: now, _draft: true };
          onShapesChange([draft, ...shapes]);
        }
        return;
      }
      if (tool === "fib") {
        const last = shapes.find(s => (s as any)._draft === true && s.kind === "fib") as any;
        if (last) {
          const done = { ...last, b: { idx, price }, updatedAt: now };
          delete done._draft;
          onShapesChange([done, ...shapes.filter(s => s.id !== last.id)]);
        } else {
          const draft: any = { id: crypto.randomUUID(), kind: "fib", a: { idx, price }, b: { idx, price }, createdAt: now, updatedAt: now, _draft: true };
          onShapesChange([draft, ...shapes]);
        }
        return;
      }
    };
    const onUp = () => { setDrag(null); setPanning(null); };
    const onWheel = (e: WheelEvent) => {
      if (!layoutRef.current) return;
      e.preventDefault();
      const L = layoutRef.current;
      const rect = el.getBoundingClientRect();
      const mx = (e.clientX ?? rect.left + rect.width/2) - rect.left;
      const ratio = (mx - L.X0) / Math.max(1, (L.X1 - L.X0));
      const centerLocal = Math.min(L.n - 1, Math.max(0, Math.round(ratio * L.n)));
      const center = L.start + centerLocal;
      const N = Math.max(20, L.end - L.start);
      const factor = e.deltaY < 0 ? 0.9 : 1.1;
      const newN = Math.max(20, Math.min(points.length, Math.round(N * factor)));
      let start = Math.round(center - newN / 2);
      let end = start + newN;
      if (start < 0) { start = 0; end = newN; }
      if (end > points.length) { end = points.length; start = end - newN; }
      onViewChange({ start, end });
    };
    const ro = new ResizeObserver(() => { setHover((h)=>h?{...h}:h); }); // redraw on resize
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mousedown", onDown);
    el.addEventListener("click", onClick);
    window.addEventListener("mouseup", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    ro.observe(el);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("click", onClick);
      window.removeEventListener("mouseup", onUp);
      el.removeEventListener("wheel", onWheel as any);
      ro.disconnect();
    };
  }, [tool, shapes, onShapesChange, drag, onSelect, panning, view, points.length, onViewChange, selectedId, snap]);

  // bubble index up (for external UI if needed)
  React.useEffect(() => {
    onHoverIndex?.(hover ? hoverIdx : null);
  }, [hover, hoverIdx, onHoverIndex]);

  // expose PNG export
  React.useImperativeHandle(ref, () => ({
    exportPNG() {
      const el = refCanvas.current;
      if (!el) return "";
      return el.toDataURL("image/png");
    }
  }), []);

  const cursor =
    tool !== "cursor" ? "crosshair" :
    panning ? "grabbing" : "grab";

  return (
    <div className="relative">
      <canvas ref={refCanvas} className={`block w-full rounded-xl bg-zinc-950 ${cursor === "grabbing" ? "cursor-grabbing" : cursor === "crosshair" ? "cursor-crosshair" : "cursor-grab"}`} />
      <div ref={overlayRef} className="pointer-events-none absolute" />
      {/** external HUD overlay (ReplayHud, etc.) */}
      {hud && <div className="pointer-events-none absolute inset-0">{hud}</div>}
      {loading && <div className="absolute inset-0 grid place-items-center text-sm text-zinc-400">Lade Daten?</div>}
    </div>
  );
});

CandlesCanvas.displayName = "CandlesCanvas";
export default CandlesCanvas;

// --- helpers ----------------------------------------------------------------
function clampIdx(i:number, n:number) { return Math.max(0, Math.min(n-1, i)); }

function hitTest(mx:number, my:number, L:{X0:number;X1:number;Y0:number;Y1:number;min:number;max:number;n:number}, shapes:Shape[]) {
  // return closest hit within tolerance: handles first, then line body
  const tol = 8; // px handle; 6-10px is fine
  const pxX = (idx:number) => L.X0 + (idx * (L.X1 - L.X0) / Math.max(1, L.n));
  const pxY = (price:number) => L.Y1 - ((price - L.min) * (L.Y1 - L.Y0) / Math.max(1e-12, (L.max - L.min)));
  let best: null | { id:string; handle:"line"|"a"|"b"; d:number } = null;
  for (const s of shapes) {
    if (s.kind === "hline") {
      const y = pxY(s.price);
      // handle at right
      const dHandle = Math.max(Math.abs((L.X1-8) - mx), Math.abs(y - my));
      if (dHandle <= tol) { best = { id:s.id, handle:"line", d: dHandle }; continue; }
      // near line
      if (Math.abs(y - my) <= 6) {
        const d = Math.abs(y - my);
        if (!best || d < best.d) best = { id:s.id, handle:"line", d };
      }
    }
    if (s.kind === "trend" || s.kind === "fib") {
      const ax = pxX(s.a.idx), ay = pxY(s.a.price);
      const bx = pxX(s.b.idx), by = pxY(s.b.price);
      // handles
      if (dist({x:mx,y:my},{x:ax,y:ay}) <= tol) { best = { id:s.id, handle:"a", d:0 }; continue; }
      if (dist({x:mx,y:my},{x:bx,y:by}) <= tol) { best = { id:s.id, handle:"b", d:0 }; continue; }
      // line body
      const d = distPointToSegment({x:mx,y:my},{x:ax,y:ay},{x:bx,y:by});
      if (d <= 6 && (!best || d < best.d)) best = { id:s.id, handle:"line", d };
    }
  }
  return best;
}
