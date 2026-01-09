function readEnv(key: string): string | undefined {
  // Keep Node usage safe in mixed toolchains.
  const env =
    typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined>)
      : undefined;
  return env?.[key];
}

function requireEnv(key: string): string {
  const v = readEnv(key);
  if (!v) {
    throw new Error(`[env] Missing required env var: ${key}`);
  }
  return v;
}

function readIntEnv(key: string): number | undefined {
  const v = readEnv(key);
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export interface HeliusEnv {
  apiKey: string;
  rpcUrl: string;
  dasRpcUrl: string;
  timeoutMs: number;
}

export function getHeliusEnv(): HeliusEnv {
  const apiKey = requireEnv("HELIUS_API_KEY");

  const rpcUrl =
    readEnv("HELIUS_RPC_URL") ?? `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
  const dasRpcUrl = readEnv("HELIUS_DAS_RPC_URL") ?? rpcUrl;

  const timeoutMs =
    readIntEnv("HELIUS_TIMEOUT_MS") ??
    readIntEnv("LLM_TIMEOUT_MS") ??
    10_000;

  return { apiKey, rpcUrl, dasRpcUrl, timeoutMs };
}

