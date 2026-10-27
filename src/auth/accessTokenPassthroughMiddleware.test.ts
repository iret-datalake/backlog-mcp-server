import { describe, it, expect } from 'vite-plus/test';
import { Hono } from 'hono';
import { createAccessTokenPassthroughMiddleware } from './accessTokenPassthroughMiddleware.js';
import {
  getCurrentAccessToken,
  reportBacklogAuthError,
} from './backlogAuthContext.js';

const createApp = (handler: () => Response) => {
  const app = new Hono();
  app.use('/mcp', createAccessTokenPassthroughMiddleware());
  app.all('/mcp', handler);
  return app;
};

describe('createAccessTokenPassthroughMiddleware', () => {
  it('rejects a request without a bearer token', async () => {
    const app = createApp(() => new Response('ok'));

    const res = await app.request('/mcp', { method: 'POST' });

    expect(res.status).toBe(401);
    expect(res.headers.get('WWW-Authenticate')).toBe('Bearer');
  });

  it('rejects a non-bearer authorization header', async () => {
    const app = createApp(() => new Response('ok'));

    const res = await app.request('/mcp', {
      method: 'POST',
      headers: { Authorization: 'Basic abc' },
    });

    expect(res.status).toBe(401);
  });

  it('makes the bearer the Backlog access token of the request', async () => {
    let seen: string | undefined;
    const app = createApp(() => {
      seen = getCurrentAccessToken();
      return new Response('ok');
    });

    const res = await app.request('/mcp', {
      method: 'POST',
      headers: { Authorization: 'Bearer backlog-token-1' },
    });

    expect(res.status).toBe(200);
    expect(seen).toBe('backlog-token-1');
  });

  it('answers 401 when Backlog rejected the token during the request', async () => {
    const app = createApp(() => {
      reportBacklogAuthError();
      return new Response('tool result');
    });

    const res = await app.request('/mcp', {
      method: 'POST',
      headers: { Authorization: 'Bearer revoked-token' },
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ error: 'invalid_token' });
  });
});
