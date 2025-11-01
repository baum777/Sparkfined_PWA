// Kleine, dependency-freie Helfer zum (de-)serialisieren eines kompakten URL-States
export function encodeState(obj: unknown): string {
  try {
    const json = JSON.stringify(obj);
    // base64-url
    const b64 = btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/,"");
    return b64;
  } catch { return ""; }
}

export function decodeState<T = unknown>(b64: string | null | undefined): T | null {
  if (!b64) return null;
  try {
    const norm = b64.replace(/-/g, "+").replace(/_/g, "/");
    const pad = norm + "===".slice((norm.length + 3) % 4);
    const json = decodeURIComponent(escape(atob(pad)));
    return JSON.parse(json) as T;
  } catch { return null; }
}
