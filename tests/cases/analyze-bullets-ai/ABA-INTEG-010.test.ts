import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import vars from '../../fixtures/analyze-bullets-ai/sample-vars.json';
import { startAiProxyMock, AiMockHandle } from '../../mocks/aiProxyMock';

describe('ABA-INTEG-010 — analyze bullets via proxy (mocked)', () => {
  let aiMock: AiMockHandle | undefined;
  const realFetch = globalThis.fetch;

  beforeAll(async () => {
    // start mock on an ephemeral port and expose its URL via env
    aiMock = await startAiProxyMock();
    process.env.AI_PROXY_URL = aiMock.url;

    // Intercept global fetch and rewrite requests to the mock when necessary.
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: any, init?: any) => {
      const target =
        typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);

      // If request already targets the mock, call through.
      if (aiMock && target.startsWith(aiMock.url)) {
        return realFetch(input, init);
      }

      // Otherwise rewrite relative/absolute urls to the mock base.
      const rewritten = aiMock ? new URL(target, aiMock.url).toString() : target;
      return realFetch(rewritten, {
        ...init,
        headers: {
          ...(init?.headers as Record<string, string>),
          authorization: 'Bearer // REDACTED_TOKEN',
        },
      } as RequestInit);
    });
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    if (aiMock) {
      await aiMock.close();
    }
    delete process.env.AI_PROXY_URL;
  });

    it('returns mocked bullet payload', async () => {
    // import aiAssist lazily to ensure it picks up AI_PROXY_URL set in beforeAll
    const { aiAssist } = await import('@/lib/aiClient');

    const response = await aiAssist({
      provider: 'anthropic',
      templateId: 'v1/analyze_bullets',
      vars,
    });

    expect(response.ok).toBe(true);

    // ensure the text field exists before using string operations
    expect(response.text).toBeDefined();
    // coerce to string (or use non-null assertion) for TS safety
    expect(String(response.text).toLowerCase()).toContain('mock');

    expect(typeof response.provider).toBe('string');
  });

});
