import React from "react";
import type { UiAlertRule, AlertTrigger } from "./types";

const RULES_KEY = "sparkfined.alerts.v1";
const TRIGGERS_KEY = "sparkfined.alertTriggers.v1";

export function useAlertRules() {
  const [rules, setRules] = React.useState<UiAlertRule[]>(() => {
    try { return JSON.parse(localStorage.getItem(RULES_KEY) || "[]"); } catch { return []; }
  });
  const [triggers, setTriggers] = React.useState<AlertTrigger[]>(() => {
    try { return JSON.parse(localStorage.getItem(TRIGGERS_KEY) || "[]"); } catch { return []; }
  });

  React.useEffect(()=>{ localStorage.setItem(RULES_KEY, JSON.stringify(rules)); }, [rules]);
  React.useEffect(()=>{ localStorage.setItem(TRIGGERS_KEY, JSON.stringify(triggers)); }, [triggers]);

  // listen to global CustomEvent("alerts:trigger", {detail:{ ruleId, kind, t, c }})
  React.useEffect(() => {
    const onEvt = (e: Event) => {
      const { detail } = e as CustomEvent<any>;
      const trig: AlertTrigger = { id: crypto.randomUUID(), ruleId: detail?.ruleId, kind: detail?.kind ?? "unknown", t: detail?.t ?? Date.now(), c: detail?.c };
      setTriggers(ts => [trig, ...ts].slice(0, 500));
      if (detail?.ruleId) {
        setRules(rs => rs.map(r => r.id === detail.ruleId ? { ...r, lastTriggerAt: trig.t, updatedAt: Date.now() } : r));
      }
      // optional browser notification
      if (Notification?.permission === "granted") {
        try { new Notification(`Alert: ${trig.kind}`, { body: `t=${new Date(trig.t).toLocaleString()}  c=${trig.c ?? "-"}` }); } catch {}
      }
    };
    window.addEventListener("alerts:trigger" as any, onEvt as any);
    return () => window.removeEventListener("alerts:trigger" as any, onEvt as any);
  }, []);

  const upsert = (r: UiAlertRule) => {
    setRules(prev => {
      const i = prev.findIndex(x => x.id === r.id);
      return i >= 0 ? prev.map(x => x.id === r.id ? r : x) : [r, ...prev];
    });
  };
  const create = (partial: Partial<UiAlertRule>): UiAlertRule => {
    const now = Date.now();
    const r: UiAlertRule = {
      id: crypto.randomUUID(),
      kind: (partial.kind as any) ?? "price-cross",
      op: (partial.op as any) ?? ">",
      value: Number(partial.value ?? 0),
      address: partial.address,
      tf: partial.tf ?? "15m",
      enabled: partial.enabled ?? true,
      createdAt: now, updatedAt: now
    } as UiAlertRule;
    setRules(rs => [r, ...rs]);
    return r;
  };
  const update = (id: string, patch: Partial<UiAlertRule>) =>
    setRules(rs => rs.map(r => r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r));
  const remove = (id: string) => setRules(rs => rs.filter(r => r.id !== id));
  const clearTriggers = () => setTriggers([]);
  const addManualTrigger = (ruleId?: string, note?: string) => {
    const t: AlertTrigger = { id: crypto.randomUUID(), ruleId, kind: "manual", t: Date.now(), note };
    setTriggers(ts => [t, ...ts].slice(0, 500));
  };

  return { rules, upsert, create, update, remove, triggers, clearTriggers, addManualTrigger };
}
