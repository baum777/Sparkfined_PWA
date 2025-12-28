// Vercel Edge/Node function — minimale Aufnahme
export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  try {
    const body = await req.json();
    // naive validation
    if (!body || body.source !== "sparkfined") return new Response("bad", { status: 400 });
    // Option: anonymisieren/filtern – wir loggen nur aggregierte Zahlen
    const count = Array.isArray(body.events) ? body.events.length : 0;
    // In echten Systemen: an Log-Backend weiterreichen; hier: noop/ok
    return new Response(JSON.stringify({ ok: true, count }), { headers: { "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 200, headers: { "content-type":"application/json" } });
  }
}
