import React from "react";
import { fmtNum, fmtTime } from "../../lib/format";

export type OhlcPoint = { t: number; o: number; h: number; l: number; c: number; v?: number };

export type IndicatorSets = {
  sma20?: Array<number | undefined>;
  ema20?: Array<number | undefined>;
  vwap?: Array<number | undefined>;
};

export default function CandlesCanvas({
  points, loading, indicators, onHoverIndex
}: {
  points: OhlcPoint[];
  loading: boolean;
  indicators?: IndicatorSets;
  onHoverIndex?: (idx: number | null) => void;
}) {
  const ref = React.useRef<HTMLCanvasElement | null>(null);
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = React.useState<{ x: number; y: number } | null>(null);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    const el = ref.current; if (!el) return;
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
    if (!points?.length) {
      // empty guide
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = "12px ui-sans-serif, system-ui";
      ctx.fillText("Keine Daten geladen.", padL+8, padT+24);
      return;
    }
    // Scales
    const min = Math.min(...points.map(p=>p.l));
    const max = Math.max(...points.map(p=>p.h));
    const span = Math.max(1e-12, max - min);
    const X0 = padL, X1 = W - padR, Y0 = padT, Y1 = H - padB;
    const n = points.length;
    const cw = Math.max(2, ((X1 - X0) / n) * 0.7);
    // Y labels (right)
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "11px ui-sans-serif, system-ui";
    for (let i=0;i<=4;i++){
      const y = Y0 + ((Y1 - Y0)/4)*i;
      const val = max - (span/4)*i;
      ctx.fillText(fmtNum(val), 6, y+3);
    }
    // Candles
    points.forEach((p, i) => {
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
        const v = series[i];
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
      const idx = Math.min(n - 1, Math.max(0, Math.round(ratio * n)));
      if (idx !== hoverIdx) setHoverIdx(idx);
      const p = points[idx];
      const cx = X0 + (idx * (X1 - X0) / n);
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
            <div>${fmtTime(p.t)}</div>
            <div>O ${fmtNum(p.o)} H ${fmtNum(p.h)} L ${fmtNum(p.l)} C ${fmtNum(p.c)}</div>
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
  }, [points, hover, indicators, hoverIdx]);

  // Pointer events & resize
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      setHover(pt);
    };
    const onLeave = () => setHover(null);
    const ro = new ResizeObserver(() => { setHover((h)=>h?{...h}:h); }); // redraw on resize
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    ro.observe(el);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      ro.disconnect();
    };
  }, []);

  // bubble index up (for external UI if needed)
  React.useEffect(() => {
    onHoverIndex?.(hover ? hoverIdx : null);
  }, [hover, hoverIdx, onHoverIndex]);

  return (
    <div className="relative">
      <canvas ref={ref} className="block w-full rounded-xl bg-zinc-950" />
      <div ref={overlayRef} className="pointer-events-none absolute" />
      {loading && <div className="absolute inset-0 grid place-items-center text-sm text-zinc-400">Lade Daten…</div>}
    </div>
  );
}
