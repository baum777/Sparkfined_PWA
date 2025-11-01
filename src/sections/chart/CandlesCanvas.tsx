import React from "react";

export type OhlcPoint = { t: number; o: number; h: number; l: number; c: number; v?: number };

export default function CandlesCanvas({ points, loading }: { points: OhlcPoint[]; loading: boolean }) {
  const ref = React.useRef<HTMLCanvasElement | null>(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const ctx = el.getContext("2d"); if (!ctx) return;
    const W = el.width = el.clientWidth;
    const H = el.height = 360;
    ctx.clearRect(0,0,W,H);
    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let i=1;i<6;i++){ const y = (H/6)*i; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    if (!points?.length) return;
    // Scales
    const min = Math.min(...points.map(p=>p.l));
    const max = Math.max(...points.map(p=>p.h));
    const span = Math.max(1e-12, max - min);
    const pad = 10;
    const n = points.length;
    const cw = Math.max(2, (W - pad*2) / n * 0.7);
    points.forEach((p, i) => {
      const x = pad + (i * (W - pad*2) / n);
      const yo = H - pad - ((p.o - min) * (H - pad*2) / span);
      const yc = H - pad - ((p.c - min) * (H - pad*2) / span);
      const yh = H - pad - ((p.h - min) * (H - pad*2) / span);
      const yl = H - pad - ((p.l - min) * (H - pad*2) / span);
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
  }, [points]);
  return (
    <div className="relative">
      <canvas ref={ref} className="block w-full rounded-xl bg-zinc-950" />
      {loading && <div className="absolute inset-0 grid place-items-center text-sm text-zinc-400">Lade Daten…</div>}
    </div>
  );
}
