/**
 * API Contract Tests - MSW Setup
 * 
 * Mock Service Worker setup for Node environment
 * Provides isolated HTTP-level testing for API endpoints
 * 
 * Usage:
 * import { server, apiFetch } from './setup';
 * 
 * beforeAll(() => server.listen());
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 */

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Default handlers (empty - will be defined per test file)
export const server = setupServer();

/**
 * Helper: API fetch wrapper for testing
 * @param url - API endpoint (e.g., '/api/journal')
 * @param options - Fetch options (method, body, headers)
 * @returns Response
 */
export async function apiFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const baseUrl = 'http://localhost:3000';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  return fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
}

/**
 * Helper: Parse JSON response safely
 */
export async function parseJSON<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

/**
 * Helper: Create mock handlers for specific endpoints
 */
export function createJournalHandlers() {
  return [
    // POST /api/journal - Create entry
    http.post('http://localhost:3000/api/journal', async ({ request }) => {
      const body = await request.json() as any;
      
      return HttpResponse.json({
        id: 'mock-journal-id',
        ...body,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }, { status: 201 });
    }),

    // PUT /api/journal/:id - Update entry
    http.put('http://localhost:3000/api/journal/:id', async ({ request, params }) => {
      const body = await request.json() as any;
      const { id } = params;

      return HttpResponse.json({
        id,
        ...body,
        updatedAt: Date.now(),
      }, { status: 200 });
    }),

    // DELETE /api/journal/:id - Delete entry
    http.delete('http://localhost:3000/api/journal/:id', ({ params }) => {
      return HttpResponse.json({ success: true }, { status: 200 });
    }),

    // GET /api/journal - List entries
    http.get('http://localhost:3000/api/journal', () => {
      return HttpResponse.json({ entries: [] }, { status: 200 });
    }),
  ];
}

export function createRulesHandlers() {
  return [
    // POST /api/rules - Create rule
    http.post('http://localhost:3000/api/rules', async ({ request }) => {
      const body = await request.json() as any;
      
      return HttpResponse.json({
        id: 'mock-rule-id',
        ...body,
        createdAt: Date.now(),
      }, { status: 201 });
    }),

    // PUT /api/rules/:id - Update rule
    http.put('http://localhost:3000/api/rules/:id', async ({ request, params }) => {
      const body = await request.json() as any;
      const { id } = params;

      return HttpResponse.json({
        id,
        ...body,
        updatedAt: Date.now(),
      }, { status: 200 });
    }),

    // DELETE /api/rules/:id - Delete rule
    http.delete('http://localhost:3000/api/rules/:id', () => {
      return HttpResponse.json({ success: true }, { status: 200 });
    }),

    // GET /api/rules/eval - Evaluate rules
    http.get('http://localhost:3000/api/rules/eval', () => {
      return HttpResponse.json({
        evaluated: 0,
        triggered: [],
      }, { status: 200 });
    }),
  ];
}

export function createIdeasHandlers() {
  return [
    // POST /api/ideas - Create idea
    http.post('http://localhost:3000/api/ideas', async ({ request }) => {
      const body = await request.json() as any;
      
      return HttpResponse.json({
        id: 'mock-idea-id',
        ...body,
        createdAt: Date.now(),
      }, { status: 201 });
    }),

    // PUT /api/ideas/:id - Update idea
    http.put('http://localhost:3000/api/ideas/:id', async ({ request, params }) => {
      const body = await request.json() as any;
      const { id } = params;

      return HttpResponse.json({
        id,
        ...body,
        updatedAt: Date.now(),
      }, { status: 200 });
    }),
  ];
}

// Export HTTP helpers for custom handlers
export { http, HttpResponse };
