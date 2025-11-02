import React from "react";

export type Hit = { i:number; t:number; c:number; ruleId:string; kind:string; meta?:any };

export default function TestOverlay({
  hits, onClear
}: {
  hits: Hit[];
  onClear: ()=>void;
}) {
  if (!hits?.length) return null;
  return (
    <>
      {/* Floating HUD */}
      <div className="pointer-events-auto fixed right-4 top-20 z-40 rounded-lg border border-emerald-700/60 bg-emerald-900/40 px-3 py-2 text-xs text-emerald-100 shadow">
        <div className="font-medium">Backtest (Test)</div>
        <div>{hits.length} Treffer · temporär</div>
        <button className="mt-1 rounded border border-emerald-700/60 px-2 py-0.5 hover:bg-emerald-800/40" onClick={onClear}>Clear</button>
      </div>
      {/* Marker Layer hint: eigentliche Marker zeichnest du schon in deiner Timeline/Canvas.
          Falls du eine SVG-Layer hast, kannst du hier optional ergänzen. */}
    </>
  );
}
