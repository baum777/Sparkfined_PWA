const BASE_URL = 'https://solana-gateway.moralis.io'

interface QueryParams {
  [key: string]: string | number | boolean | undefined
}

function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) return
      url.searchParams.set(key, String(value))
    })
  }

  return url.toString()
}

export class MoralisClientError extends Error {
  constructor(message: string, public status?: number, public override cause?: unknown) {
    super(message)
    this.name = 'MoralisClientError'
  }
}

export async function moralisGet<T>(
  path: string,
  params?: QueryParams,
  fetchImpl: typeof fetch = fetch,
): Promise<T> {
  const apiKey = import.meta.env?.VITE_MORALIS_API_KEY ?? process.env.VITE_MORALIS_API_KEY

  if (!apiKey) {
    throw new MoralisClientError('Missing Moralis API key in VITE_MORALIS_API_KEY')
  }

  const url = buildUrl(path, params)

  let response: Response
  try {
    response = await fetchImpl(url, {
      headers: {
        Accept: 'application/json',
        'X-API-Key': apiKey,
      },
    })
  } catch (error) {
    throw new MoralisClientError('Failed to fetch Moralis endpoint', undefined, error)
  }

  if (!response.ok) {
    throw new MoralisClientError(`Moralis request failed with status ${response.status}`, response.status)
  }

  try {
    return (await response.json()) as T
  } catch (error) {
    throw new MoralisClientError('Failed to parse Moralis response JSON', response.status, error)
  }
}

export { BASE_URL as MORALIS_BASE_URL }
