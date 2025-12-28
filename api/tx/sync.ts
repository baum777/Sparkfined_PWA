import { txBuffer } from "../../src/server/txBuffer";
import { auth } from "../../src/server/auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const wallet = url.searchParams.get("wallet");
    const cursor = url.searchParams.get("cursor");
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 100;

    if (!wallet) {
      return new Response(JSON.stringify({ error: "Missing wallet param" }), { status: 400 });
    }

    // Auth
    const secret = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!secret || !auth.validateSecret(wallet, secret)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Read Events
    const { events, nextCursor } = await txBuffer.readEvents(wallet, cursor, limit);

    return new Response(JSON.stringify({
      ok: true,
      wallet,
      events,
      nextCursor
    }), { status: 200 });

  } catch (error) {
    console.error("Sync Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
