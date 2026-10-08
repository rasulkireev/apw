## 2026-10-08

## 2026-10-08 — Newsletter cutover verification

- Record live signup/delivery/unsubscribe and offsite recovery verification; document the revoked legacy Windmill token and safe rollback limitations.


## 2026-10-08 — Native newsletter signup

- Route all existing signup forms through an Astro server endpoint to dedicated Listmonk with double opt-in; remove browser-side Windmill credentials and IP lookup.
- Add validation, same-origin checks, a honeypot, request/rate limits, accessible confirmation feedback and no-JavaScript form support.
- Preserve static Nginx routing and the existing Buttondown newsletter archive; document runtime, backups and rollback.

### Added
- Link the three existing parenting book reviews to one another through a server-rendered related-reading section. Reuse existing titles and authors; preserve review text, dates and URLs.

## 2026-10-07
### Fixed
- Reserve book-cover space using each image's intrinsic dimensions, preventing loading images from shifting book-review titles and text. Preserve existing artwork, display size and content.

## 2026-10-05

## 2026-10-06

- Serve social, share and discussion icons as a small local SVG sprite instead of render-blocking third-party icon CSS and fonts. Preserve link destinations and artwork, and name icon-only links for screen readers.
### Fixed
- Link shared navigation, footer and tag browsing directly to their existing canonical routes, avoiding unnecessary redirects. Encode tag names in URLs without changing labels, article text or canonical values.

## 2026-10-04
### Fixed
- Point RSS and machine-readable source links directly to existing local pages. Preserve RSS item IDs and publication dates, retain external canonical overrides, and stop advertising nonexistent archive URLs without removing their text.

## 2026-10-03
### Fixed
- Serve existing slashless article canonical URLs directly, redirect their trailing-slash aliases, and use those same canonical paths in sitemaps and IndexNow. Article text, declared canonicals, hub URLs and external canonical overrides are unchanged.

## 2026-10-01
### Fixed
- Aligned production routing and IndexNow with the existing HTTPS www canonical host. Noncanonical host/protocol requests now redirect permanently without HTTP detours; article text and canonical paths are unchanged.

## 2026-09-30
### Fixed
- Kept nginx directory redirects on the visitor's HTTPS scheme behind the reverse proxy, eliminating HTTP detours for slashless page links. Existing host and canonical conventions are unchanged.

## 2026-09-29
### Fixed
- Made the legacy sitemap reuse Astro's generated route inventory, removing nonexistent URLs and including the changelog without maintaining a second page list.

## 2026-09-28
### Added
- IndexNow verification and automatic post-deployment submission of added, changed, and deleted sitemap URLs, with rollout checks and retryable submission state.

## 2026-09-28
### Changed
- Corrected SEO tool access and page priorities, enabled bounded DataForSEO research, and documented the standing Greptile review exception. No editorial content changes.

## 2026-09-28
### Added
- Added SEO operating configuration, private research-store references, and a sanitized technical improvement plan. Autonomous maintenance is limited to engineering and existing-content improvements; no new AI-authored editorial content.

## 2026-09-28
### Added
- PostHog visitor analytics on production pages, alongside existing Plausible tracking.
- Build-time analytics configuration through GitHub repository variables.

## 2026-06-19
### Added
- Added a short personal article about useful life-admin automations, featuring OpenBudget as a personal finance example.

## 2026-01-10
### Added
- Free book: Best Practices for Data Visualisation

## 2026-01-10
### Added
- Book notes:
  - Cold Email Manifesto by Alex Berman
  - Unfuck Your Sales by Jakob Greenfeld

## 2026-01-06
### Added
- Book notes: A Skill Called Luck by Jakob Greenfeld

## 2026-01-03
### Added
- Free book: Readings in Database Systems, 5th Edition

## 2025-12-26
### Added
- Free book: Exploring Mathematics with Python

## 2025-12-15
### Added
- New project idea
- Added changelog page

## 2025-08-10
### Added
- Added a book review for "Start Small, Stay Small" by Rob Walling
- Highlights are now not shown on page load to improve SEO.
- Added a book review for "Growth Levers"
