export async function sha256Base64(s: string): Promise<string> {
  const enc = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const b = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return b.replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
