import { Hono } from 'hono';
import type { AgentBindings } from './agent/prompt';
import { loadSystemPrompt } from './agent/prompt';

type Bindings = AgentBindings & {
  CORS_ORIGINS?: string;
};

type Variables = {
  identityEmail: string | null;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

function parseAllowedOrigins(rawOrigins?: string): string[] {
  if (!rawOrigins) {
    return [];
  }

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function buildCorsHeaders(
  origin: string | null,
  allowedOrigins: string[],
): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers':
      'Cf-Access-Jwt-Assertion, Cf-Access-Authenticated-User-Email, Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

app.use('*', async (c, next) => {
  const origin = c.req.header('Origin') ?? null;
  const allowedOrigins = parseAllowedOrigins(c.env.CORS_ORIGINS);
  const corsHeaders = buildCorsHeaders(origin, allowedOrigins);

  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    c.header(key, value);
  });

  const accessJwt = c.req.header('Cf-Access-Jwt-Assertion');
  const identity = c.req.header('Cf-Access-Authenticated-User-Email') ?? null;

  if (!accessJwt) {
    return c.json(
      {
        ok: false,
        error: 'AUTH_REQUIRED',
        hint: 'Authenticate via Access, then POST /v1/agent/plan with your goal.',
      },
      401,
    );
  }

  c.set('identityEmail', identity);

  await next();
});

app.get('/v1/health', (c) => {
  return c.json({ ok: true, data: { service: 'healthy' }, hint: 'Static health; deps not probed.' });
});

app.get('/v1/cors', (c) => {
  const allowedOrigins = parseAllowedOrigins(c.env.CORS_ORIGINS);
  return c.json({ ok: true, data: { origins: allowedOrigins } });
});

app.get('/v1/config', (c) => {
  const allowedOrigins = parseAllowedOrigins(c.env.CORS_ORIGINS);
  return c.json({
    ok: true,
    data: {
      cors: allowedOrigins,
    },
    hint: 'Public config only; secrets redacted.',
  });
});

app.get('/v1/whoami', (c) => {
  const identity = c.get('identityEmail');

  if (!identity) {
    return c.json(
      {
        ok: false,
        error: 'INSUFFICIENT_CONTEXT',
        hint: 'Access identity header missing; check Access policy mappings.',
      },
      400,
    );
  }

  return c.json({ ok: true, data: { sub: identity } });
});

app.post('/v1/agent/plan', async (c) => {
  await loadSystemPrompt(c.executionCtx, c.env);

  let body: unknown;
  try {
    body = await c.req.json();
  } catch (error) {
    return c.json(
      { ok: false, error: 'INVALID_INPUT', hint: 'Body must be valid JSON with a goal string.' },
      400,
    );
  }

  const goal = typeof body === 'object' && body !== null ? (body as Record<string, unknown>).goal : undefined;

  if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
    return c.json(
      { ok: false, error: 'INVALID_INPUT', hint: 'Missing goal' },
      400,
    );
  }

  const plan = [`Analyze goal: ${goal}`, 'Select safe tools', 'Return structured plan'];

  return c.json({ ok: true, data: { plan }, hint: 'Static plan; LLM call omitted.' });
});

app.post('/v1/agent/exec', (c) => {
  return c.json(
    {
      ok: false,
      error: 'POLICY_DENIED',
      hint: 'Execution disabled in this environment; request plan-only mode.',
    },
    403,
  );
});

app.notFound((c) => c.json({ ok: false, error: 'INVALID_INPUT', hint: 'Route not found.' }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json(
    { ok: false, error: 'UPSTREAM_FAILURE', hint: 'Unhandled exception; inspect logs.' },
    500,
  );
});

export default app;
