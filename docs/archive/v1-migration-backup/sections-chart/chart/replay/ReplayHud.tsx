import React from "react";

export type ReplayHudProps = {
  playing: boolean;
  speed: 1|2|4|8|10;
  cursor: number;
  total: number;
  point?: { t:number; o:number; h:number; l:number; c:number };
  title?: string;
};

export default function ReplayHud({ playing, speed, cursor, total, point, title }: ReplayHudProps) {
  const fmt = (n:number) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(n);
  const ts = point?.t ? new Date(point.t).toLocaleString() : "–";
  return (
    <div className="pointer-events-none absolute left-2 top-2 rounded-lg border border-zinc-700/70 bg-zinc-900/70 px-2 py-1 text-[11px] text-zinc-200 shadow">
      <div className="flex items-center gap-2">
        <span className={`rounded px-1 ${playing ? "bg-emerald-700/70" : "bg-zinc-700/70"}`}>{playing ? "PLAY" : "PAUSE"}</span>
        <span>⏩ {speed}x</span>
        <span>⟂ {cursor + 1}/{total}</span>
        <span>🕒 {ts}</span>
      </div>
      {point && (
        <div className="mt-0.5 text-zinc-300">
          O {fmt(point.o)} · H {fmt(point.h)} · L {fmt(point.l)} · C {fmt(point.c)}
        </div>
      )}
      {title && <div className="mt-0.5 text-zinc-400">{title}</div>}
    </div>
  );
}
