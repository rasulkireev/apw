# Public reading measurement

PostHog project 632904 (`https://us.posthog.com`) measures public hub and article visits through the same `PostHog.astro` component. Build variables are `PUBLIC_POSTHOG_KEY` (public ingestion key only) and `PUBLIC_POSTHOG_HOST`. Never put a management API key in a browser bundle. The project timezone is `Europe/Moscow`; record explicit UTC bounds when using UTC diagnostic queries, and keep GSC Pacific dates separate.

## Event contract

- `$pageview` and `$pageleave` only; `analytics_schema: public-reading-v1` marks the minimized payload.
- `$current_url` contains the HTTPS production origin and public pathname, without query parameters or fragments. `$pathname` and `$host` support page/host joins.
- `$referrer` contains only an HTTP(S) origin, or `$direct`; `$referring_domain` is its hostname. No external path, search term or campaign parameter is retained.
- Anonymous device/session/window IDs and a small allowlist of browser/device and timing properties support same-session reading sequences. No person identification, newsletter addresses/names, DOM text, link targets or nested person properties are sent.
- DOM autocapture, dead-click capture, replay, heatmaps, performance capture, surveys and flags are disabled. DNT or Global Privacy Control prevents SDK loading. Local/preview hosts and builds without a key do not load it.

## Interpretation and verification

Article coverage begins with this deployment: earlier hub-only PostHog totals are not an article baseline. Instrumentation changes can increase observed events without increasing traffic. GSC remains search truth; use final comparable windows and do not equate clicks with PostHog events or sessions.

Use production-host filters and the schema marker; exclude known bots and QA without assuming all remaining events are human. Derive onward reading from ordered page views in the same anonymous session. Referrer origin on an individual event is not proof of session-entry acquisition.

Newsletter API acceptance is **not** a confirmed subscription: duplicates and the honeypot deliberately receive the same response. No conversion event is emitted here. Confirmation still belongs to Listmonk and remains unmeasured in PostHog; do not report missing success events as zero subscriptions.

Tests exercise payload minimization and privacy-signal/host guards. For browser QA, intercept all PostHog and legacy analytics requests, inspect the captured request bodies locally, and never send test subscriptions or production analytics events. Check article and hub templates, metadata preservation and deployment revision. No field-CWV or acquisition improvement is implied by a successful build or lab test.
