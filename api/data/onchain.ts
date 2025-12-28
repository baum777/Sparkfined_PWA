// Stub for Onchain Data Proxy (Helius/Solana RPC)
// Keys kept here, never sent to client
export async function GET(req: Request) {
  return new Response(JSON.stringify({
    ok: true,
    data: {
      blockHeight: 200000000,
      tps: 3000,
      source: "Stubbed Onchain Data"
    }
  }), { status: 200 });
}
