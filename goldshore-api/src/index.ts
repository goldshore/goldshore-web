type Env = {
  CORS_ALLOWED_ORIGINS: string
}

const ALLOWED_METHODS = "GET,POST,OPTIONS"
const ALLOWED_HEADERS = "Authorization,Content-Type"

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Vary": "Origin",
  "Access-Control-Allow-Methods": ALLOWED_METHODS,
  "Access-Control-Allow-Headers": ALLOWED_HEADERS,
  "Access-Control-Max-Age": "86400"
})

const pickOrigin = (env: Env, req: Request) => {
  const origin = req.headers.get("Origin") || ""
  const allow = (env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
  return allow.includes(origin) ? origin : ""
}

const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers ?? {})
  headers.set("Content-Type", "application/json; charset=utf-8")

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
    status: init.status ?? 200
  })
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)
    const origin = pickOrigin(env, req)
    const isPreflight = req.method === "OPTIONS"

    // Handle CORS preflight universally
    if (isPreflight) {
      // If the Origin is not allowed, reply but without ACAO so browsers block it
      const headers: Record<string, string> = origin ? corsHeaders(origin) : {
        "Access-Control-Allow-Methods": ALLOWED_METHODS,
        "Access-Control-Allow-Headers": ALLOWED_HEADERS,
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin"
      }
      return new Response(null, { status: 204, headers })
    }

    // Routes
    if (url.pathname === "/health") {
      const res = json({ ok: true, service: "goldshore-api", time: new Date().toISOString() })
      return origin ? new Response(res.body, { status: 200, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }) : res
    }

    if (url.pathname === "/trade" && req.method === "POST") {
      // … your auth + trade logic here …
      const res = json({ ok: true, received: true })
      return origin ? new Response(res.body, { status: 200, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }) : res
    }

    return new Response("Not Found", { status: 404 })
  }
}
