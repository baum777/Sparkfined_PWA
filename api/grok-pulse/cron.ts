import { runGrokPulseCron } from "../../src/lib/grokPulse/engine";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  const secret = process.env.PULSE_CRON_SECRET;
  if (!secret) {
    return new Response(
      JSON.stringify({ ok: false, error: "PULSE_CRON_SECRET not configured" }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    );
  }

  const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
  const expected = `Bearer ${secret}`;
  if (authHeader !== expected) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const result = await runGrokPulseCron();

  return new Response(JSON.stringify({ ok: true, ...result }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
