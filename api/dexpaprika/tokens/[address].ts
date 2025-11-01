/**
 * Alpha Issue 1: Edge Proxies - DexPaprika
 *
 * Vercel Serverless Function
 * Route: /api/dexpaprika/tokens/[address]
 *
 * Purpose: Proxy DexPaprika API requests to protect API keys
 * - Timeout: 5s
 * - Retry: 1x on failure
 * - Validates Solana address input
 * - Forwards 4xx/5xx status codes
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEXPAPRIKA_BASE = process.env.DEXPAPRIKA_BASE || 'https://api.dexpaprika.com';
const DEXPAPRIKA_API_KEY = process.env.DEXPAPRIKA_API_KEY || '';
const TIMEOUT_MS = 5000;
const MAX_RETRIES = 1;

interface DexPaprikaProxyResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  provider: 'dexpaprika';
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
  res: VercelResponse<DexPaprikaProxyResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      provider: 'dexpaprika',
    });
  }

  // Extract address from query params
  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Address parameter required',
      provider: 'dexpaprika',
    });
  }

  // Validate Solana address
  if (!isValidSolanaAddress(address)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Solana address format',
      provider: 'dexpaprika',
    });
  }

  try {
    // Build DexPaprika API URL
    const apiUrl = `${DEXPAPRIKA_BASE}/v1/solana/tokens/${address}`;

    // Prepare headers
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    // Add API key if configured
    if (DEXPAPRIKA_API_KEY) {
      headers['Authorization'] = `Bearer ${DEXPAPRIKA_API_KEY}`;
    }

    // Fetch from DexPaprika with timeout and retry
    const response = await fetchWithRetry(apiUrl, { headers });

    // Parse response
    const data = await response.json();

    // Forward status code and response
    if (response.ok) {
      return res.status(200).json({
        success: true,
        data,
        provider: 'dexpaprika',
      });
    } else {
      // Forward 4xx/5xx errors
      return res.status(response.status).json({
        success: false,
        error: data.error || data.message || 'Request failed',
        provider: 'dexpaprika',
      });
    }
  } catch (error) {
    console.error('[DexPaprika Proxy] Error:', error);

    // Check for timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        error: 'Request timeout',
        provider: 'dexpaprika',
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      provider: 'dexpaprika',
    });
  }
}
