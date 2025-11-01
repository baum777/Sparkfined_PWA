// Stateless Shortlinks: base64url(JSON). Keine Server-Persistenz nötig.
export type ShortState = Record<string, unknown>;

export function encodeToken(obj: ShortState): string {
  const json = JSON.stringify(obj);
  const b64  = btoa(unescape(encodeURIComponent(json)));
  return toUrl(b64);
}
export function decodeToken(token: string): ShortState | null {
  try {
    const json = decodeURIComponent(escape(atob(fromUrl(token))));
    return JSON.parse(json);
  } catch { return null; }
}
export function toUrl(b64:string){ return b64.replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
export function fromUrl(tok:string){ tok = tok.replace(/-/g,"+").replace(/_/g,"/"); while (tok.length%4) tok += "="; return tok; }
