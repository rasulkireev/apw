import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const config = JSON.parse(await readFile(new URL('./indexnow-config.json', import.meta.url)));
const manifestPath = '/indexnow-manifest.json';
const statePath = '.indexnow-state/manifest.json';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export function validateManifest(manifest) {
  if (manifest?.version !== 1 || typeof manifest.revision !== 'string' ||
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
  return manifest;
}

export function changedUrls(previous, current) {
  validateManifest(previous);
  validateManifest(current);
  return [...new Set([...Object.keys(previous.pages), ...Object.keys(current.pages)])]
    .filter(url => previous.pages[url] !== current.pages[url]).sort();
}

export async function buildManifest(dist = 'dist/client', revision = process.env.INDEXNOW_REVISION || 'local') {
  const pages = {};
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
      pages[url] = createHash('sha256').update(await readFile(htmlPath)).digest('hex');
    }
  }
  if (!Object.keys(pages).length) throw new Error('Empty sitemap');
  const manifest = validateManifest({ version: 1, revision, pages });
  await writeFile(join(dist, manifestPath.slice(1)), JSON.stringify(manifest));
  console.log(`IndexNow manifest: ${Object.keys(pages).length} pages`);
  return manifest;
}

export async function submit({ fetchFn = fetch, sleep = delay, revision = process.env.INDEXNOW_REVISION,
  previousPath = statePath } = {}) {
  if (!revision || revision === 'local') throw new Error('INDEXNOW_REVISION is required');
  let previous = { version: 1, revision: '', pages: {} };
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
  const urls = changedUrls(previous, current);
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
  else if (process.argv[2] === 'submit') await submit();
  else throw new Error('Usage: node scripts/indexnow.mjs build|submit');
}
