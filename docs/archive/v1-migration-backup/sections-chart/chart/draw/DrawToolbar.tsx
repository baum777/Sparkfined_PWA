import React from "react";
import type { ToolKind } from "./types";

export default function DrawToolbar({
  tool, onTool, onUndo, onRedo, canUndo, canRedo, onClear
}: {
  tool: ToolKind;
  onTool: (t: ToolKind) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
}) {
  const Btn = ({ k, label }: { k: ToolKind; label: string }) => (
    <button
      onClick={() => onTool(k)}
      className={`rounded-lg border px-2 py-1 text-xs ${tool === k ? "border-cyan-600 bg-cyan-900/30 text-cyan-100" : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"}`}
    >
      {label}
    </button>
  );
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-zinc-300">
      <Btn k="cursor" label="Cursor" />
      <Btn k="hline"  label="S/R" />
      <Btn k="trend"  label="Trend" />
      <Btn k="fib"    label="Fib" />
      <span className="mx-2 text-zinc-600">•</span>
      <button onClick={onUndo} disabled={!canUndo} className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300 disabled:opacity-40 hover:bg-zinc-800">Undo</button>
      <button onClick={onRedo} disabled={!canRedo} className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300 disabled:opacity-40 hover:bg-zinc-800">Redo</button>
      <span className="mx-2 text-zinc-600">•</span>
      <button onClick={onClear} className="rounded-lg border border-rose-800 px-2 py-1 text-xs text-rose-100 hover:bg-rose-900/30">Clear</button>
      <span className="text-xs text-zinc-500">(Hotkeys: H=S/R, T=Trend, F=Fib, Esc=Cursor, Ctrl+Z / Ctrl+Y)</span>
    </div>
  );
}
