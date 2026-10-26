import type { MiddlewareHandler } from 'hono';
import {
  hasBacklogAuthErrorBeenReported,
  runWithAccessToken,
} from './backlogAuthContext.js';

// The bearer is a Backlog access token used as-is, with no authorization server in
// front of it: serve this only to a trusted caller, e.g. on a loopback bind.
export function createAccessTokenPassthroughMiddleware(): MiddlewareHandler {
  const unauthorized = (description: string) =>
    Response.json(
      { error: 'invalid_token', error_description: description },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } }
    );

  return async (c, next) => {
    const [type, token] = (c.req.header('authorization') ?? '').split(' ');
    if (type?.toLowerCase() !== 'bearer' || !token) {
      return unauthorized(
        'Expected a Backlog access token as the Bearer token'
      );
    }

    await runWithAccessToken(token, async () => {
      await next();
      if (hasBacklogAuthErrorBeenReported()) {
        c.res = unauthorized('Backlog rejected the access token');
      }
    });
  };
}
