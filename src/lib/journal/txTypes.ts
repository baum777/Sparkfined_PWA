import { z } from "zod";

// --- Shared Types ---

/**
 * Normalized transaction event shape used by both server and client.
 * Deterministic ordering by blockTime then signature.
 */
export type NormalizedTxEvent = {
  signature: string;
  wallet: string;
  blockTime: number; // Unix timestamp in seconds (or ms, but standardized) - let's use Unix Timestamp (seconds) as is common in Solana
  tokenMint: string;
  type: "BUY" | "SELL";
  amountToken: number;
  amountUsd: number | null;
  priceUsd: number | null;
  dex: string | null;
  // Optional raw data for debugging/context, but kept minimal
  raw?: Record<string, unknown>;
};

// --- Zod Schemas ---

/**
 * Strict schema for the normalized event.
 */
export const NormalizedTxEventSchema = z.object({
  signature: z.string(),
  wallet: z.string(),
  blockTime: z.number(),
  tokenMint: z.string(),
  type: z.enum(["BUY", "SELL"]),
  amountToken: z.number(),
  amountUsd: z.number().nullable(),
  priceUsd: z.number().nullable(),
  dex: z.string().nullable(),
  raw: z.record(z.unknown()).optional(),
});

/**
 * Lenient schema for inbound webhooks (e.g. from Helius/Birdeye).
 * This acts as a validator for the raw payload before normalization.
 * Note: This schema might need adjustment based on the actual webhook provider.
 * For now, we define a generic structure that covers likely fields.
 */
export const WebhookTxPayloadSchema = z.object({
  // Common fields we expect (adjust based on provider)
  signature: z.string(),
  type: z.string().optional(), // might be "SWAP", "TRANSFER"
  timestamp: z.number().optional(),
  tokenTransfers: z.array(z.object({
    mint: z.string(),
    amount: z.number(),
    fromUserAccount: z.string().optional(),
    toUserAccount: z.string().optional(),
  })).optional(),
  // Allow other fields to pass through
}).passthrough();

/**
 * Helper to normalize a webhook payload into NormalizedTxEvent[].
 * This logic must be deterministic.
 */
export function normalizeWebhookPayloadToEvents(
  payload: z.infer<typeof WebhookTxPayloadSchema>,
  walletAddress: string
): NormalizedTxEvent[] {
  const events: NormalizedTxEvent[] = [];

  // TODO: Implement specific provider logic (Helius/Birdeye) here.
  // For this generic implementation, we'll map fields directly if they match our needs,
  // or return an empty array if the payload isn't a trade we care about.

  // Example logic (placeholder - to be refined with actual provider spec):
  if (payload.tokenTransfers && payload.timestamp) {
    // This is a simplified example. Real logic needs to determine BUY vs SELL
    // based on whether the wallet is sender or receiver of the token vs SOL/USDC.
    
    // We'll assume the payload represents a single "event" for now,
    // but a tx can have multiple events.
    
    // For the purpose of this task, we will try to extract a simple event.
    // In a real scenario, we would parse balance changes or instruction logs.
    
    // Let's create a stub event if we have basic info
    // This function should be robust against missing data
    
     const event: NormalizedTxEvent = {
        signature: payload.signature,
        wallet: walletAddress,
        blockTime: payload.timestamp,
        tokenMint: payload.tokenTransfers[0]?.mint || "unknown",
        type: "BUY", // simplified assumption
        amountToken: payload.tokenTransfers[0]?.amount || 0,
        amountUsd: null,
        priceUsd: null,
        dex: null,
        raw: payload as Record<string, unknown>,
      };
      events.push(event);
  }

  // Sort by blockTime (asc) then signature (asc) for determinism
  return events.sort((a, b) => {
    if (a.blockTime !== b.blockTime) return a.blockTime - b.blockTime;
    return a.signature.localeCompare(b.signature);
  });
}
