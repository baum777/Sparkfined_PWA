import React from "react";
import type { OhlcPoint } from "../marketOhlc";
import type { ReplayState } from "./types";

export function useReplay(points: OhlcPoint[]) {
  const [state, setState] = React.useState<ReplayState>({ isPlaying: false, speed: 2, cursor: 0 });
  const rafRef = React.useRef<number | null>(null);
  const tRef = React.useRef<number>(0);

  const start = React.useCallback((from?: number) => {
    setState(s => ({ ...s, isPlaying: true, cursor: typeof from === "number" ? from : s.cursor }));
    tRef.current = performance.now();
  }, []);
  const stop = React.useCallback(() => setState(s => ({ ...s, isPlaying: false })), []);
  const setSpeed = React.useCallback((v: ReplayState["speed"]) => setState(s => ({ ...s, speed: v })), []);
  const setCursor = React.useCallback((i: number) => setState(s => ({ ...s, cursor: clamp(i, 0, Math.max(0, points.length - 1)) })), [points.length]);

  React.useEffect(() => {
    if (!state.isPlaying) { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; return; }
    const tick = (now: number) => {
      const dt = now - (tRef.current || now);
      tRef.current = now;
      const step = (state.speed * dt) / 1000; // bars per frame
      setState(s => {
        const next = Math.min(points.length - 1, s.cursor + step);
        return (next >= points.length - 1) ? { ...s, isPlaying: false, cursor: points.length - 1 } : { ...s, cursor: next };
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [state.isPlaying, state.speed, points.length]);

  return {
    state,
    start,
    stop,
    setSpeed,
    setCursor,
  };
}

function clamp(n:number, a:number, b:number){ return Math.max(a, Math.min(b, n)); }
