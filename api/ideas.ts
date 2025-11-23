// api/ideas.ts
// Consolidated Ideas & Journal API
// Consolidates:
//   - api/ideas/index, close, export, export-pack, attach-trigger (5 functions)
//   - api/journal/index, export (2 functions)
// Total: 7→1
//
// Routes:
//   Ideas:
//     GET  /api/ideas?action=list                → List all ideas
//     POST /api/ideas?action=create              → Create/update idea
//     POST /api/ideas?action=update              → Create/update idea
//     POST /api/ideas?action=close               → Close idea + outcome
//     GET  /api/ideas?action=export[&id=X]       → Export as markdown
//     GET  /api/ideas?action=export-pack&id=X    → Execution pack
//     POST /api/ideas?action=attach-trigger      → Attach rule trigger
//
//   Journal:
//     GET  /api/ideas?resource=journal&action=list             → List journal
//     POST /api/ideas?resource=journal&action=create           → Create/update journal
//     GET  /api/ideas?resource=journal&action=export[&fmt=md]  → Export journal

export const config = { runtime: "nodejs" };

import { handleList, handleCreateOrUpdate } from "../src/server/ideas/handlers";
import { handleClose } from "../src/server/ideas/close";
import { handleExport, handleExportPack } from "../src/server/ideas/export";
import { handleAttachTrigger } from "../src/server/ideas/triggers";
import {
  handleList as handleJournalList,
  handleCreateOrUpdate as handleJournalCreate,
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
      if (req.method === "GET" && action === "list") {
        return handleJournalList(req);
      }
      if (req.method === "POST" && (action === "create" || action === "update")) {
        return handleJournalCreate(req);
      }
      if (req.method === "GET" && action === "export") {
        return handleJournalExport(req);
      }
      return json({ ok: false, error: "Unknown journal action" }, 400);
    }

    // ========================================================================
    // IDEAS ROUTING
    // ========================================================================
    if (req.method === "GET") {
      switch (action) {
        case "list":
          return handleList(req);
        case "export":
          return handleExport(req);
        case "export-pack":
          return handleExportPack(req);
        default:
          return json({ ok: false, error: "Unknown GET action" }, 400);
      }
    }

    if (req.method === "POST") {
      switch (action) {
        case "create":
        case "update":
          return handleCreateOrUpdate(req);
        case "close":
          return handleClose(req);
        case "attach-trigger":
          return handleAttachTrigger(req);
        default:
          return json({ ok: false, error: "Unknown POST action" }, 400);
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
