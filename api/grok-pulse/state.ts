export const config = { runtime: "edge" };

import {
  getCurrentSnapshot,
  getHistory,
  getPulseGlobalList,
  getPulseMetaLastRun,
} from "../../src/lib/grokPulse/kv";
import type {
  GrokSentimentHistoryEntry,
  GrokSentimentSnapshot,
} from "../../src/lib/grokPulse/types";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const addressesParam = url.searchParams.get("addresses")?.trim();

  let addresses: string[] = [];
  if (addressesParam && addressesParam.length > 0) {
    addresses = addressesParam
      .split(",")
      .map((addr) => addr.trim())
      .filter(Boolean);
  } else {
    const tokens = await getPulseGlobalList();
    addresses = tokens.map((token) => token.address);
  }

  const sentimentsByAddress: Record<string, GrokSentimentSnapshot | null> = {};
  const historyByAddress: Record<string, GrokSentimentHistoryEntry[]> = {};

  for (const address of addresses) {
    try {
      const snapshot = await getCurrentSnapshot(address);
      const history = await getHistory(address);
      sentimentsByAddress[address] = snapshot;
      historyByAddress[address] = history;
    } catch (error) {
      console.error("[grokPulse] failed to read state for", address, error);
      sentimentsByAddress[address] = null;
      historyByAddress[address] = [];
    }
  }

  const meta = await getPulseMetaLastRun();
  const lastPulseTs = meta?.ts ?? null;

  return json({ sentimentsByAddress, historyByAddress, lastPulseTs });
}
