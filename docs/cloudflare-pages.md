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

Configure Cloudflare DNS so the production Pages deployment is reachable from the public domains and the developer
preview URL. All hostnames should be proxied unless otherwise noted.

| Hostname | Record | Target | Purpose |
| --- | --- | --- | --- |
| `goldshore.org` | CNAME (flattened) | `goldshore-web.pages.dev` | Primary marketing site |
| `www.goldshore.org` | CNAME | `goldshore-web.pages.dev` | Legacy/SEO alias |
| `web.goldshore.org` | CNAME | `goldshore-web.pages.dev` | Auth-gated dashboard entry |
| `admin.goldshore.org` | CNAME | `goldshore-web.pages.dev` | Direct link to `/admin` experience |
| `security.goldshore.org` | CNAME | `goldshore-web.pages.dev` | Deep link to `/security` controls |
| `settings.goldshore.org` | CNAME | `goldshore-web.pages.dev` | Deep link to `/settings` management |
| `themes.goldshore.org` | CNAME | `goldshore-web.pages.dev` | Theme management tooling |
| `subscriptions.goldshore.org` | CNAME | `goldshore-web.pages.dev` | Client billing portal |
| `dev.goldshore.org` | CNAME (DNS only) | `goldshore-web.pages.dev` | Preview/QA environment (leave unproxied) |

- Avoid circular CNAMEs (for example, do not make `www` and `@` point to each other).
- When adding additional vanity hostnames, point them at the same Pages project so previews remain consistent.

## Zero Trust Access

Keep the default Pages domain (`*.goldshore-web.pages.dev`) public so preview deployments remain accessible.
If path-level protections are required, create a Cloudflare Access application targeting the protected hostnames with the
following include paths:

- `/admin/*`
- `/security/*`
- `/settings/*`
- `/themes/*`
- `/subscriptions/*`

Access can scope additional hostnames (for example `admin.goldshore.org`) to the same policy when the hostname proxies to
the Pages deployment.

## Deployment automation

The GitHub workflow should use `cloudflare/pages-action@v1` with the `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`
secrets. Run the following steps during CI:

```bash
npm ci
npm run build
```

## Post-deploy verification

1. Open https://goldshore-web.pages.dev and verify the site loads without an Access prompt.
2. Open https://goldshore.org and confirm it renders the production experience. Repeat the spot check for
   https://admin.goldshore.org, https://security.goldshore.org, https://settings.goldshore.org,
   https://themes.goldshore.org, and https://subscriptions.goldshore.org to ensure they resolve and respect the intended
   Access policies.
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
| Deployment URLs | `https://goldshore.org`, `https://goldshore-web.pages.dev`, `https://admin.goldshore.org` |
| DNS state | `goldshore.org → goldshore-web.pages.dev (proxied)`, `admin.goldshore.org → goldshore-web.pages.dev (proxied)`, `dev.goldshore.org → goldshore-web.pages.dev (DNS only)` |
| Access policy | `web.goldshore.org`, `admin.goldshore.org`, `security.goldshore.org`, `settings.goldshore.org`, `themes.goldshore.org`, `subscriptions.goldshore.org` protected as noted |
| API checks | `/health → 200 OK (CORS: https://goldshore.org)`, `/v1 → 401 Unauthorized before Access login, 200 after` |

Store the completed summary alongside the release notes in your change management system.
