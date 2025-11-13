// tests/mocks/aiProxyMock.ts
import http from 'http';
import type { AddressInfo } from 'net';

export type AiMockHandle = {
  url: string;
  close: () => Promise<void>;
};

/**
 * Startet einen kleinen HTTP-Mockserver für AI-Proxy requests.
 * Wenn `port` nicht gesetzt ist, verwendet die OS-Portauswahl (0) -> verhindert EADDRINUSE.
 */
export function startAiProxyMock(port?: number): Promise<AiMockHandle> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        // einfache Mock-Antwort — passe an die bestehende Logik an
        // z.B. behavior based on req.url / method / body
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, text: 'mocked response', provider: 'mock' }));
      } catch (err) {
        res.writeHead(500);
        res.end();
      }
    });

    server.on('error', (err) => reject(err));

    // bind to provided port or 0 -> OS assigns free port
    server.listen(port ?? 0, '127.0.0.1', () => {
      const addr = server.address() as AddressInfo;
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
