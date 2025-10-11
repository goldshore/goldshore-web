# GoldShore Web

This repository hosts the marketing site for GoldShore. The deployment
pipeline is ready, but DNS needs to be normalized before the Pages site and
Worker can go live. Hand the following brief to the deployment agent so it can
finish Phase 1 and unblock the initial release:

## Phase 1 – DNS reset and verification

1. **Export a backup of the current DNS zone** from Cloudflare for
   `goldshore.org` (DNS → Advanced → Export zone file).
2. **Replace existing A/AAAA/CNAME records** with the following CNAMEs (keep MX
   and TXT records for email):

   | Type  | Name | Target                    | Proxy   | Purpose                     |
   | ----- | ---- | ------------------------- | ------- | --------------------------- |
   | CNAME | `@`  | `goldshore-web.pages.dev` | Proxied | Root site                   |
   | CNAME | www  | `goldshore-web.pages.dev` | Proxied | Alias                       |
   | CNAME | api  | `workers.dev`             | Proxied | Worker endpoint placeholder |

3. **Verify propagation** via `nslookup` for `goldshore.org` and
   `api.goldshore.org`, ensuring Cloudflare IPs are returned and the DNS tab
   shows green checks.
4. **Attach domains**:
   - Pages project `goldshore-web`: add custom domains `goldshore.org` and
     `www.goldshore.org`.
   - Worker service `GoldShore`: add route `api.goldshore.org/*`.
5. **Confirm SSL/TLS** mode is set to **Full (strict)** in Cloudflare.
6. **Validate reachability** once deployments complete:
   - `https://goldshore.org` should serve the Pages splash.
   - `https://api.goldshore.org/health` should respond with `ok`.
7. **Report back** with a DNS summary (redacting sensitive MX/TXT entries) and
   confirmation that Pages and Worker domain verifications succeeded.

When Phase 1 is complete, proceed to the initial deploy workflows:

1. Trigger `deploy-pages.yml` on branch `main` in `goldshore-web`.
2. Trigger `deploy-worker.yml` in `goldshore-api`.
3. Confirm that GitHub App webhooks receive `200` responses from
   `/webhook/github`.
