import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../../api/oracle';

const originalFetch = global.fetch;
const originalEnv = {
  secret: process.env.ORACLE_CRON_SECRET,
  apiKey: process.env.XAI_API_KEY,
};

function buildResponse(content: string) {
  return new Response(
    JSON.stringify({
      choices: [
        {
          message: {
            content,
          },
        },
      ],
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }
  );
}

describe('/api/oracle handler', () => {
  beforeEach(() => {
    process.env.ORACLE_CRON_SECRET = 'unit-secret';
    process.env.XAI_API_KEY = 'fake-key';
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.ORACLE_CRON_SECRET = originalEnv.secret;
    process.env.XAI_API_KEY = originalEnv.apiKey;
    vi.restoreAllMocks();
  });

  it('rejects unauthorized requests', async () => {
    const res = await handler(new Request('http://localhost/api/oracle'));
    expect(res.status).toBe(401);
  });

  it('returns combined Grok payload when auth succeeds', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(buildResponse('SCORE: 5/7'))
      .mockResolvedValueOnce(buildResponse('TOP THEME: Gaming'))
      .mockResolvedValueOnce(buildResponse('EARLY ALPHA CAs:\n1. ...'));

    const res = await handler(
      new Request('http://localhost/api/oracle', {
        headers: { authorization: 'Bearer unit-secret' },
      })
    );
    expect(res.status).toBe(200);

    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toMatchObject({
      score: 5,
      theme: 'Gaming',
    });
    expect(typeof body.report).toBe('string');
  });
});
