/**
 * Alpha Issue 1: Edge Proxies - Moralis
 *
 * Vercel Serverless Function
 * Route: /api/moralis/token/[address]
 *
 * Purpose: Proxy Moralis API requests to protect API keys
 * - Timeout: 6s
 * - Retry: 1x on failure
 * - Validates Solana address input
 * - Forwards 4xx/5xx status codes
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const MORALIS_BASE = process.env.MORALIS_BASE || 'https://deep-index.moralis.io/api/v2.2';
const MORALIS_API_KEY = process.env.MORALIS_API_KEY || '';
const TIMEOUT_MS = 6000; // 6s timeout for Moralis
const MAX_RETRIES = 1;

interface MoralisProxyResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  provider: 'moralis';
}

/**
 * Validate Solana address (Base58, 32-44 chars)
 */
function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchWithTimeout(url, options, TIMEOUT_MS);
    } catch (error) {
      lastError = error as Error;

      // Only retry on network errors, not on HTTP errors
      if (attempt < retries) {
        // Exponential backoff: 100ms, 200ms, 400ms...
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse<MoralisProxyResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      provider: 'moralis',
    });
  }

  // Extract address from query params
  const { address, chain } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Address parameter required',
      provider: 'moralis',
    });
  }

  // Validate Solana address
  if (!isValidSolanaAddress(address)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Solana address format',
      provider: 'moralis',
    });
  }

  // Check if API key is configured
  if (!MORALIS_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'Moralis API key not configured',
      provider: 'moralis',
    });
  }

  try {
    // Build Moralis API URL with chain parameter (default: solana)
    const chainParam = (typeof chain === 'string' ? chain : 'solana');
    const apiUrl = `${MORALIS_BASE}/erc20/${address}/price?chain=${chainParam}`;

    // Prepare headers with X-API-Key
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'X-API-Key': MORALIS_API_KEY,
    };

    // Fetch from Moralis with timeout and retry
    const response = await fetchWithRetry(apiUrl, { headers });

    // Parse response
    const data = await response.json();

    // Forward status code and response
    if (response.ok) {
      return res.status(200).json({
        success: true,
        data,
        provider: 'moralis',
      });
    } else {
      // Forward 4xx/5xx errors
      return res.status(response.status).json({
        success: false,
        error: data.error || data.message || 'Request failed',
        provider: 'moralis',
      });
    }
  } catch (error) {
    console.error('[Moralis Proxy] Error:', error);

    // Check for timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        error: 'Request timeout',
        provider: 'moralis',
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      provider: 'moralis',
    });
  }
}
