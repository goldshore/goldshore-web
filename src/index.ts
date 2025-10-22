import { Hono } from 'hono';
import type { Context } from 'hono';
import type { AgentBindings } from './agent/prompt';
import { loadSystemPrompt } from './agent/prompt';

type Bindings = AgentBindings & {
  CORS_ORIGINS?: string;
};

type Variables = {
  identityEmail: string;
  scopes: string[];
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

function renderSwagger({ css }: { css: string }): string {
  return `<!DOCTYPE html>
  <html lang="en" data-theme="dark">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>GoldShore API</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
      <link rel="stylesheet" href="${css}" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin="anonymous"></script>
      <script src="/swagger-init.js" type="module"></script>
    </body>
  </html>`;
}

function parseAllowedOrigins(rawOrigins?: string): string[] {
  if (!rawOrigins) {
    return [];
  }

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function buildCorsHeaders(origin: string | null, allowedOrigins: string[]): Record<string, string> {
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

function parseScopes(rawScopes?: string | null): string[] {
  if (!rawScopes) {
    return [];
  }

  const trimmed = rawScopes.trim();
  if (!trimmed) {
    return [];
  }

  const unwrapMatchingQuotes = (value: string) => {
    if (value.length < 2) {
      return value;
    }

    const first = value[0];
    const last = value[value.length - 1];
    if (first === last && (first === '"' || first === "'")) {
      return value.slice(1, -1);
    }

    return value;
  };

  const unwrapped = unwrapMatchingQuotes(trimmed);
  const candidates = unwrapped === trimmed ? [trimmed] : [unwrapped, trimmed];

  for (const candidate of candidates) {
    if (!candidate.startsWith('[')) {
      continue;
    }

    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((scope): scope is string => typeof scope === 'string')
          .map((scope) => scope.trim())
          .filter(Boolean);
      }
    } catch (error) {
      // fall through to string parsing when JSON parsing fails
    }
  }

  return unwrapped
    .split(/[\s,]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
}

function ensureScope(c: Context<{ Bindings: Bindings; Variables: Variables }>, scope: string) {
  const scopes = c.get('scopes');
  if (!scopes.includes(scope)) {
    return c.json(
      { ok: false, error: 'FORBIDDEN', hint: `Scope ${scope} required.` },
      403,
    );
  }

  return null;
}

async function sha256Hex(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const digest = await globalThis.crypto.subtle.digest('SHA-256', encoder.encode(payload));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

const PUBLIC_ROUTES = new Set(['/v1/health', '/docs', '/swagger-init.js', '/swagger-overrides.css']);

app.use('*', async (c, next) => {
  const origin = c.req.header('Origin') ?? null;
  const allowedOrigins = parseAllowedOrigins(c.env.CORS_ORIGINS);
  const corsHeaders = buildCorsHeaders(origin, allowedOrigins);
  const path = new URL(c.req.url).pathname;

  if (c.req.method === 'OPTIONS') {
    return c.json({ ok: true, hint: 'Preflight accepted.' }, 204, corsHeaders);
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    c.header(key, value);
  });

  const isPublicRoute =
    c.req.method === 'GET' &&
    (path === '/v1/health' || path === '/docs' || path.startsWith('/swagger'));

  if (isPublicRoute) {
    await next();
    return;
  }

  const accessJwt = c.req.header('Cf-Access-Jwt-Assertion');
  const identity = c.req.header('Cf-Access-Authenticated-User-Email');
  const scopes = parseScopes(c.req.header('Cf-Access-Authenticated-User-Scopes'));

  if (PUBLIC_ROUTES.has(path) && (!accessJwt || !identity)) {
    return next();
  }

  if (!accessJwt || !identity) {
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
  c.set('scopes', scopes);

  await next();
});

app.get('/v1/health', (c) => {
  return c.json({
    ok: true,
    data: { status: 'Healthy', deps: { kv: 'unknown', r2: 'unknown' } },
    hint: 'Healthy; deps static stub.',
  });
});

app.get('/docs', (c) =>
  c.html(renderSwagger({ css: '/swagger-overrides.css' })),
);

app.get('/v1/cors', (c) => {
  const allowedOrigins = parseAllowedOrigins(c.env.CORS_ORIGINS);
  return c.json({ ok: true, data: { origins: allowedOrigins }, hint: 'Origins sourced from env.' });
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
  const scopes = c.get('scopes');

  return c.json({ ok: true, data: { sub: identity, scopes }, hint: 'Access subject verified.' });
});

app.post('/v1/agent/plan', async (c) => {
  await loadSystemPrompt(c.executionCtx, c.env);

  const scopeError = ensureScope(c, 'reader');
  if (scopeError) {
    return scopeError;
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch (error) {
    return c.json(
      { ok: false, error: 'INVALID_INPUT', hint: 'Body must be valid JSON with a goal string.' },
      400,
    );
  }

  const payload = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const goal = typeof payload.goal === 'string' ? payload.goal.trim() : '';
  const mode = typeof payload.mode === 'string' ? payload.mode : 'DRY_RUN';

  if (!goal) {
    return c.json(
      { ok: false, error: 'INVALID_INPUT', hint: 'Missing goal' },
      400,
    );
  }

  const normalizedMode = mode === 'APPLY' ? 'APPLY' : 'DRY_RUN';

  if (normalizedMode === 'APPLY') {
    const applyScopeError = ensureScope(c, 'ops');
    if (applyScopeError) {
      return applyScopeError;
    }
  }

  const plan = [
    'Verify auth via GET /v1/whoami',
    'Snapshot state with POST /v1/cf:list and /v1/gh:list',
    'Diff against desired state; classify impact tiers',
    normalizedMode === 'APPLY'
      ? 'DRY_RUN change tools, then APPLY per runbook order'
      : 'Compile audit findings into report payload',
    'POST /v1/agent/report with summary + next steps',
  ];

  return c.json({ ok: true, data: { plan, mode: normalizedMode, goal }, hint: 'Static runbook; extend with tool execution.' });
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

app.post('/v1/agent/report', async (c) => {
  const scopeError = ensureScope(c, 'reader');
  if (scopeError) {
    return scopeError;
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch (_) {
    return c.json(
      { ok: false, error: 'INVALID_INPUT', hint: 'Body must contain report object.' },
      400,
    );
  }

  if (!body || typeof body !== 'object') {
    return c.json(
      { ok: false, error: 'INVALID_INPUT', hint: 'Body must contain report object.' },
      400,
    );
  }

  const report = (body as Record<string, unknown>).report;

  if (!report || typeof report !== 'object') {
    return c.json(
      { ok: false, error: 'INVALID_INPUT', hint: 'Report payload required.' },
      400,
    );
  }

  const serialized = JSON.stringify(report);
  const hash = await sha256Hex(serialized);

  return c.json({
    ok: true,
    data: { hash, receivedAt: new Date().toISOString() },
    hint: 'Report acknowledged; storage stub.',
  });
});

app.notFound((c) => c.json({ ok: false, error: 'INVALID_INPUT', hint: 'Route not handled; check /v1 docs.' }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json(
    { ok: false, error: 'UPSTREAM_FAILURE', hint: 'Unhandled exception; inspect worker logs.' },
    500,
  );
});

export default app;
