// Stub for Technical Analysis
export async function GET(req: Request) {
  return new Response(JSON.stringify({
    ok: true,
    data: {
      rsi: 55,
      macd: "bullish",
      source: "Stubbed Technical Data"
    }
  }), { status: 200 });
}
