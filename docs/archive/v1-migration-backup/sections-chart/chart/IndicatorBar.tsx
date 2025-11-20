import React from "react";

export type IndicatorState = {
  sma20: boolean;
  ema20: boolean;
  vwap: boolean;
};

export default function IndicatorBar({ value, onChange }: {
  value: IndicatorState;
  onChange: (next: IndicatorState) => void;
}) {
  const toggle = (k: keyof IndicatorState) => onChange({ ...value, [k]: !value[k] });
  const pill = "rounded-lg border px-2 py-1 text-xs";
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-zinc-300">
      <button onClick={() => toggle("sma20")} className={`${pill} ${value.sma20 ? "border-cyan-600 bg-cyan-900/30 text-cyan-100" : "border-zinc-700 hover:bg-zinc-800"}`}>SMA20</button>
      <button onClick={() => toggle("ema20")} className={`${pill} ${value.ema20 ? "border-amber-600 bg-amber-900/30 text-amber-100" : "border-zinc-700 hover:bg-zinc-800"}`}>EMA20</button>
      <button onClick={() => toggle("vwap")}  className={`${pill} ${value.vwap  ? "border-violet-600 bg-violet-900/30 text-violet-100" : "border-zinc-700 hover:bg-zinc-800"}`}>VWAP</button>
    </div>
  );
}
