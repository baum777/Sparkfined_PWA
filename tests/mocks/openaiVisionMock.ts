import http from 'node:http'

export interface OpenAIVisionMockOptions {
  port?: number
  latencyMs?: number
}

export interface OpenAIVisionMock {
  baseURL: string
  close: () => Promise<void>
}

/**
 * Lightweight mock for OpenAI vision endpoint. Use placeholder secrets (`// REDACTED_TOKEN`).
 */
export function startOpenAIVisionMock(options: OpenAIVisionMockOptions = {}): Promise<OpenAIVisionMock> {
  const port = options.port ?? 5566
  const latencyMs = options.latencyMs ?? 50

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (req.method !== 'POST' || req.url !== '/v1/chat/completions') {
        res.statusCode = 404
        res.end('Not Found')
        return
      }

      await new Promise((r) => setTimeout(r, latencyMs))

      const body = JSON.stringify({
        id: 'mock-chatcmpl',
        object: 'chat.completion',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: JSON.stringify({
                sr_levels: [
                  { label: 'S1', price: 0.000041, type: 'support' },
                  { label: 'R1', price: 0.000049, type: 'resistance' }
                ],
                stop_loss: 0.000039,
                tp: [0.000046, 0.000051],
                indicators: ['RSI 64', 'VWAP support'],
                teaser_text: 'Range-Breakout mit klaren SR-Zonen.',
                confidence: 0.72
              }),
            },
            finish_reason: 'stop',
          },
        ],
      })

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.setHeader('x-mock-secret', '// REDACTED_TOKEN')
      res.end(body)
    })

    server.on('error', reject)
    server.listen(port, () => {
      resolve({
        baseURL: `http://127.0.0.1:${port}/v1`,
        close: () => new Promise<void>((closeResolve) => server.close(() => closeResolve()))
      })
    })
  })
}
