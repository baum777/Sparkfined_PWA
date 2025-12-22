import React from "react";
import { getJSON, setJSON, isStorageAvailable } from "@/lib/safeStorage";

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
  return getJSON(KEY, DEFAULTS);
}
function writeFlags(v: TelemetryFlags) {
  setJSON(KEY, v);
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
  if (!isStorageAvailable()) return [];
  try { 
    const raw = sessionStorage.getItem(BUF_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { 
    return []; 
  }
}
function writeBuffer(buf: TelemetryEvent[]) {
  if (!isStorageAvailable()) return;
  try {
    sessionStorage.setItem(BUF_KEY, JSON.stringify(buf));
  } catch (err) {
    console.warn('[telemetry] Failed to write buffer:', err);
  }
}

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [flags, _setFlags] = React.useState<TelemetryFlags>(readFlags);
  const [buffer, setBuffer] = React.useState<TelemetryEvent[]>(readBuffer);
  const bufferRef = React.useRef(buffer);

  React.useEffect(() => writeFlags(flags), [flags]);
  React.useEffect(() => writeBuffer(buffer), [buffer]);
  React.useEffect(() => {
    bufferRef.current = buffer;
  }, [buffer]);

  const setFlags = (patch: Partial<TelemetryFlags>) => _setFlags(s => ({ ...s, ...patch }));

  const enqueue = (ev: TelemetryEvent) => {
    if (!flags.enabled) return;
    if (Math.random() > flags.sampling) return;
    setBuffer(buf => [ev, ...buf].slice(0, 2000));
  };

  const drain = React.useCallback(() => {
    const currentBuffer = bufferRef.current;
    if (currentBuffer.length === 0) return;

    if (import.meta.env.DEV) {
      // Dev mode: avoid noisy 500s from the stub API but still clear the buffer.
      setBuffer([]);
      return;
    }

    const payload = { source: "sparkfined", version: 1, events: currentBuffer.slice().reverse() };
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    const ok = !!navigator.sendBeacon && navigator.sendBeacon("/api/telemetry", blob);
    if (!ok) {
      fetch("/api/telemetry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
    setBuffer([]);
  }, []);

  // periodic drain & on visibility change (browser-only)
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const iv = setInterval(drain, 15000);
    const onHide = () => document.visibilityState === "hidden" && drain();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", drain);
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", onHide); window.removeEventListener("beforeunload", drain); };
  }, [drain]);

  return <TelemetryCtx.Provider value={{ flags, setFlags, enqueue, drain, buffer }}>{children}</TelemetryCtx.Provider>;
}

export function useTelemetry(): Ctx {
  const ctx = React.useContext(TelemetryCtx);
  if (!ctx) throw new Error("useTelemetry must be used within TelemetryProvider");
  return ctx;
}
