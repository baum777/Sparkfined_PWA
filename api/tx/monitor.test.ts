import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './monitor';
import { txBuffer } from '../../src/server/txBuffer';
import { auth } from '../../src/server/auth';

vi.mock('../../src/server/txBuffer', () => ({
  txBuffer: {
    pushEvents: vi.fn(),
  }
}));

vi.mock('../../src/server/auth', () => ({
  auth: {
    validateSecret: vi.fn(),
  }
}));

// Mock generic Request object if needed, but Node 18+ has it. 
// If specific methods are missing, we might need a polyfill or custom class in test setup.
// We'll try using the global Request.

describe('API Monitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject requests without wallet query param', async () => {
    const req = new Request('http://localhost/api/tx/monitor', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Missing wallet');
  });

  it('should reject unauthorized requests', async () => {
    const req = new Request('http://localhost/api/tx/monitor?wallet=w1', {
      method: 'POST',
      headers: { 'x-sparkfined-secret': 'bad-secret' },
      body: JSON.stringify({}),
    });
    
    (auth.validateSecret as any).mockReturnValue(false);

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should accept valid payload and push to buffer', async () => {
    const payload = {
        signature: 'sig1',
        tokenTransfers: [{ mint: 'm1', amount: 1 }],
        timestamp: 1000
    };

    const req = new Request('http://localhost/api/tx/monitor?wallet=w1', {
      method: 'POST',
      headers: { 'x-sparkfined-secret': 'good-secret' },
      body: JSON.stringify(payload),
    });
    
    (auth.validateSecret as any).mockReturnValue(true);

    const res = await POST(req);
    expect(res.status).toBe(200);
    
    expect(txBuffer.pushEvents).toHaveBeenCalled();
  });
});
