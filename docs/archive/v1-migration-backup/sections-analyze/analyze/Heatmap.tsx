import React from "react";

export default function Heatmap({
  rows, headers
}: {
  rows: { id:string; values:number[] }[];
  headers: string[];
}) {
  const cell = (s:number) => s>0 ? "bg-emerald-900/40 text-emerald-200 border-emerald-800/60"
                   : s<0 ? "bg-rose-900/40 text-rose-200 border-rose-800/60"
                         : "bg-zinc-900/40 text-zinc-400 border-zinc-700/60";
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[560px] text-[12px]">
        <thead>
          <tr>
            <th className="px-2 py-1 text-left text-zinc-400">Indicator</th>
            {headers.map(h => <th key={h} className="px-2 py-1 text-left text-zinc-400">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td className="px-2 py-1 text-zinc-300">{r.id}</td>
              {r.values.map((s,i)=>
                <td key={i} className={`px-2 py-1 border ${cell(s)}`}>{s>0?"Bull":s<0?"Bear":"Flat"}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
