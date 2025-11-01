import React from "react";

export default function ChartHeader({
  value, onChange, timeframe, onTimeframe, onLoad, loading
}: {
  value: string;
  onChange: (v: string) => void;
  timeframe: "1m"|"5m"|"15m"|"1h"|"4h"|"1d";
  onTimeframe: (tf: "1m"|"5m"|"15m"|"1h"|"4h"|"1d") => void;
  onLoad: () => void;
  loading: boolean;
}) {
  const tfs: Array<typeof timeframe> = ["1m","5m","15m","1h","4h","1d"];
  // Hotkeys: 1=1m, 2=5m, 3=15m, 4=1h, 5=4h, 6=1d; Enter=Load
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === "INPUT") {
        if (e.key === "Enter") onLoad();
        return;
      }
      const map: Record<string, typeof timeframe> = { "1":"1m","2":"5m","3":"15m","4":"1h","5":"4h","6":"1d" };
      if (map[e.key]) { onTimeframe(map[e.key]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onLoad, onTimeframe]);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        className="min-w-[360px] flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
        placeholder="Contract Address (Solana) — z.B. So1111…"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        spellCheck={false}
      />
      <div className="flex items-center gap-1 rounded-xl border border-zinc-700 p-1">
        {tfs.map(tf => (
          <button
            key={tf}
            onClick={()=>onTimeframe(tf)}
            className={`rounded-lg px-2 py-1 text-sm ${timeframe===tf ? "bg-zinc-700 text-white" : "text-zinc-300 hover:bg-zinc-800"}`}
          >
            {tf}
          </button>
        ))}
      </div>
      <button
        onClick={onLoad}
        disabled={loading}
        className="rounded-xl border border-emerald-700 bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {loading ? "Lade…" : "Load"}
      </button>
    </div>
  );
}
