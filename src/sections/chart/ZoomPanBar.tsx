import React from "react";

export default function ZoomPanBar({
  onZoomIn, onZoomOut, onReset, snap, onToggleSnap, rangeText
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  snap: boolean;
  onToggleSnap: () => void;
  rangeText?: string;
}) {
  const btn = "rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800";
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-zinc-300">
      <button onClick={onZoomIn}  className={btn}>Zoom&nbsp;In</button>
      <button onClick={onZoomOut} className={btn}>Zoom&nbsp;Out</button>
      <button onClick={onReset}   className={btn}>Reset</button>
      <span className="mx-2 text-zinc-600">•</span>
      <button onClick={onToggleSnap} className={`rounded-lg border px-2 py-1 text-xs ${snap ? "border-emerald-700 bg-emerald-900/30 text-emerald-100" : "border-zinc-700 text-zinc-200 hover:bg-zinc-800"}`}>
        Snap&nbsp;to&nbsp;OHLC&nbsp;{snap ? "ON" : "OFF"}
      </button>
      {rangeText && <span className="ml-2 text-xs text-zinc-500">{rangeText}</span>}
    </div>
  );
}
