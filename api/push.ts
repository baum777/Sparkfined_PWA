// api/push.ts
// Consolidated Push Notification API
// Consolidates: api/push/subscribe, api/push/unsubscribe, api/push/test-send
// Routes:
//   POST /api/push?action=subscribe   → Subscribe to push notifications
//   POST /api/push?action=unsubscribe → Unsubscribe
//   POST /api/push?action=test        → Send test push (admin-only)

export const config = { runtime: "nodejs" };

import {
  handleSubscribe,
  handleUnsubscribe,
  handleTestSend,
} from "../src/server/push/handlers";

const json = (obj: any, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  switch (action) {
    case "subscribe":
      return handleSubscribe(req);
    case "unsubscribe":
      return handleUnsubscribe(req);
    case "test":
      return handleTestSend(req);
    default:
      return json(
        {
          ok: false,
          error: "Unknown action. Use ?action=subscribe|unsubscribe|test",
        },
        400
      );
  }
}
