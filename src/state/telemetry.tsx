import React from "react";

export type TelemetryFlags = {
  enabled: boolean;         // global on/off
  sampling: number;         // 0..1  (z.B. 0.2 = 20%)
  includeNetwork: boolean;  // API timings
  includeCanvas: boolean;   // FPS, rAF latency
  includeUser: boolean;     // user actions (anonymisiert)
  tokenOverlay: boolean;    // UI overlay anzeigen
};

export type TelemetryEvent = {
  id: string;
  ts: number;                   // epoch ms
  type: string;                 // e.g. "perf.fps", "api.fetch", "alert.trigger"
  attrs?: Record<string, unknown>;
};

const KEY = "sparkfined.telemetry.settings.v1";
const DEFAULTS: TelemetryFlags = {
  enabled: true,
  sampling: 0.25,
  includeNetwork: true,
  includeCanvas: true,
  includeUser: true,
  tokenOverlay: true,
};

function readFlags(): TelemetryFlags {
  try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) || "{}")) }; }
  catch { return DEFAULTS; }
}
function writeFlags(v: TelemetryFlags) {
  localStorage.setItem(KEY, JSON.stringify(v));
}

type Ctx = {
  flags: TelemetryFlags;
  setFlags: (patch: Partial<TelemetryFlags>) => void;
  enqueue: (ev: TelemetryEvent) => void;
  drain: () => void;
  buffer: TelemetryEvent[];
};
const TelemetryCtx = React.createContext<Ctx | null>(null);

const BUF_KEY = "sparkfined.telemetry.buffer.v1";
function readBuffer(): TelemetryEvent[] {
  try { return JSON.parse(sessionStorage.getItem(BUF_KEY) || "[]"); } catch { return []; }
}
function writeBuffer(buf: TelemetryEvent[]) {
  try { sessionStorage.setItem(BUF_KEY, JSON.stringify(buf)); } catch {}
}

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [flags, _setFlags] = React.useState<TelemetryFlags>(readFlags);
  const [buffer, setBuffer] = React.useState<TelemetryEvent[]>(readBuffer);

  React.useEffect(() => writeFlags(flags), [flags]);
  React.useEffect(() => writeBuffer(buffer), [buffer]);

  const setFlags = (patch: Partial<TelemetryFlags>) => _setFlags(s => ({ ...s, ...patch }));

  const enqueue = (ev: TelemetryEvent) => {
    if (!flags.enabled) return;
    if (Math.random() > flags.sampling) return;
    setBuffer(buf => [ev, ...buf].slice(0, 2000));
  };

  const drain = () => {
    if (buffer.length === 0) return;
    const payload = { source: "sparkfined", version: 1, events: buffer.slice().reverse() };
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    const ok = !!navigator.sendBeacon && navigator.sendBeacon("/api/telemetry", blob);
    if (!ok) {
      fetch("/api/telemetry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), keepalive: true }).catch(()=>{});
    }
    setBuffer([]);
  };

  // periodic drain & on visibility change
  React.useEffect(() => {
    const iv = setInterval(drain, 15000);
    const onHide = () => document.visibilityState === "hidden" && drain();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", drain);
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", onHide); window.removeEventListener("beforeunload", drain); };
  }, [buffer.length]);

  return <TelemetryCtx.Provider value={{ flags, setFlags, enqueue, drain, buffer }}>{children}</TelemetryCtx.Provider>;
}

export function useTelemetry(): Ctx {
  const ctx = React.useContext(TelemetryCtx);
  if (!ctx) throw new Error("useTelemetry must be used within TelemetryProvider");
  return ctx;
}
