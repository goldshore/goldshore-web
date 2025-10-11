# GoldShore Web

This repository hosts the marketing site for GoldShore. The deployment
pipeline is ready, but DNS needs to be normalized before the Pages site and
Worker can go live. Hand the following brief to the deployment agent so it can
finish Phase 1 and unblock the initial release. Keep the following
ready-to-paste agent issue handy for the `goldshore-api` repository so the
automations can take over immediately:

```
**Repository:** goldshore-api
**Issue title:** DNS reset and domain verification (Phase 1 Deployment)

### Summary
Fix all DNS mis-points and verify that both the Pages and Worker environments
resolve before proceeding with app or pipeline work.

### Checklist for the agent
1. Export a backup of the existing Cloudflare DNS zone (Advanced → Export zone
   file) and keep it safe.
2. Replace non-email A/AAAA/CNAME records with the GoldShore baselines listed
   below.
3. Confirm DNS propagation (`nslookup goldshore.org` and `nslookup
   api.goldshore.org`) until Cloudflare IPs are returned and Cloudflare marks
   the records as active.
4. Attach the Pages and Worker domains/routes as described.
5. Verify Cloudflare SSL/TLS mode is **Full (strict)**.
6. Hit the Pages root and Worker health check once live.
7. Report back with a sanitized DNS table plus confirmation that Pages and the
   Worker domain verifications succeeded.

> Label this issue `phase1/dns` so follow-up automations can detect completion.

### TL;DR directive for the agent
“Start with DNS correction and domain verification for goldshore.org. Configure
CNAMEs for @, www, and api as described; attach the Pages and Worker routes;
confirm SSL = Full (strict). After successful verification, proceed to initial
deploy workflows.”
```

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
   confirmation that Pages and Worker domain verifications succeeded. Include
   the Cloudflare DNS table in the response.

When Phase 1 is complete, proceed to the initial deploy workflows:

1. Trigger `deploy-pages.yml` on branch `main` in `goldshore-web`.
2. Trigger `deploy-worker.yml` in `goldshore-api`.
3. Confirm that GitHub App webhooks receive `200` responses from
   `/webhook/github`.
