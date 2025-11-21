export const config = { runtime: "edge" };

import { runGrokPulseCron } from "../../src/lib/grokPulse/engine";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

export default async function handler(req: Request): Promise<Response> {
  const secret = process.env.PULSE_CRON_SECRET?.trim();
  if (!secret) {
    return json({ ok: false, error: "PULSE_CRON_SECRET not configured" }, 500);
  }

  const authHeader = req.headers.get("authorization") || "";
  const [scheme, token] = authHeader.split(" ", 2);

  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  if (token.trim() !== secret) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  try {
    const result = await runGrokPulseCron();
    return json({ ok: true, ...result }, 200);
  } catch (error) {
    console.error("[grokPulse] cron handler failed", error);
    return json({ ok: false, error: "Cron execution failed" }, 500);
  }
}
