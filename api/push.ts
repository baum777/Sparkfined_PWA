export const runtime = "nodejs";

import {
  handleSubscribe,
  handleTestSend,
  handleUnsubscribe,
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
    case "test-send":
    case "test":
      return handleTestSend(req);
    default:
      return json(
        { ok: false, error: "Unknown action. Use ?action=subscribe|unsubscribe|test-send" },
        400
      );
  }
}
