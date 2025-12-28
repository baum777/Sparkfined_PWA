// Kein Storage: erzeugt aus Payload einen ?short=<token> Link (base64url)
export const config = { runtime: "edge" };
export default async function handler(req: Request) {
  if (req.method !== "POST") return new Response("POST only", { status:405 });
  try {
    const { payload, path="/chart" } = await req.json();
    if (!payload || typeof payload !== "object") return json({ ok:false, error:"payload required" }, 400);
    const token = encode(payload);
    const url = new URL(req.url);
    const short = `${url.origin}${path}?short=${token}`;
    return json({ ok:true, token, url: short });
  } catch (e:any) {
    return json({ ok:false, error:String(e?.message ?? e) }, 200);
  }
}
const json = (obj:any, status=200)=> new Response(JSON.stringify(obj), { status, headers:{ "content-type":"application/json" }});
const encode = (obj:any)=> {
  const s = JSON.stringify(obj);
  const b64 = btoa(unescape(encodeURIComponent(s)));
  return b64.replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
};
