# Existing canonical paths

The site deliberately retains its established URL identities: article canonical
links commonly omit the trailing slash, while hubs and tag archives use one.
Do not apply a site-wide trailing-slash migration to fix the difference.

`pnpm run build` runs `scripts/canonical-paths.mjs` after Astro generates HTML
and sitemaps, then builds the IndexNow manifest from the adjusted sitemap.
The script reads the rendered canonical link for each sitemap page. When the
only difference is an article's trailing slash, it:

- changes the sitemap entry to the existing declared owner;
- generates an exact nginx location serving the owner's existing `index.html`;
- generates a permanent relative redirect from the slashful alias, preserving
  query parameters and the visitor's HTTPS host.

It does not edit HTML, editorial content, content dates or canonical values.
External canonical overrides are retained, not treated as local redirects.
Unexpected same-host canonical relationships and unsupported nginx path syntax
fail the build rather than guessing a migration. Generated config stays outside
the public document root and is copied into the production image.

The default server includes these exact locations before normal static serving.
Hubs, encoded tag archives, assets and real missing-route 404s keep their existing
behavior. The reverse proxy's host/HTTPS policy remains separate; requests that
change both host and path can still have two redirects.

## Verification and rollback

Run `node --test tests/*.test.mjs` and `pnpm run build`. Docker CI additionally
tests every generated slashless owner and its query-bearing aliases against the
actual production nginx image. Verify the deployed revision through the IndexNow
manifest, then crawl the complete sitemap and recheck alias/error routes.
An IndexNow receipt is not an indexing result; Google may take time to recrawl.

Rollback is a revert PR and deployment of the preceding image/config together.
No CapRover settings change is needed for this repair. Internal links and feeds
that still use slashful article aliases remain reachable; any later cleanup
should point to the declared owner without rewriting article text.
