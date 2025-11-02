// base64url Encode/Decode für Test-Links
export type TestRulePayload = {
  rule: any;
  address: string;
  tf: "1m"|"5m"|"15m"|"1h"|"4h"|"1d";
};
export function encodeRuleToken(obj: TestRulePayload): string {
  const s = JSON.stringify(obj);
  const b64 = btoa(unescape(encodeURIComponent(s)));
  return b64.replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
export function decodeRuleToken(tok: string): TestRulePayload | null {
  try{
    let b64 = tok.replace(/-/g,"+").replace(/_/g,"/"); while (b64.length%4) b64 += "=";
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  } catch { return null; }
}
