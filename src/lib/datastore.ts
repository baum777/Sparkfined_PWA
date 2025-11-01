export type NamespaceKey =
  | "settings" | "watchlist" | "alerts" | "alertTriggers" | "sessions"
  | "bookmarks" | "events" | "journal";

// Mapping unserer localStorage-Keys
export const KEYS: Record<NamespaceKey, string> = {
  settings:      "sparkfined.settings.v1",
  watchlist:     "sparkfined.watchlist.v1",
  alerts:        "sparkfined.alerts.v1",
  alertTriggers: "sparkfined.alertTriggers.v1",
  sessions:      "sparkfined.sessions.v1",
  bookmarks:     "sparkfined.bookmarks.v1",
  events:        "sparkfined.events.v1",
  journal:       "sparkfined.journal.v1",
};

export type AppExport = {
  $schema: "sparkfined.appdata";
  version: number;           // schema version
  createdAt: string;         // ISO
  data: Partial<Record<NamespaceKey, unknown>>;
};

export function readNs<T=unknown>(ns: NamespaceKey): T | undefined {
  try { const raw = localStorage.getItem(KEYS[ns]); return raw ? JSON.parse(raw) as T : undefined; }
  catch { return undefined; }
}
export function writeNs(ns: NamespaceKey, value: unknown) {
  localStorage.setItem(KEYS[ns], JSON.stringify(value));
}
export function clearNs(ns: NamespaceKey) { localStorage.removeItem(KEYS[ns]); }

export function exportAppData(pick?: NamespaceKey[]): AppExport {
  const selected = new Set<NamespaceKey>(pick ?? Object.keys(KEYS) as NamespaceKey[]);
  const data: Partial<Record<NamespaceKey, unknown>> = {};
  for (const k of selected) data[k] = readNs(k);
  return { $schema: "sparkfined.appdata", version: 1, createdAt: new Date().toISOString(), data };
}

export function downloadJson(filename: string, obj: unknown) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export async function importAppData(file: File, mode: "merge"|"replace" = "merge"): Promise<{imported: NamespaceKey[]}> {
  const text = await file.text();
  const json = JSON.parse(text) as AppExport;
  if (json.$schema !== "sparkfined.appdata") throw new Error("Unbekanntes Schema");
  const imported: NamespaceKey[] = [];
  for (const [k, v] of Object.entries(json.data ?? {})) {
    const ns = k as NamespaceKey;
    if (!(ns in KEYS)) continue;
    if (mode === "replace") {
      writeNs(ns, v);
    } else {
      // merge: simple strategy per namespace
      const current = readNs<any>(ns);
      let next: unknown = v;
      if (Array.isArray(current) && Array.isArray(v)) {
        // dedupe by JSON.stringify
        const map = new Map<string, unknown>();
        [...current, ...v].forEach(it => map.set(JSON.stringify(it), it));
        next = Array.from(map.values());
      } else if (isObj(current) && isObj(v)) {
        next = { ...current, ...v };
      }
      writeNs(ns, next);
    }
    imported.push(ns);
  }
  return { imported };
}

export async function clearCaches(): Promise<string[]> {
  if (!("caches" in window)) return [];
  const names = await caches.keys();
  const removed: string[] = [];
  for (const n of names) { await caches.delete(n); removed.push(n); }
  return removed;
}

export async function pokeServiceWorker(): Promise<"updated"|"no-sw"|"message-sent"> {
  const reg = await navigator.serviceWorker?.getRegistration();
  if (!reg) return "no-sw";
  reg.update().catch(()=>{});
  reg.waiting?.postMessage?.({ type: "SKIP_WAITING" });
  return reg.waiting ? "message-sent" : "updated";
}

function isObj(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}
