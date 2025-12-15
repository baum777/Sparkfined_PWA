import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { fetchWalletSwaps } from '../../../src/lib/solana/providers/moralisTradeEvents'
import { MoralisClientError } from '../../../src/lib/solana/providers/moralisClient'

const WALLET_ADDRESS = '9saD9vQoTzCR1uU39hNGL1zLSv5fqgpvCDe7wPnM1hrN'

const mockFetch = vi.fn()

describe('fetchWalletSwaps', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_MORALIS_API_KEY', 'test-api-key')
    vi.stubGlobal('fetch', mockFetch as unknown as typeof fetch)
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('maps Moralis swap payloads into normalized trade events', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          result: [
            {
              signature: '0xabc',
              blockTime: 1700000000,
              transactionType: 'buy',
              priceUsd: '123.45',
              fromToken: { mint: 'USDC', symbol: 'USDC', amount: '200' },
              toToken: { mint: 'SOL', symbol: 'SOL', amount: '1.5' },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const events = await fetchWalletSwaps(WALLET_ADDRESS, { limit: 10, order: 'DESC', transactionTypes: ['buy'] })

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      txHash: '0xabc',
      timestamp: 1700000000 * 1000,
      walletAddress: WALLET_ADDRESS,
      side: 'BUY',
      source: 'moralis',
      amount: 1.5,
      price: 123.45,
      baseSymbol: 'SOL',
      quoteSymbol: 'USDC',
      baseMint: 'SOL',
      quoteMint: 'USDC',
    })
  })

  it('handles missing optional fields without throwing', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ result: [{ txHash: '0xdef', blockTimestamp: '2024-01-01T00:00:00.000Z' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const events = await fetchWalletSwaps(WALLET_ADDRESS)

    expect(events).toEqual([
      {
        txHash: '0xdef',
        timestamp: Date.parse('2024-01-01T00:00:00.000Z'),
        walletAddress: WALLET_ADDRESS,
        side: 'BUY',
        source: 'moralis',
        amount: null,
        price: null,
        baseSymbol: null,
        quoteSymbol: null,
        baseMint: null,
        quoteMint: null,
      },
    ])
  })

  it('throws a descriptive error when Moralis responds with failure', async () => {
    mockFetch.mockResolvedValueOnce(new Response('unauthorized', { status: 401 }))

    await expect(fetchWalletSwaps(WALLET_ADDRESS)).rejects.toMatchObject({
      name: 'MoralisClientError',
      status: 401,
    } satisfies Partial<MoralisClientError>)
  })
})
