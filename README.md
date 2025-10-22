# Gold Shore Web & API Platform

This repository hosts the Gold Shore Labs public web experience (Astro + Tailwind deployed to Cloudflare Pages) and the
`goldshore-api` Cloudflare Worker that backs authenticated API requests. The infrastructure configuration is designed to
be idempotent: re-running the documented workflows should converge the Cloudflare account onto the desired state without
creating duplicates.

## Prerequisites

- Node.js 18+
- npm 9+
- Cloudflare account access with permissions for Pages, Workers, DNS, and Zero Trust
- Repository secrets:
  - `CF_API_TOKEN` with `Account.Workers`, `Account.Pages`, `Zone.DNS`, and `Account.Access:Edit` permissions
  - `CF_ACCOUNT_ID`
  - `CF_ZONE_ID`

## Local development

Install dependencies and start the Astro dev server:

```bash
npm install
npm run dev
```

The site is available at `http://localhost:4321`. Marketing content lives in `src/pages`, shared structure lives in
`src/layouts`, and Tailwind styles live in `src/styles`.

### Worker development

The Worker entry point lives at `src/index.ts` and uses [Hono](https://hono.dev) for routing. To run it locally with
Wrangler:

```bash
npx wrangler dev
```

Environment variables supplied by `wrangler.toml` configure CORS and Access validation. Authentication currently checks
for the `Cf-Access-Jwt-Assertion` header; token validation against the Access JWKS should be implemented before exposing
non-health routes.

## Production builds

```bash
npm ci
npm run build
```

The static site compiles into the `dist/` directory for Cloudflare Pages. Worker bundles are handled directly by Wrangler
when deploying via CI.

## Cloudflare deployment workflow

1. **Pages:** Deploy the `dist/` directory to the `goldshore-web` project from the `main` branch. Custom domains should
   include `goldshore.org`, `www.goldshore.org`, `web.goldshore.org`, `admin.goldshore.org`,
   `security.goldshore.org`, `settings.goldshore.org`, `themes.goldshore.org`, and
   `subscriptions.goldshore.org`, all pointing to the Pages project. Apply a Cloudflare Zero Trust Access policy that
   enforces the OIDC issuer at `https://goldshore.cloudflareaccess.com/...` and redirects unauthorised users to
   `/access-denied.html`. Reserve `dev.goldshore.org` as a DNS-only CNAME to the Pages project for preview builds.
2. **Worker:** Use `wrangler deploy` (or the provided GitHub Actions workflow) to publish the `goldshore-api` Worker. The
   primary route is `https://api.goldshore.org/*` with Workers.dev enabled for smoke testing.
3. **Zero Trust Access:** Maintain two applications—"Gold Shore Web (Prod)" and "Gold Shore API (Prod)"—each with an allow
   policy for `marstonr6@gmail.com` and the `goldshore.org` domain, followed by a default deny rule. Session duration is
   1 day for web and 12 hours for API. Set the organisation branding to Gold Shore colours and point the identity failure
   redirect to `https://goldshore-web.pages.dev/access-denied`.
4. **DNS:** Configure flattened CNAMEs so the apex, `www`, `web`, `admin`, `security`, `settings`, `themes`, and
   `subscriptions` hostnames resolve to `goldshore-web.pages.dev` (proxied), while `dev` remains a DNS-only CNAME for
   previews. Point `api` to `goldshore-api.gslabs.workers.dev`, proxied through Cloudflare.

## GitHub Actions

Two GitHub workflows are provided:

- `.github/workflows/pages-deploy.yml` builds the Astro site and deploys it to Cloudflare Pages.
- `.github/workflows/worker-deploy.yml` deploys the Worker using Wrangler, ensuring the configuration stays idempotent.

Both workflows rely on the `CF_API_TOKEN`, `CF_ACCOUNT_ID`, and `CF_ZONE_ID` secrets and can be safely re-run.

## Security headers & Access denied page

Static response headers for Pages live in `public/_headers`. The Access-denied fallback page is located at
`public/access-denied.html` and is referenced by the Zero Trust identity failure policy.

## Additional documentation

More operational background lives in [`docs/`](docs/). Update those documents alongside any substantial infra change to
keep the runbooks consistent.
