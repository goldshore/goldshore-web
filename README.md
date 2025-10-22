# GoldShore Monorepo

This repository provides a single source of truth for the entire GoldShore platform. It houses the public marketing site,
admin dashboard, Cloudflare Worker API, shared design tokens, and generated brand assets so that Pages, Workers, and
Zero Trust can be deployed from one place with deterministic configuration.

## Repository layout

```
apps/
  web/    # Customer facing site (Astro on Cloudflare Pages)
  admin/  # Access protected admin interface (Astro on Cloudflare Pages)
  api/    # Cloudflare Worker (modules) that powers the trading API
packages/
  theme/  # Shared CSS token package consumed by both Astro apps
  assets/ # SVG source + generated icon set for the GoldShore brand
scripts/
  build-icons.mjs # Generates the favicon + manifest set from the SVG logo
```

## Getting started

Install workspace dependencies (Node 18+ recommended):

```bash
npm install
```

Generate the favicon and manifest bundle referenced by both Pages projects:

```bash
npm run build:icons
```

### Web + Admin (Cloudflare Pages)

Both Astro apps share the same configuration:

```bash
npm --workspace apps/web run dev     # http://localhost:4321
npm --workspace apps/admin run dev   # http://localhost:4322
npm --workspace apps/web run build   # emits .astro server output for Pages
npm --workspace apps/admin run build
```

Each project sets `output: "server"` with the Cloudflare adapter so Pages runs the SSR bundle. Static response headers
for caching and CSP live under `apps/*/public/_headers`.

### API (Cloudflare Workers)

The Worker uses Wrangler with module format output:

```bash
npm --workspace apps/api run dev        # wrangler dev
npm --workspace apps/api run build      # dry-run deploy (compiles TypeScript)
npm --workspace apps/api run deploy     # publish to Cloudflare
```

`apps/api/wrangler.toml` declares bindings for D1, KV, R2, Queues, and Durable Objects plus the production route at
`https://api.goldshore.org/*`. The TypeScript handler includes `/v1/health`, `/v1/whoami`, `/v1/lead`, and `/v1/orders`
endpoints that exercise D1 reads/writes and Access headers.

## Cloudflare configuration highlights

- **DNS**: Apex, `www`, and `admin` hostnames CNAME to the corresponding Pages projects; `api` routes to the Worker.
  The verification TXT record remains DNS-only.
- **Pages**: Deploy `apps/web` and `apps/admin` as separate projects with custom domains `goldshore.org` and
  `admin.goldshore.org`. Both rely on the shared `@goldshore/theme` CSS tokens and SVG brand assets in
  `packages/assets/goldshore/`.
- **Workers**: The API worker (`goldshore-api`) is deployed from `apps/api` and bound to the resources referenced in
  `wrangler.toml`.
- **Zero Trust Access**: Protect `https://admin.goldshore.org/*` and `https://api.goldshore.org/*` with a GitHub IdP
  allow-listing `*@goldshore.org` addresses. API responses expose `/v1/whoami` to verify Access headers.

## Additional notes

- Run `npm run build --workspaces` to compile all deployable targets in one command.
- `packages/theme` can be published to npm if desired; Astro apps currently link to it through the workspace file
  dependency.
- The icon build script outputs PNG/ICO assets into `packages/assets/goldshore/dist/`, which is gitignored to avoid
  committing binary artifacts. Run `node scripts/build-icons.mjs` locally when you need raster favicons.

Feel free to expand the `docs/` directory with operational runbooks as the platform grows.
