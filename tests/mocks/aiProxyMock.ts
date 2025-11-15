import http from 'http';
import type { AddressInfo } from 'net';

export type AiMockHandle = { url: string; close: () => Promise<void> };
export type AiMockOptions = {
  port?: number;
  responseBody?: any;
  expectedSecret?: string;
  onRequest?: (body: Record<string, any>) => void;
};

const responseBodyDefault = {
  ok: true,
  provider: 'mock',
  text: 'Mocked bullet list',
  usage: { input_tokens: 1, output_tokens: 1 },
};

export function startAiProxyMock(portOrOptions?: number | AiMockOptions): Promise<AiMockHandle> {
  const opts: AiMockOptions = typeof portOrOptions === 'number' ? { port: portOrOptions } : portOrOptions ?? {};

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const chunks: Array<Buffer> = [];
      let parsedBody: Record<string, any> | null = null;

      req.on('data', (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });

      req.on('end', () => {
        if (opts.expectedSecret && req.headers['authorization'] !== opts.expectedSecret) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Unauthorized' }));
          return;
        }

        const raw = chunks.length ? Buffer.concat(chunks).toString('utf8') : '';
        if (raw) {
          try {
            parsedBody = JSON.parse(raw) as Record<string, any>;
            opts.onRequest?.(parsedBody);
          } catch {
            // ignore malformed JSON, still return deterministic response
          }
        } else if (opts.onRequest) {
          // Allow onRequest handlers to observe empty payloads.
          parsedBody = {};
          opts.onRequest(parsedBody);
        }

        const defaultBody = {
          ...responseBodyDefault,
          provider: parsedBody?.provider ?? responseBodyDefault.provider,
        };
        const body = opts.responseBody ?? defaultBody;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(body));
      });

      req.on('error', () => {
        res.writeHead(500);
        res.end();
      });
    });

    server.on('error', reject);

    const bindPort = opts.port ?? 0; // 0 -> ephemeral
    server.listen(bindPort, '127.0.0.1', () => {
      const addr = server.address() as AddressInfo | null;
      if (!addr || typeof addr.port !== 'number') {
        reject(new Error('could not determine mock server port'));
        return;
      }
      const url = `http://127.0.0.1:${addr.port}`;
      resolve({
        url,
        close: () =>
          new Promise<void>((resClose) => {
            server.close(() => resClose());
          }),
      });

    });
  });
}
