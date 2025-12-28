import { txBuffer } from "../../src/server/txBuffer";
import { auth } from "../../src/server/auth";
import { normalizeWebhookPayloadToEvents, WebhookTxPayloadSchema } from "../../src/lib/journal/txTypes";

export async function POST(req: Request) {
  try {
    // 1. Auth Check
    const secret = req.headers.get("x-sparkfined-secret") || 
                   req.headers.get("authorization")?.replace("Bearer ", "");
    
    // We don't have the wallet address in the header usually, it comes in the payload 
    // or we need to look it up by secret. 
    // For this MVP, let's assume the payload contains the wallet address 
    // OR the secret maps to a wallet (but we only have wallet->secret map).
    
    // Let's assume the webhook payload tells us which wallet it is for, 
    // OR the webhook provider includes the wallet in the URL / query param.
    // The prompt says: "Secret should map to wallet... store a wallet->secret mapping".
    // But validation needs the wallet first.
    
    // Let's look at the payload first.
    const body = await req.json();
    
    // We need to know which wallet this is for to validate the secret.
    // Helius/Birdeye usually send the address in the payload (e.g. 'accountData' or similar).
    // Let's assume for our Normalized Types, we extract it.
    // But we need to validate BEFORE pushing.
    
    // Simplification for MVP: Pass wallet in query param for the webhook URL
    // e.g. /api/tx/monitor?wallet=...
    const url = new URL(req.url);
    const wallet = url.searchParams.get("wallet");
    
    if (!wallet) {
      return new Response(JSON.stringify({ error: "Missing wallet query param" }), { status: 400 });
    }

    if (!secret || !auth.validateSecret(wallet, secret)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // 2. Validate & Normalize Payload
    // Validation is "lenient" per prompt
    const parsedResult = WebhookTxPayloadSchema.safeParse(body);
    
    if (!parsedResult.success) {
      console.warn("Invalid webhook payload", parsedResult.error);
      return new Response(JSON.stringify({ error: "Invalid payload", details: parsedResult.error }), { status: 400 });
    }

    const events = normalizeWebhookPayloadToEvents(parsedResult.data, wallet);

    if (events.length === 0) {
      return new Response(JSON.stringify({ ok: true, received: 0, message: "No relevant events found" }), { status: 200 });
    }

    // 3. Push to Buffer
    await txBuffer.pushEvents(wallet, events);

    return new Response(JSON.stringify({ ok: true, received: events.length }), { status: 200 });

  } catch (error) {
    console.error("Monitor Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
