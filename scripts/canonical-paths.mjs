import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Preserve the canonical already declared by each rendered page. Only remove a
// trailing slash when that is the sole difference; external canonicals and hubs
// are deliberately not rewritten. Run after Astro and before IndexNow.
export async function buildCanonicalPaths(dist = 'dist', output = 'generated/canonical-locations.conf') {
  const origin = 'https://www.rasulkireev.com';
  const maps = (await readdir(dist)).filter(name => /^sitemap-\d+\.xml$/.test(name));
  if (!maps.length) throw new Error('No generated sitemaps found');
  const locations = [];
  const changes = [];
  const seen = new Set();
  for (const name of maps.sort()) {
    let xml = await readFile(join(dist, name), 'utf8');
    for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
      const page = new URL(match[1].replace(/&amp;/g, '&'));
      if (page.origin !== origin || page.search || page.hash) throw new Error('Unexpected sitemap URL');
      const path = decodeURIComponent(page.pathname);
      const file = resolve(dist, '.' + path, 'index.html');
      if (!file.startsWith(resolve(dist) + '/')) throw new Error('Invalid page path');
      const html = await readFile(file, 'utf8');
      const canonical = html.match(/<link\b[^>]*\brel="canonical"[^>]*\bhref="([^"]+)"[^>]*>/i)?.[1];
      if (!canonical) throw new Error(`Missing canonical: ${page.pathname}`);
      const owner = new URL(canonical);
      if (owner.origin !== origin || (owner.href === page.href && page.pathname.endsWith('/'))) continue;
      if (owner.search || owner.hash || owner.username || owner.password ||
          (page.pathname !== owner.pathname + '/' && page.pathname !== owner.pathname)) {
        throw new Error(`Unsupported canonical mapping: ${page.pathname}`);
      }
      // Explicitly constrain generated nginx syntax. Never interpolate arbitrary
      // frontmatter into directives; unsupported names fail the build for review.
      if (!/^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(owner.pathname)) {
        throw new Error(`Unsafe nginx path: ${owner.pathname}`);
      }
      if (seen.has(owner.pathname)) throw new Error('Duplicate canonical route');
      seen.add(owner.pathname);
      locations.push(`location = ${owner.pathname} { try_files ${owner.pathname}/index.html =404; }`);
      locations.push(`location = ${owner.pathname}/ { return 301 ${owner.pathname}$is_args$args; }`);
      if (owner.href !== page.href) changes.push({ from: page.href, to: owner.href });
      xml = xml.replace(match[0], `<loc>${owner.href}</loc>`);
    }
    await writeFile(join(dist, name), xml);
  }
  await mkdir(resolve(output, '..'), { recursive: true });
  await writeFile(output, '# Generated from rendered canonical links; do not edit.\n' + locations.join('\n') + '\n');
  console.log(`Canonical paths: ${seen.size} existing slashless owners`);
  return changes;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await buildCanonicalPaths();
}
