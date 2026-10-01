# Canonical host routing

Production's canonical host is `https://www.rasulkireev.com`. This preserves the existing Astro site origin, declared canonicals, and Google-selected host; it is not a migration to the apex. Article canonical paths and editorial content are unchanged.

## CapRover settings

For app `apw` only, at the configured production CapRover instance:

- Keep both custom domains and their existing certificates enabled.
- Keep `forceSsl: true`.
- Set `redirectDomain: www.rasulkireev.com`.
- Set `customNginxConfig` to `nginx/caprover-server.conf.ejs`.

The template is the instance's default server template captured on 2026-10-01 with only its two redirect destinations/statuses changed. HTTP requests and noncanonical HTTPS hosts redirect directly to HTTPS www with **301**, preserving `$request_uri`. ACME, CapRover health checks, TLS, proxy headers, and upstream configuration remain intact. A default CapRover host redirect can otherwise emit a temporary HTTP destination even with forced TLS enabled.

## Coordinated rollout

1. Pass repository CI and review the complete diff. Back up the app definition privately, never in Git/logs. Check that domains, TLS and the preexisting template have not drifted. Do not change another app.
2. Merge the PR and apply the two routing settings together through the authenticated CapRover API. Preserve every other setting. Do this before the deployment's IndexNow step; rollout polling allows the new image to become available.
3. Verify www returns 200 without a host redirect, and HTTP/apex forms return a direct 301 to HTTPS www. Check an article, a percent-encoded tag, a query string, a missing path, sitemap aliases and the verification key.
4. Wait for successful deployment and the new manifest revision; its entries must use www. The `indexnow-v2-www-` cache intentionally starts fresh because previous apex-only manifests fail the new origin validation. The first submission includes the existing sitemap inventory; a receipt is not proof of indexing.
5. Crawl the complete sitemap and compare metadata, status and inventory. Continue monitoring Google canonical selection; path-normalization discrepancies are a separate task.

## Recovery

If routing checks fail, restore only `redirectDomain` and `customNginxConfig` from the private pre-change snapshot immediately, preserving any unrelated changes. If the application/IndexNow revision also needs reverting, use a separate revert PR; do not rewrite history. The previous origin was apex and used the `indexnow-v1-` state namespace. Do not submit a mixed-host manifest.

On CapRover upgrades, compare this template against the new default before carrying it forward. Do not blindly replace certificates, ACME locations or proxy directives.
