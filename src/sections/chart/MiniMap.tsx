import React from "react";
import type { OhlcPoint } from "./CandlesCanvas";

export default function MiniMap({
  points, view, onViewChange
}: {
  points: OhlcPoint[];
  view: { start: number; end: number };
  onViewChange: (v: { start: number; end: number }) => void;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [drag, setDrag] = React.useState<null | { startX:number; startView:{start:number;end:number}; mode:"move"|"resize-l"|"resize-r" }>(null);
  const W = 800; const H = 80;

  const clamp = (s:number,e:number,len:number) => {
    const span = Math.max(20, e - s);
    s = Math.max(0, Math.min(s, len - span));
    e = s + span;
    return { start:s, end:e };
  };

  React.useEffect(() => {
    const el = canvasRef.current; if (!el) return;
    const ctx = el.getContext("2d"); if (!ctx) return;
    el.width = W; el.height = H;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = "#0b0b0b"; ctx.fillRect(0,0,W,H);
    if (!points?.length) {
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "11px ui-sans-serif, system-ui";
      ctx.fillText("Mini-Map: keine Daten", 10, 20);
      return;
    }
    // sparkline (Close)
    const min = Math.min(...points.map(p=>p.l));
    const max = Math.max(...points.map(p=>p.h));
    const span = Math.max(1e-12, max-min);
    ctx.strokeStyle = "#6EE7B7"; // emerald-300
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i=0;i<points.length;i++){
      const x = (i / Math.max(1, points.length - 1)) * (W-2) + 1;
      const y = (1 - (points[i].c - min)/span) * (H-2) + 1;
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.stroke();
    // selection window
    const len = points.length;
    const x0 = (view.start / Math.max(1, len)) * W;
    const x1 = (view.end   / Math.max(1, len)) * W;
    // shade outside
    ctx.fillStyle = "rgba(148,163,184,0.35)"; // slate-400 alpha
    ctx.fillRect(0,0,Math.max(0,x0),H);
    ctx.fillRect(Math.min(W,x1),0,Math.max(0,W-x1),H);
    // window
    ctx.fillStyle = "rgba(96,165,250,0.20)"; // blue-400 alpha
    ctx.fillRect(x0,0,Math.max(10,x1-x0),H);
    // grips
    ctx.fillStyle = "#93C5FD";
    ctx.fillRect(x0-2,0,4,H);
    ctx.fillRect(x1-2,0,4,H);
  }, [points, view]);

  React.useEffect(() => {
    const el = canvasRef.current; if (!el) return;
    const onDown = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const len = points.length || 1;
      const x0 = (view.start / Math.max(1, len)) * W;
      const x1 = (view.end   / Math.max(1, len)) * W;
      const nearL = Math.abs(x - x0) <= 6;
      const nearR = Math.abs(x - x1) <= 6;
      const inside = x > x0 && x < x1;
      if (nearL) setDrag({ startX:x, startView:view, mode:"resize-l" });
      else if (nearR) setDrag({ startX:x, startView:view, mode:"resize-r" });
      else if (inside) setDrag({ startX:x, startView:view, mode:"move" });
    };
    const onMove = (e: MouseEvent) => {
      if (!drag) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const len = points.length || 1;
      const dx = x - drag.startX;
      const barsDelta = Math.round((dx / Math.max(1, W)) * len);
      if (drag.mode === "move") {
        onViewChange(clamp(drag.startView.start + barsDelta, drag.startView.end + barsDelta, len));
      } else if (drag.mode === "resize-l") {
        const start = Math.max(0, Math.min(drag.startView.start + barsDelta, drag.startView.end - 20));
        onViewChange({ start, end: drag.startView.end });
      } else if (drag.mode === "resize-r") {
        const end = Math.min(len, Math.max(drag.startView.start + 20, drag.startView.end + barsDelta));
        onViewChange({ start: drag.startView.start, end });
      }
    };
    const onUp = () => setDrag(null);
    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [drag, points, view, onViewChange]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-2">
      <div className="text-xs text-zinc-400 mb-1">Navigator</div>
      <canvas ref={canvasRef} className="block w-full" style={{ width: "100%", height: 80 }} />
      <div className="mt-1 text-[11px] text-zinc-500">Ziehen: Fenster bewegen • Griffe: Größe ändern</div>
    </div>
  );
}
