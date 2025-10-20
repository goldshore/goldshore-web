import { Hono } from 'hono';

const ALLOWED_ORIGINS = (CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = new Hono();

function buildCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'Cf-Access-Jwt-Assertion, Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

app.use('*', async (c, next) => {
  const origin = c.req.header('Origin') ?? null;
  const corsHeaders = buildCorsHeaders(origin);

  if (c.req.method === 'OPTIONS') {
    return c.json({}, 204, corsHeaders);
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    c.header(key, value);
  });

  const accessToken = c.req.header('Cf-Access-Jwt-Assertion');
  if (!accessToken) {
    return c.json({ error: 'missing_access_token' }, 401);
  }

  // TODO: verify the token against ACCESS_JWKS_URL.

  await next();
});

app.get('/health', (c) => {
  return c.json({ ok: true });
});

app.notFound((c) => c.json({ error: 'not_found' }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'internal_error' }, 500);
});

export default app;

declare const CORS_ORIGINS: string;
