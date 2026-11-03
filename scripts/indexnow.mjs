import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const config = JSON.parse(await readFile(new URL('./indexnow-config.json', import.meta.url)));
const manifestPath = '/indexnow-manifest.json';
const statePath = '.indexnow-state/manifest.json';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export function validateManifest(manifest) {
  if (![1, 2].includes(manifest?.version) || typeof manifest.revision !== 'string' ||
      !manifest.pages || typeof manifest.pages !== 'object' || Array.isArray(manifest.pages)) {
    throw new Error('Invalid IndexNow manifest');
  }
  for (const [url, hash] of Object.entries(manifest.pages)) {
    const parsed = new URL(url);
    if (parsed.origin !== config.origin || parsed.search || parsed.hash ||
        parsed.username || parsed.password || !/^[a-f0-9]{64}$/.test(hash)) {
      throw new Error(`Invalid IndexNow page: ${url}`);
    }
  }
  if (manifest.version === 2) {
    // Keep raw hashes for a lossless, one-time upgrade from the legacy cache.
    validateManifest({ version: 1, revision: manifest.revision, pages: manifest.rawPages });
    if (JSON.stringify(Object.keys(manifest.pages).sort()) !==
        JSON.stringify(Object.keys(manifest.rawPages).sort())) {
      throw new Error('IndexNow raw and stable inventories differ');
    }
  }
  return manifest;
}

export function changedUrls(previous, current) {
  validateManifest(previous);
  validateManifest(current);
  if (previous.version !== current.version) {
    if (previous.version !== 1 || current.version !== 2) throw new Error('IndexNow manifest downgrade refused');
    // Never compare unlike hash algorithms or silently forget a pending edit.
    for (const url of Object.keys(previous.pages)) {
      if (url in current.pages && previous.pages[url] !== current.rawPages[url]) {
        throw new Error('Legacy IndexNow baseline differs from live HTML; reconcile before migration');
      }
    }
    return [...new Set([...Object.keys(previous.pages), ...Object.keys(current.pages)])]
      .filter(url => !(url in previous.pages) || !(url in current.pages)).sort();
  }
  return [...new Set([...Object.keys(previous.pages), ...Object.keys(current.pages)])]
    .filter(url => previous.pages[url] !== current.pages[url]).sort();
}

export function contentFingerprint(html) {
  // Ignore only Astro-generated build identifiers in tags. Keep body text,
  // metadata, JSON-LD, public links, images and inline scripts byte-sensitive.
  const stable = html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>|<!--[\s\S]*?-->|<[^>]+>/gi, token => {
    if (token.startsWith('<!--')) return token;
    const end = token.indexOf('>') + 1;
    let tag = token.slice(0, end);
    const island = /^<astro-island\b/i.test(tag);
    const assetTag = /^<(?:link|script|astro-island)\b/i.test(tag);
    // Consume whole attribute values so identifier-like prose inside a meta
    // description, island props or other quoted value is never normalized.
    tag = tag.replace(/(\s+)([^\s"'<>\/=]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g, (attr, space, name) => {
      if (/^data-astro-cid-[a-z0-9]{8}$/.test(name)) return attr.replace(name, 'data-astro-cid-stable');
      if (island && name === 'uid') return `${space}uid="stable"`;
      if (assetTag && /^(?:href|src|component-url|renderer-url)$/.test(name)) {
        return attr.replace(/(["']\/_astro\/[^"'?#]+)\.[A-Za-z0-9_-]{8}(\.(?:css|js)["'])$/, '$1.build$2');
      }
      return attr;
    });
    return tag + token.slice(end);
  });
  return createHash('sha256').update(stable).digest('hex');
}

export async function prepareBaseline({ fetchFn = fetch, previousPath = statePath } = {}) {
  let previous;
  try { previous = validateManifest(JSON.parse(await readFile(previousPath, 'utf8'))); }
  catch (error) { if (error.code === 'ENOENT') return; throw error; }
  if (previous.version === 2) return;
  // Run BEFORE deployment. Reconstruct the old fingerprint only from HTML
  // proven to match the exact cached legacy baseline, never from the new site.
  const signal = AbortSignal.timeout(180000);
  const get = async url => {
    const response = await fetchFn(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]), cache: 'no-store', redirect: 'error' });
    if (!response.ok) throw new Error(`IndexNow baseline fetch failed: HTTP ${response.status}`);
    return response;
  };
  const live = validateManifest(await (await get(`${config.origin}${manifestPath}`)).json());
  if (live.version !== 1 || live.revision !== previous.revision ||
      Object.keys(live.pages).length !== Object.keys(previous.pages).length ||
      Object.keys(previous.pages).some(url => live.pages[url] !== previous.pages[url])) {
    throw new Error('Legacy cache is not the live baseline; reconcile before migration');
  }
  const pages = {}, urls = Object.keys(previous.pages);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(4, urls.length) }, async () => {
    while (next < urls.length) {
      const url = urls[next++];
      const html = await (await get(url)).text();
      if (createHash('sha256').update(html).digest('hex') !== previous.pages[url]) {
        throw new Error('Legacy live HTML differs from cached hash; state not advanced');
      }
      pages[url] = contentFingerprint(html);
    }
  }));
  const upgraded = validateManifest({ version: 2, revision: previous.revision, pages, rawPages: previous.pages });
  await writeFile(previousPath, JSON.stringify(upgraded));
  console.log(`IndexNow baseline upgraded: ${urls.length} verified live pages, no submissions`);
}

export async function buildManifest(dist = 'dist/client', revision = process.env.INDEXNOW_REVISION || 'local') {
  const pages = {}, rawPages = {};
  const maps = (await readdir(dist)).filter(name => /^sitemap-\d+\.xml$/.test(name));
  if (!maps.length) throw new Error('No generated sitemaps found');
  for (const file of maps) {
    const xml = await readFile(join(dist, file), 'utf8');
    for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
      const parsed = new URL(match[1].replace(/&amp;/g, '&'));
      if (parsed.origin !== config.sitemapOrigin) throw new Error('Unexpected sitemap origin');
      // Submission URLs use the same canonical origin as the generated sitemap.
      const url = new URL(parsed.pathname, config.origin).href;
      const pathname = decodeURIComponent(parsed.pathname);
      const relative = pathname.replace(/^\//, '');
      const htmlPath = resolve(dist, relative.endsWith('.html') ? relative : join(relative, 'index.html'));
      if (!htmlPath.startsWith(resolve(dist) + '/')) throw new Error('Invalid sitemap path');
      const html = await readFile(htmlPath, 'utf8');
      pages[url] = contentFingerprint(html);
      rawPages[url] = createHash('sha256').update(html).digest('hex');
    }
  }
  if (!Object.keys(pages).length) throw new Error('Empty sitemap');
  const manifest = validateManifest({ version: 2, revision, pages, rawPages });
  await writeFile(join(dist, manifestPath.slice(1)), JSON.stringify(manifest));
  console.log(`IndexNow manifest: ${Object.keys(pages).length} pages`);
  return manifest;
}

export async function submit({ fetchFn = fetch, sleep = delay, revision = process.env.INDEXNOW_REVISION,
  previousPath = statePath } = {}) {
  if (!revision || revision === 'local') throw new Error('INDEXNOW_REVISION is required');
  let previous;
  try { previous = validateManifest(JSON.parse(await readFile(previousPath, 'utf8'))); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  let current;
  // CapRover can return before the new container is serving traffic.
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const response = await fetchFn(`${config.origin}${manifestPath}?revision=${encodeURIComponent(revision)}`, {
        signal: AbortSignal.timeout(15000), cache: 'no-store', redirect: 'error',
      });
      if (response.ok) {
        const candidate = validateManifest(await response.json());
        if (candidate.revision === revision) { current = candidate; break; }
      }
    } catch { /* Retry while rollout is in progress. */ }
    await sleep(10000);
  }
  if (!current) throw new Error('Expected deployment manifest did not become live');
  const keyLocation = `${config.origin}/${config.key}.txt`;
  const keyResponse = await fetchFn(keyLocation, { signal: AbortSignal.timeout(15000), redirect: 'error' });
  if (!keyResponse.ok || (await keyResponse.text()).trim() !== config.key) {
    throw new Error('Live IndexNow key verification failed');
  }
  // Cache loss is not evidence that every page changed. Establish a baseline;
  // do not turn a missing cache into a healthy-URL resubmission batch.
  const urls = previous ? changedUrls(previous, current) : [];
  if (!previous) console.log('IndexNow: no previous state; baseline only, no URLs submitted');
  for (let offset = 0; offset < urls.length; offset += 10000) {
    const urlList = urls.slice(offset, offset + 10000);
    const response = await fetchFn('https://api.indexnow.org/indexnow', {
      method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
      signal: AbortSignal.timeout(30000), redirect: 'error',
      body: JSON.stringify({ host: new URL(config.origin).host, key: config.key, keyLocation, urlList }),
    });
    if (![200, 202].includes(response.status)) throw new Error(`IndexNow returned HTTP ${response.status}; state not advanced`);
    console.log(`IndexNow: ${urlList.length} URLs, HTTP ${response.status}${response.status === 202 ? ' (key validation pending)' : ''}`);
  }
  await mkdir(resolve(previousPath, '..'), { recursive: true });
  await writeFile(previousPath, JSON.stringify(current));
  console.log(`IndexNow complete: ${urls.length} added/changed/deleted URLs`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv[2] === 'build') await buildManifest();
  else if (process.argv[2] === 'baseline') await prepareBaseline();
  else if (process.argv[2] === 'submit') await submit();
  else throw new Error('Usage: node scripts/indexnow.mjs build|baseline|submit');
}
