import http from 'node:http'

export interface AiProxyMockOptions {
  port?: number
  expectedSecret?: string
  onRequest?: (body: any) => void
  responseBody?: Record<string, any>
}

export interface AiProxyMock {
  url: string
  close: () => Promise<void>
}

/**
 * Starts a minimal HTTP server that mimics the Sparkfined AI proxy endpoint.
 * Secrets are never persisted; use `expectedSecret` with placeholder tokens like `// REDACTED_TOKEN`.
 */
export function startAiProxyMock(options: AiProxyMockOptions = {}): Promise<AiProxyMock> {
  const port = options.port ?? 4455
  const expectedSecret = options.expectedSecret ?? 'Bearer // REDACTED_TOKEN'

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (req.method !== 'POST' || req.url !== '/api/ai/assist') {
        res.statusCode = 404
        res.end('Not Found')
        return
      }

      if (expectedSecret && req.headers['authorization'] !== expectedSecret) {
        res.statusCode = 401
        res.end('Unauthorized')
        return
      }

      const chunks: Buffer[] = []
      req.on('data', (chunk) => chunks.push(chunk as Buffer))
      req.on('end', () => {
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
          options.onRequest?.(body)
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify(options.responseBody ?? {
            ok: true,
            provider: body.provider,
            model: body.model ?? 'mock-model',
            text: 'Mocked bullet list',
            usage: { input_tokens: 300, output_tokens: 180 },
            costUsd: 0.00042,
            fromCache: false,
          }))
        } catch (error) {
          res.statusCode = 500
          res.end(JSON.stringify({ ok: false, error: (error as Error).message }))
        }
      })
    })

    server.on('error', reject)
    server.listen(port, () => {
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise<void>((closeResolve) => server.close(() => closeResolve()))
      })
    })
  })
}
