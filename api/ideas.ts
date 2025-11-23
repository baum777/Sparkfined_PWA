// Unified Ideas & Journal Router (7→1 consolidation)
// Routes: ?resource=ideas|journal&action=list|create|close|export|export-pack|attach-trigger

export const config = { runtime: "nodejs" };

import {
  handleList as handleIdeasList,
  handleCreateOrUpdate as handleIdeasCreateOrUpdate,
  handleClose,
  handleExport as handleIdeasExport,
  handleExportPack,
  handleAttachTrigger,
} from "../src/server/ideas/handlers";

import {
  handleList as handleJournalList,
  handleCreateOrUpdate as handleJournalCreateOrUpdate,
  handleExport as handleJournalExport,
} from "../src/server/journal/handlers";

const json = (obj: any, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const resource = url.searchParams.get("resource") || "ideas";
  const action = url.searchParams.get("action") || (req.method === "GET" ? "list" : "create");

  try {
    // ========================================================================
    // JOURNAL ROUTING
    // ========================================================================
    if (resource === "journal") {
      if (req.method === "GET") {
        switch (action) {
          case "list":
            return handleJournalList(req);
          case "export":
            return handleJournalExport(req);
          default:
            return json({ ok: false, error: "Unknown journal action" }, 400);
        }
      }

      if (req.method === "POST") {
        switch (action) {
          case "create":
          case "update":
            return handleJournalCreateOrUpdate(req);
          default:
            return json({ ok: false, error: "Unknown journal action" }, 400);
        }
      }

      return json({ ok: false, error: "Method not allowed" }, 405);
    }

    // ========================================================================
    // IDEAS ROUTING (default resource)
    // ========================================================================
    if (req.method === "GET") {
      switch (action) {
        case "list":
          return handleIdeasList(req);
        case "export":
          return handleIdeasExport(req);
        case "export-pack":
          return handleExportPack(req);
        default:
          return json({ ok: false, error: "Unknown ideas action" }, 400);
      }
    }

    if (req.method === "POST") {
      switch (action) {
        case "create":
        case "update":
          return handleIdeasCreateOrUpdate(req);
        case "close":
          return handleClose(req);
        case "attach-trigger":
          return handleAttachTrigger(req);
        default:
          return json({ ok: false, error: "Unknown ideas action" }, 400);
      }
    }

    return json({ ok: false, error: "Method not allowed" }, 405);
  } catch (error: any) {
    console.error("[ideas] Handler error:", error);
    return json(
      { ok: false, error: error.message || "Internal error" },
      500
    );
  }
}
