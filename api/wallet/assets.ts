import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isValidSolanaAddress } from "../../src/lib/wallet/address";
import { normalizeWalletAssetsResponse } from "../../src/lib/wallet/normalizeWalletAssets";

export const config = { runtime: "nodejs" };

const HELIUS_ENDPOINT = process.env.HELIUS_API_KEY
  ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
  : "";

function getOwnerParam(req: VercelRequest): string | null {
  const ownerParam = Array.isArray(req.query.owner) ? req.query.owner[0] : req.query.owner;
  if (!ownerParam || typeof ownerParam !== "string") return null;
  const trimmed = ownerParam.trim();
  return trimmed || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const owner = getOwnerParam(req);
  if (!owner) {
    return res.status(400).json({ error: "Missing owner query param" });
  }

  if (!isValidSolanaAddress(owner)) {
    return res.status(400).json({ error: "Invalid owner address" });
  }

  if (!HELIUS_ENDPOINT) {
    return res.status(500).json({ error: "HELIUS_API_KEY not configured" });
  }

  try {
    const heliusResponse = await fetch(HELIUS_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "sparkfined-wallet-assets",
        method: "getAssetsByOwner",
        params: {
          ownerAddress: owner,
          page: 1,
          limit: 1000,
          options: {
            showNativeBalance: true,
            showZeroBalance: false,
            showCollectionMetadata: false,
            showUnverifiedCollections: false,
          },
        },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!heliusResponse.ok) {
      const errorText = await heliusResponse.text();
      console.error(
        "[wallet/assets] Helius HTTP error",
        heliusResponse.status,
        heliusResponse.statusText,
        errorText
      );
      return res.status(502).json({ error: "Failed to fetch wallet assets" });
    }

    const heliusJson = await heliusResponse.json();

    if (heliusJson?.error) {
      console.error("[wallet/assets] Helius RPC error", heliusJson.error);
      return res
        .status(502)
        .json({ error: "Helius upstream error", message: heliusJson.error?.message });
    }

    const normalized = normalizeWalletAssetsResponse(owner, heliusJson);
    return res.status(200).json(normalized);
  } catch (error) {
    console.error("[wallet/assets] Failed to load assets", error);
    return res.status(502).json({
      error: "Failed to load wallet assets",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
