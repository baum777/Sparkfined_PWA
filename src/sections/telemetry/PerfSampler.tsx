import React from "react";
import { useTelemetry } from "../../state/telemetry";

export default function PerfSampler(): null {
  const { flags, enqueue } = useTelemetry();
  React.useEffect(() => {
    if (!flags.includeCanvas) return;
    let rafId = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last; last = now;
      const fps = Math.min(120, 1000 / Math.max(1, dt));
      const ev = { id: crypto.randomUUID(), ts: Date.now(), type: "perf.fps", attrs: { fps: Math.round(fps), dt } };
      enqueue(ev as any);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [flags.includeCanvas, enqueue]);

  React.useEffect(() => {
    if (!flags.includeNetwork) return;
    // PerformanceObserver für Resource Timing (nur grob)
    let obs: PerformanceObserver | null = null;
    try {
      obs = new PerformanceObserver((list) => {
        list.getEntries().forEach((e) => {
          if (e.entryType !== "resource") return;
          const url = (e as PerformanceResourceTiming).name;
          if (!/api\./.test(url)) return; // nur API Hosts
          enqueue({
            id: crypto.randomUUID(),
            ts: Date.now(),
            type: "api.timing",
            attrs: {
              url,
              dur: Math.round(e.duration),
              ttfb: Math.round((e as any).responseStart - (e as any).requestStart),
            }
          } as any);
        });
      });
      obs.observe({ entryTypes: ["resource"] });
    } catch (err) {
      console.error('Failed to initialize PerformanceObserver:', err);
    }
    return () => obs?.disconnect();
  }, [flags.includeNetwork, enqueue]);

  return null;
}
