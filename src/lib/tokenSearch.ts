/**
 * Token Search Service
 *
 * Mock implementation of token search functionality.
 * In production, this would call a real API (Moralis, DexScreener, etc.).
 *
 * Performance Target: <50ms response time for <200ms total perceived latency
 * (150ms debounce + 50ms search = 200ms)
 */

import type { Token, TokenSearchResult } from '@/types/token';

// Mock token database (in production, this would be an API call)
const MOCK_TOKENS: Token[] = [
  {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    price: 152.34,
    change24h: 12.5,
    volume24h: 2400000000,
    marketCap: 68500000000,
    tags: ['Layer-1', 'DeFi'],
    chain: 'Solana',
  },
  {
    address: '0x0000000000000000000000000000000000000001',
    symbol: 'BTC',
    name: 'Bitcoin',
    logoURI: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    price: 98234.56,
    change24h: -2.3,
    volume24h: 45000000000,
    marketCap: 1900000000000,
    tags: ['Layer-1', 'Store of Value'],
    chain: 'Bitcoin',
  },
  {
    address: '0x0000000000000000000000000000000000000002',
    symbol: 'ETH',
    name: 'Ethereum',
    logoURI: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    price: 3842.12,
    change24h: 5.8,
    volume24h: 28000000000,
    marketCap: 462000000000,
    tags: ['Layer-1', 'Smart Contracts', 'DeFi'],
    chain: 'Ethereum',
  },
  {
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    price: 1.0,
    change24h: 0.01,
    volume24h: 5800000000,
    marketCap: 38000000000,
    tags: ['Stablecoin'],
    chain: 'Solana',
  },
  {
    address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    symbol: 'USDT',
    name: 'Tether USD',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
    price: 1.0,
    change24h: -0.02,
    volume24h: 82000000000,
    marketCap: 96000000000,
    tags: ['Stablecoin'],
    chain: 'Solana',
  },
  {
    address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    symbol: 'mSOL',
    name: 'Marinade Staked SOL',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
    price: 164.82,
    change24h: 11.9,
    volume24h: 45000000,
    marketCap: 1200000000,
    tags: ['Liquid Staking', 'DeFi'],
    chain: 'Solana',
  },
  {
    address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    symbol: 'JUP',
    name: 'Jupiter',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN/logo.png',
    price: 1.24,
    change24h: 18.3,
    volume24h: 285000000,
    marketCap: 1600000000,
    tags: ['DeFi', 'DEX'],
    chain: 'Solana',
  },
  {
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    symbol: 'BONK',
    name: 'Bonk',
    logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
    price: 0.000012,
    change24h: 45.2,
    volume24h: 125000000,
    marketCap: 820000000,
    tags: ['Meme', 'Community'],
    chain: 'Solana',
  },
  {
    address: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    symbol: 'WIF',
    name: 'dogwifhat',
    logoURI: 'https://bafkreibk3covs5ltyqxa272uodhculbr6kea6betidfwy3ajsav2vjzyum.ipfs.nftstorage.link',
    price: 2.84,
    change24h: 23.7,
    volume24h: 420000000,
    marketCap: 2800000000,
    tags: ['Meme'],
    chain: 'Solana',
  },
  {
    address: '0x0000000000000000000000000000000000000003',
    symbol: 'AVAX',
    name: 'Avalanche',
    logoURI: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
    price: 42.18,
    change24h: 8.4,
    volume24h: 680000000,
    marketCap: 16500000000,
    tags: ['Layer-1', 'DeFi'],
    chain: 'Avalanche',
  },
];

/**
 * Search tokens by query string
 *
 * @param query - Search query (minimum 2 characters)
 * @param maxResults - Maximum number of results (default: 7, per 2025 best practices)
 * @returns Array of matching tokens, sorted by relevance
 */
export async function searchTokens(
  query: string,
  maxResults: number = 7
): Promise<TokenSearchResult[]> {
  const startTime = performance.now();

  // Simulate realistic API delay (10-30ms)
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 20 + 10));

  if (!query || query.length < 2) {
    return [];
  }

  const lowerQuery = query.toLowerCase();

  // Search algorithm: match symbol, name, or tags
  const results = MOCK_TOKENS.map((token) => {
    let relevance = 0;

    // Exact symbol match (highest priority)
    if (token.symbol.toLowerCase() === lowerQuery) {
      relevance = 1.0;
    }
    // Symbol starts with query
    else if (token.symbol.toLowerCase().startsWith(lowerQuery)) {
      relevance = 0.9;
    }
    // Symbol contains query
    else if (token.symbol.toLowerCase().includes(lowerQuery)) {
      relevance = 0.7;
    }
    // Name starts with query
    else if (token.name.toLowerCase().startsWith(lowerQuery)) {
      relevance = 0.8;
    }
    // Name contains query
    else if (token.name.toLowerCase().includes(lowerQuery)) {
      relevance = 0.6;
    }
    // Tag match
    else if (token.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))) {
      relevance = 0.4;
    }

    return { ...token, relevance };
  })
    .filter((token) => token.relevance > 0)
    .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
    .slice(0, maxResults);

  const endTime = performance.now();
  const latency = endTime - startTime;

  // Log slow searches (target: <50ms)
  if (latency > 50) {
    console.warn(`[TokenSearch] Slow search: ${latency.toFixed(2)}ms for query "${query}"`);
  }

  return results;
}

/**
 * Get popular/trending tokens (for empty state or homepage)
 *
 * @param limit - Number of tokens to return (default: 5)
 * @returns Array of popular tokens
 */
export async function getPopularTokens(limit: number = 5): Promise<Token[]> {
  // Return top tokens by market cap
  return MOCK_TOKENS.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0)).slice(0, limit);
}

/**
 * Get token by address
 *
 * @param address - Token contract address
 * @returns Token or undefined if not found
 */
export async function getTokenByAddress(address: string): Promise<Token | undefined> {
  return MOCK_TOKENS.find((token) => token.address === address);
}
