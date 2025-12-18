export interface HoldingDTO {
  symbol: string;
  name: string;
  amount: number;
  valueUsd: number;
  changePct24h?: number;
  iconUrl?: string;
}

const MOCK_HOLDINGS: HoldingDTO[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    amount: 145.5,
    valueUsd: 14550.00,
    changePct24h: 5.24,
  },
  {
    symbol: 'JUP',
    name: 'Jupiter',
    amount: 2500,
    valueUsd: 2750.00,
    changePct24h: -2.15,
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    amount: 15000000,
    valueUsd: 450.00,
    changePct24h: 12.5,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    amount: 5432.10,
    valueUsd: 5432.10,
    changePct24h: 0.01,
  }
];

export async function getHoldings(walletAddress?: string): Promise<HoldingDTO[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  if (!walletAddress) {
    return [];
  }

  // In a real implementation, this would fetch from an indexer or RPC
  // For now, we return deterministic mock data
  return MOCK_HOLDINGS;
}
