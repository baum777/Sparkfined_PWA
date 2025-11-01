// SHA-256 for URL/string → base64url
export async function sha256Url(s: string): Promise<string> {
  const enc = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const b = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return b.replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
