# Brand Asset Migration

## Before → After Reference

| Old location | New location |
| --- | --- |
| `styles.css` | `public/styles/site.css` |
| _(new)_ | `public/logo.svg`, `public/icon-128.svg` |
| _(new)_ | `public/logo-cutout.svg`, `public/logo-animated.svg` |
| _(new)_ | `public/favicon.svg`, `public/apple-touch-icon.svg` |
| _(new)_ | `public/icons/icon-192.svg`, `public/icons/icon-512.svg` |
| _(new)_ | `public/brand/brand-tokens.css` |
| _(new)_ | `public/site.webmanifest` |

## Manual Test Checklist

- [x] CSP headers emit expected directives
- [x] Logo and hero imagery load locally
- [x] Favicon and app icons resolve
- [ ] Lighthouse performance audit

## Optimizations

- Generated reusable color tokens in `public/brand/brand-tokens.css`
- Exported the favicon artwork as scalable SVG variants for touch and web app icons
