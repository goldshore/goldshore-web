export interface Env {
  DB: D1Database;
  AGENT_PROMPT_KV: KVNamespace;
  JOBS_QUEUE: Queue;
  SNAP_R2: R2Bucket;
  CORS_ORIGINS: string;
}

const cors = (req: Request, origins: string) => {
  const o = new URL(req.url).origin;
  const allowed = origins.split(',').map((s) => s.trim()).filter(Boolean);
  const origin = allowed.includes(o) ? o : allowed[0] || '*';
  const hdr = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'content-type,authorization,cf-access-jwt-assertion'
  };
  return hdr;
};

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const headers = { 'content-type': 'application/json', ...cors(req, env.CORS_ORIGINS) };
    if (req.method === 'OPTIONS') return new Response(null, { headers });

    const url = new URL(req.url);
    if (url.pathname === '/v1/health') {
      return new Response(JSON.stringify({ ok: true, ts: Date.now() }), { headers });
    }

    if (url.pathname === '/v1/whoami') {
      const email = req.headers.get('cf-access-authenticated-user-email');
      const ok = !!email;
      return new Response(JSON.stringify(ok ? { ok, email } : { ok: false, error: 'UNAUTHENTICATED' }), {
        status: ok ? 200 : 401,
        headers
      });
    }

    if (url.pathname === '/v1/lead' && req.method === 'POST') {
      const ct = req.headers.get('content-type') || '';
      const body = ct.includes('application/json')
        ? await req.json()
        : Object.fromEntries((await req.formData()).entries());
      const email = (body.email || '').toString().trim();
      if (!email) {
        return new Response(JSON.stringify({ ok: false, error: 'EMAIL_REQUIRED' }), {
          status: 400,
          headers
        });
      }
      await env.DB.prepare(
        'CREATE TABLE IF NOT EXISTS leads (email TEXT PRIMARY KEY, ts TEXT DEFAULT CURRENT_TIMESTAMP)'
      ).run();
      await env.DB.prepare('INSERT OR IGNORE INTO leads (email) VALUES (?)').bind(email).run();
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (url.pathname.startsWith('/v1/orders') && req.method === 'GET') {
      await env.DB.prepare(
        'CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, symbol TEXT, qty REAL, side TEXT, ts TEXT DEFAULT CURRENT_TIMESTAMP)'
      ).run();
      const { results } = await env.DB.prepare(
        'SELECT * FROM orders ORDER BY ts DESC LIMIT 50'
      ).all();
      return new Response(JSON.stringify({ ok: true, data: results }), { headers });
    }

    return new Response(JSON.stringify({ ok: false, error: 'NOT_FOUND' }), {
      status: 404,
      headers
    });
  },

  async queue(batch: MessageBatch<any>) {
    for (const m of batch.messages) {
      m.ack();
    }
  }
};
