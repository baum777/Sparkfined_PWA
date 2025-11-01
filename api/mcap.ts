/**
 * Market Cap API Endpoint (Mock for MVP)
 * 
 * TODO: Issue #2 - Replace with real Pyth oracle integration
 * Future: Fetch real-time MCAP from Pyth Network
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported' 
    });
  }

  try {
    // Mock market cap value (fallback as per specs)
    // TODO: Replace with Pyth API call
    const mcap = 3_500_000; // $3.5M default
    
    // Return MCAP with timestamp
    return res.status(200).json({
      mcap,
      timestamp: Date.now(),
      source: 'mock', // Will be 'pyth' after Issue #2
      note: 'Mock value - Pyth integration pending (Issue #2)'
    });

  } catch (error: unknown) {
    console.error('[API /mcap] Error:', error);
    
    const err = error as { message?: string };
    return res.status(500).json({
      error: 'Failed to fetch market cap',
      message: err.message || 'Unknown error'
    });
  }
}
