# GoldShore Web

This repository contains the marketing site for [goldshore.org](https://goldshore.org). The project is built with
[Astro 4](https://astro.build) and [Tailwind CSS 3](https://tailwindcss.com), and deploys to Cloudflare Pages as a static
site.

## Prerequisites

- Node.js 18+
- npm 9+

## Local development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

The site is available at `http://localhost:4321`. Content lives in `src/pages` and shared structure lives in
`src/layouts`. Global styling is managed with Tailwind in `src/styles/global.css`.

## Production build

```bash
npm ci
npm run build
```

The compiled site is written to the `dist/` directory and is suitable for Cloudflare Pages deployments.

## Deployment notes

- Cloudflare Pages project name: `goldshore-web`
- Publish directory: `dist`
- Required environment variables:
  - `PUBLIC_API_URL = https://api.goldshore.org/v1`
  - `PUBLIC_SITE_URL = https://goldshore.org`
- The GitHub workflow should use `cloudflare/pages-action@v1` with
  `projectName: goldshore-web`, `directory: dist`, and the `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets.

## Security headers

Static response headers for Pages are defined in `public/_headers` to enforce CSP, HSTS, and other security policies.
