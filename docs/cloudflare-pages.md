# Cloudflare Pages deployment checklist

This project deploys to Cloudflare Pages as `goldshore-web`. Use the following configuration to ensure parity between
preview and production environments.

## Build configuration

| Setting | Value |
| --- | --- |
| Project name | `goldshore-web` |
| Build command | `npm run build` |
| Output directory | `dist` |

Set the environment variables in both preview and production environments:

- `PUBLIC_API_URL = https://api.goldshore.org/v1`
- `PUBLIC_SITE_URL = https://goldshore.org`

The build relies on [`astro build`](https://docs.astro.build/en/reference/cli-reference/#astro-build) and writes the
static site into the `dist/` directory. No Pages Functions or `wrangler.toml` files are required.

## DNS requirements

- `goldshore.org` must be a proxied CNAME pointing to `goldshore-web.pages.dev`.
- `web.goldshore.org` must also be a proxied CNAME pointing to `goldshore-web.pages.dev`.
- Avoid circular CNAMEs (for example, do not make `www` and `@` point to each other).

## Zero Trust Access

Keep the default Pages domain (`*.goldshore-web.pages.dev`) public so preview deployments remain accessible.
If path-level protections are required, create a Cloudflare Access application targeting `web.goldshore.org` with the
path `/admin/*`.

## Deployment automation

The GitHub workflow should use `cloudflare/pages-action@v1` with the `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`
secrets. Run the following steps during CI:

```bash
npm ci
npm run build
```

## Post-deploy verification

1. Open https://goldshore-web.pages.dev and verify the site loads without an Access prompt.
2. Open https://goldshore.org and confirm it renders the production experience.
3. From the site, trigger the API health check widget to call `${PUBLIC_API_URL}/health`. The request should return
   `200 OK` with permissive CORS headers for the marketing origin.
4. Attempt to call a protected `${PUBLIC_API_URL}/v1` endpoint from the browser. Expect `401 Unauthorized` until you
   authenticate via Cloudflare Access, after which the endpoint should respond with `200`.
5. Record the HTTP status codes, CORS headers, active deployment URL, DNS state, and Access policy details in the
   release notes.

## Deployment summary template

Capture the following details for every production publish. This log satisfies audit requirements and mirrors the
Zero Trust expectations for the `/admin/*` path.

| Field | Example |
| --- | --- |
| Deployment ID | `4f6c2a5e-6f66-4c61-bdf4-10f2012b52c9` |
| Deployment URLs | `https://goldshore.org`, `https://goldshore-web.pages.dev` |
| DNS state | `goldshore.org → goldshore-web.pages.dev (proxied)`, `web.goldshore.org → goldshore-web.pages.dev (proxied)` |
| Access policy | `web.goldshore.org` protected at `/admin/*` only |
| API checks | `/health → 200 OK (CORS: https://goldshore.org)`, `/v1 → 401 Unauthorized before Access login, 200 after` |

Store the completed summary alongside the release notes in your change management system.
