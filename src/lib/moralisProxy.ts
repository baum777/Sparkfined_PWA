/**
 * Client-side Moralis proxy helper
 * Routes Moralis requests through the serverless /api/moralis proxy
 * to avoid exposing secrets in the browser bundle.
 */

export interface MoralisProxyOptions extends Omit<RequestInit, 'body'> {
  /** Structured payload that will be JSON.stringify'ed automatically */
  body?: unknown
  /** If true, skips JSON.stringify and sends the body as-is */
  rawBody?: BodyInit | null
}

/**
 * Fetch helper that calls the Moralis proxy endpoint.
 *
 * @param path Relative Moralis path (e.g. `/erc20/...`)
 * @param options Additional fetch options
 */
export async function moralisFetch<T = unknown>(
  path: string,
  options: MoralisProxyOptions = {},
): Promise<T> {
  const url = `/api/moralis${path.startsWith('/') ? path : `/${path}`}`
  const headers = new Headers(options.headers)
  const { body, rawBody, ...rest } = options

  const init: RequestInit = {
    ...rest,
    headers,
  }

  if (rawBody !== undefined) {
    init.body = rawBody
  } else if (body !== undefined && body !== null) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    init.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  try {
    const response = await fetch(url, init)
    if (!response.ok) {
      const text = await response.text()
      const error = new Error(`Moralis proxy error (${response.status}): ${text}`)
      ;(error as Error & { status?: number; body?: string }).status = response.status
      ;(error as Error & { status?: number; body?: string }).body = text
      throw error
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T
    }

    // Fallback: return raw text when upstream doesn't provide JSON
    return (await response.text()) as T
  } catch (error) {
    if (error instanceof Error) {
      error.message = `[MoralisProxy] ${error.message}`
    }
    throw error
  }
}
