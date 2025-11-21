import {
  getCurrentSnapshot,
  getHistory,
  getPulseGlobalList,
  getPulseMetaLastRun,
} from "../../src/lib/grokPulse/kv";
import type { GrokSentimentHistoryEntry, GrokSentimentSnapshot } from "../../src/lib/grokPulse/types";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const addressesParam = url.searchParams.get("addresses");

  let addresses: string[] = [];
  if (addressesParam) {
    addresses = addressesParam
      .split(",")
      .map((addr) => addr.trim())
      .filter(Boolean);
  }

  if (addresses.length === 0) {
    const globalList = await getPulseGlobalList();
    addresses = globalList.map((token) => token.address);
  }

  const sentimentsByAddress: Record<string, GrokSentimentSnapshot | null> = {};
  const historyByAddress: Record<string, GrokSentimentHistoryEntry[]> = {};

  for (const address of addresses) {
    sentimentsByAddress[address] = await getCurrentSnapshot(address);
    historyByAddress[address] = await getHistory(address);
  }

  const meta = await getPulseMetaLastRun();

  return new Response(
    JSON.stringify({
      sentimentsByAddress,
      historyByAddress,
      lastPulseTs: meta?.ts ?? null,
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  );
}
