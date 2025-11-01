import React from "react";
import type { ChartEvent } from "./types";

const KEY = "sparkfined.events.v1";

export function useEvents() {
  const [events, setEvents] = React.useState<ChartEvent[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });

  React.useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(events));
  }, [events]);

  // Listen to client-side alert triggers (from previous phases)
  React.useEffect(() => {
    const onTrigger = (e: Event) => {
      const any = e as CustomEvent;
      const detail = any?.detail || {};
      const evt: ChartEvent = {
        id: crypto.randomUUID(),
        kind: "alert",
        t: typeof detail.t === "number" ? detail.t : Date.now(),
        payload: detail,
        createdAt: Date.now(),
      };
      setEvents(ev => [evt, ...ev].slice(0, 2000));
    };
    window.addEventListener("alerts:trigger" as any, onTrigger as any);
    return () => window.removeEventListener("alerts:trigger" as any, onTrigger as any);
  }, []);

  const addBookmarkEvent = (t:number, payload?: Record<string, unknown>) => {
    const evt: ChartEvent = { id: crypto.randomUUID(), kind: "bookmark", t, payload, createdAt: Date.now() };
    setEvents(ev => [evt, ...ev].slice(0, 2000));
  };
  const clearEvents = () => setEvents([]);

  return { events, setEvents, addBookmarkEvent, clearEvents };
}
