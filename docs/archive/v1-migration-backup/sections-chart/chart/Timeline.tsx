import React from "react";
import type { ChartEvent } from "./events/types";
import type { OhlcPoint } from "./marketOhlc";

export default function Timeline({
  points, view, events, onJump, filter = { alert:true, bookmark:true, note:true }
}: {
  points: OhlcPoint[];
  view: { start:number; end:number };
  events: ChartEvent[];
  onJump: (t:number) => void;
  filter?: { alert:boolean; bookmark:boolean; note:boolean };
}) {
  const W = 800, H = 40;
  const ref = React.useRef<HTMLCanvasElement | null>(null);
  const len = points.length || 1;
  const tToX = (t:number) => {
    const idx = points.findIndex(p => p.t === t);
    const i = idx >= 0 ? idx : 0;
    return (i / Math.max(1, len)) * W;
  };
  const color = (k:ChartEvent["kind"]) =>
    k === "alert" ? "#F59E0B" : k === "bookmark" ? "#60A5FA" : "#A78BFA";

  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const ctx = el.getContext("2d"); if (!ctx) return;
    el.width = W; el.height = H;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = "#0b0b0b"; ctx.fillRect(0,0,W,H);
    // view window
    const x0 = (view.start / Math.max(1, len)) * W;
    const x1 = (view.end   / Math.max(1, len)) * W;
    ctx.fillStyle = "rgba(96,165,250,0.18)";
    ctx.fillRect(x0, 0, Math.max(10, x1-x0), H);
    // events
    for (const e of events) {
      if (!filter[e.kind]) continue;
      const x = tToX(e.t);
      ctx.strokeStyle = color(e.kind);
      ctx.beginPath(); ctx.moveTo(x, 2); ctx.lineTo(x, H-2); ctx.stroke();
    }
  }, [points, view, events, filter]);

  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const onDown = (ev: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      // find closest event within 6px
      let best: { t:number; dx:number } | null = null;
      for (const e of events) {
        const dx = Math.abs(tToX(e.t) - x);
        if (dx <= 6 && (!best || dx < best.dx)) best = { t:e.t, dx };
      }
      if (best) onJump(best.t);
    };
    el.addEventListener("mousedown", onDown);
    return () => el.removeEventListener("mousedown", onDown);
  }, [events, onJump]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-2">
      <div className="mb-1 flex items-center justify-between text-[11px] text-zinc-400">
        <span>Event Timeline</span>
        <span className="text-zinc-500">Klick Marker → Jump</span>
      </div>
      <canvas ref={ref} className="block w-full" style={{ width:"100%", height:40 }} />
      <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm" style={{background:"#F59E0B"}}/> Alert</span>
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm" style={{background:"#60A5FA"}}/> Bookmark</span>
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm" style={{background:"#A78BFA"}}/> Note</span>
      </div>
    </div>
  );
}
