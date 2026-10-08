# Newsletter

All shared website signup forms POST to `/api/newsletter`, an on-demand Astro endpoint using the Node adapter. Everything else remains prerendered and served by Nginx, including the generated canonical redirects, sitemap and IndexNow manifest. Server builds place static output in `dist/client` and the standalone entrypoint in `dist/server`.

## Production

- Dedicated Listmonk: https://listmonk.rasulkireev.com/admin/ (6.2.0, pinned upstream digest).
- CapRover apps: `apw-listmonk`, `apw-listmonk-db` (PostgreSQL 17). Persistent database and uploads, isolated newsletter database overlay; Listmonk also joins the proxy overlay with DNSRR.
- Sender: `Rasul Kireev <rasul@rasulkireev.com>` using Mailgun `mg.rasulkireev.com`, independent newsletter SMTP credentials. Open/click tracking disabled.
- Public double-opt-in list: Tuesday Letter. `app.send_optin_confirmation` must stay enabled. Listmonk owns confirmation, preferences and unsubscribe.
- Runtime `apw` env: `LISTMONK_URL=http://apw-listmonk:9000`, `LISTMONK_LIST_UUID=<Tuesday Letter UUID>`. No admin or SMTP credentials in the website.
- Admin, SMTP and database credentials: Infisical Openclaw / prod / `/projects/apw`. Bootstrap admin env is removed after initialization.
- Existing https://newsletter.rasulkireev.com/ Buttondown archive, subscribers and old Windmill automation are not migrated or deleted. The new website no longer calls Windmill or ipify.

## Abuse protection and privacy

Same-origin POST only, 4 KiB body limit, validated email/name, hidden honeypot, 8-second upstream deadline, generic duplicate response, and no subscriber values in responses or application logs. Source tags are optional attributes; arbitrary URLs and IPs are not forwarded to Listmonk. Production Nginx allows one request/minute/IP with an initial burst of five; it trusts forwarded client addresses only from the CapRover overlay (`10.0.1.0/24`). App ports are not publicly published. Direct public Listmonk subscription routes are blocked; confirmation/preferences remain reachable. Rate limits are local to the single web replica and reset on restart; revisit shared limits before scaling.

The Node process listens on localhost:4321; Nginx exposes port 80 and proxies only the exact signup route. Tini and the launch script stop the container when either process exits. Errors remain retryable and never claim the subscriber was confirmed merely because a job was queued.

## Verification and recovery

`node --test tests/*.test.mjs` tests the handler without sending mail. CI also builds the actual production image and tests static routing, native signup errors, body handling and rate limiting. Verify live signup → confirmation email → confirmation → unsubscribe using an operator-owned address; check SPF/DKIM/DMARC and the final Listmonk subscription state. Do not send campaigns as a smoke test.

Database dumps and persistent volumes are included in host backup discovery; test a consistent `pg_dump -Fc` restore and offsite restore. Inventory/upgrade notes live in the control-plane service inventory. No automatic campaign or updater is enabled.

Rollback: redeploy the previous website image and restore its saved app definition if required (that restores the old Windmill signup). Leave the new Listmonk database intact; never downgrade it after a schema migration without restoring a compatible backup. Preserve the separate Buttondown archive DNS.
