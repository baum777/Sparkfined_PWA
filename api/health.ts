// Edge Runtime Health Check Endpoint for Vercel
export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  const checks = {
    timestamp: new Date().toISOString(),
    env: {
      dexpaprika: !!process.env.DEXPAPRIKA_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      vapid: !!process.env.VITE_VAPID_PUBLIC_KEY,
      vapidPrivate: !!process.env.VAPID_PRIVATE_KEY,
    },
    runtime: "edge",
    version: "1.0.0",
  };

  const allEnvOk = Object.values(checks.env).every(Boolean);

  return new Response(
    JSON.stringify({
      ok: true,
      status: allEnvOk ? "healthy" : "degraded",
      checks,
      warnings: allEnvOk ? [] : ["Some environment variables are missing"],
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store, must-revalidate",
      },
    }
  );
}
