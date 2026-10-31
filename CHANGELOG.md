## 2026-10-31 — Writing book-note discovery

- Connect the existing Economical Writing, Doing Content Right, and The Art and Business of Online Writing reviews with reciprocal related-reading navigation. Reuse their titles and authors; preserve review prose, search previews, ratings and original dates, updating only modification dates. No new editorial posts.

## 2026-10-30 — Historical Pocket workflows

- Clearly label the two existing 2020 Pocket workflows and their search/social previews as historical following Pocket's shutdown, with Mozilla's dated source. Tell readers not to follow the retired email-forwarding workflow; retain the original accounts, titles, URLs and publication dates. Update modification dates and add scoped truth checks. No new editorial posts.

## 2026-10-29 — Connected book-note discovery

- Add reciprocal related-reading navigation between the existing Dhandho Investor and Never Enough reviews, connected by the author's original Andrew Wilkinson reading reference. Reuse existing titles and authors; preserve review prose, descriptions, ratings and original dates, updating only modification dates. No new editorial posts.

## 2026-10-28 — Dhandho Investor search preview

- Clarify the existing Dhandho Investor review preview with its author, summary and chapter highlights; preserve the review text, title, rating and read/creation dates, and refresh the modification date.

## 2026-10-27 — Happy Sleeper search preview

- Clarify The Happy Sleeper search preview as a personal book review with Sleep Wave notes and family experience; preserve the article, title, rating and original dates.

## 2026-10-26 — Bootstrapping book-note discovery

- Add reciprocal onward-reading links between the existing Getting Real, Start Small, Stay Small and The Minimalist Entrepreneur book notes. Reuse the related-reading navigation and existing titles/authors; preserve review prose and metadata apart from modification dates. No new editorial posts.

## 2026-10-25 — Public book-note references

- Keep imported private reading-app references as plain text instead of publishing unusable links, through a shared Markdown rendering guard.
- Point three chapter references to their existing public headings in Start Small, Stay Small. Preserve all labels, formatting, author text and ordinary public links.
- Update modification dates on the three affected existing book-note pages; add regression coverage. No new editorial posts.

## 2026-10-24 — Code Book public reading links

- Remove two unavailable private reading-app links while retaining their reference text; point the Chapter 6 link to the existing on-page chapter.
- Preserve all review prose, metadata, ratings and original dates; update the modification date and add a scoped regression check. No new editorial posts.

## 2026-10-23 — Lessons of History description

- Describe the existing review and notes, name both authors, and identify topics already covered in the notes.
- Preserve the title, article text, rating and original dates; update the modification date. No new editorial posts.

## 2026-10-22 — Productivity book-note discovery

- Connect the existing *Four Thousand Weeks* and *Building a Second Brain* notes with server-rendered related-reading links, using their existing category, titles and authors.
- Preserve the review text, ratings, titles, descriptions and existing parenting navigation. Update the two modification dates. No new editorial posts.

## 2026-10-21 — Windows virtual-environment instructions

- Clarify Command Prompt versus PowerShell activation in the existing Django environment tutorial, use batch-compatible comments, and correct the Windows directory-listing instruction.
- Link Python's shell guidance; preserve the remaining walkthrough, title, description and author experience. Update the modification date. No new editorial posts.

## 2026-10-20 — Python environment discovery

- Link the existing Poetry guide's virtual-environment reference to the existing setup tutorial, and add a notebook continuation link from setup to the existing Jupyter guide.
- Preserve tutorial code, titles, descriptions and author experience; update the two edited tutorials' modification dates. No new editorial posts.

## 2026-10-19 — Responsive reading layout

- Keep the table of contents inline below 1536px; place the wide-screen sidebar beside the article, opposite sharing controls, rather than over the text.
- Wrap long inline code and narrow-screen share controls without changing code-block whitespace, post content, metadata, dates, or URLs. Expose TOC disclosure state to assistive technology. No new editorial posts.

## 2026-10-18 — Poetry setup instructions

- Replace the retired Poetry installer in the existing Django and ERC20 tutorials with the official installer and platform/PATH guidance.
- Clarify Poetry 2.x shell/export plugin prerequisites and label the Django guide's historical setup output. Preserve the author's walkthroughs and metadata; update modification dates. No new editorial posts.

## 2026-10-17 — Jupyter environment setup

- Correct the existing Jupyter tutorial's Windows activation command and label it for Command Prompt.
- Link its virtual-environment reference to the existing setup tutorial; preserve the author's experience and update the modification date. No new editorial posts.

## 2026-10-16 — Tutorial browsing

- Restore tutorial tag filters on shared links, reload and browser Back/Forward; ignore unknown tags without hiding the entire list.
- Expose active filter and disclosure states to assistive technology and add a page heading. Keep every existing tutorial and its metadata unchanged; no new editorial posts.

## 2026-10-15 — Growth Levers review description

- Clarify the existing review description with its author, topics and first-person Readwise perspective; preserve the title and article body.
- Update the modification date. No new editorial posts.

## 2026-10-11 — Adler book-note description

## 2026-10-13

- Restore book-review category, tag and sort controls from shared URLs and browser Back/Forward; keep existing reviews unchanged. Label browsing controls and let them wrap on narrow screens.

- Describe the existing review and reading-method notes in the *How to Read a Book* search/social description instead of a generic recommendation.
- Preserve the title, article text, links, canonical URL and original publication date; update the modification date.
- No new editorial posts.

## 2026-10-10 — Reading-plan discovery

- Link the existing mentions of *How to Read a Book* in both Great Books reading plans directly to the published book notes.
- Preserve the original prose, reading lists, publication dates, titles and canonical URLs; update the two pages’ modification dates.
- No new editorial posts.

## 2026-10-09 — Public reading analytics

- Include PostHog on existing articles and book notes so search landings and onward reading can be measured alongside hub visits.
- Limit collection to anonymous page views/leaves with sanitized URLs and referrer origins; disable DOM/form capture, replay and campaign-parameter collection, and respect browser privacy signals.
- Correct the offline link checker’s static-file expectation for the server-only newsletter endpoint; retain its Docker runtime checks.
- Keep newsletter acceptance separate from confirmed subscriptions; no new editorial content or subscriber tests.

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
