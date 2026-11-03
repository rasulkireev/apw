import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { buildManifest, changedUrls, contentFingerprint, prepareBaseline, validateManifest, submit } from '../scripts/indexnow.mjs';
const config = JSON.parse(await readFile(new URL('../scripts/indexnow-config.json', import.meta.url)));
const url = name => `${config.origin}/${name}`;
const manifest = pages => ({ version: 1, revision: 'abc', pages });
const hash = 'a'.repeat(64);

test('includes additions, changes and deletions but not unchanged URLs', () => {
  assert.deepEqual(changedUrls(manifest({ [url('old')]: hash, [url('same')]: hash, [url('changed')]: hash }),
    manifest({ [url('new')]: hash, [url('same')]: hash, [url('changed')]: 'b'.repeat(64) })),
    [url('changed'), url('new'), url('old')]);
});
test('rejects foreign hosts and malformed hashes', () => {
  assert.throws(() => validateManifest(manifest({ 'https://example.com/': hash })));
  assert.throws(() => validateManifest(manifest({ [url('')]: 'bad' })));
});
test('waits for revision, verifies key, preserves state on failure, then saves accepted submission', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'indexnow-'));
  try {
    const previousPath = join(dir, 'state.json');
    const current = manifest({ [url('')]: hash });
    const previous = manifest({});
    await writeFile(previousPath, JSON.stringify(previous));
    let polls = 0, status = 429, posts = 0;
    const fetchFn = async (target, options) => {
      if (target.includes('indexnow-manifest')) return Response.json({ ...current, revision: ++polls === 1 ? 'old' : 'abc' });
      if (target.endsWith('.txt')) return new Response(config.key);
      posts++;
      assert.deepEqual(JSON.parse(options.body).urlList, [url('')]);
      return new Response('', { status });
    };
    const opts = { fetchFn, sleep: async () => {}, revision: 'abc', previousPath };
    await assert.rejects(submit(opts), /429/);
    assert.deepEqual(JSON.parse(await readFile(previousPath)), previous);
    status = 202;
    await submit(opts);
    assert.deepEqual(JSON.parse(await readFile(previousPath)), current);
    await submit(opts);
    assert.equal(posts, 2); // Successful state prevents duplicate submissions.
  } finally { await rm(dir, { recursive: true, force: true }); }
});
test('does not submit when live key differs', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'indexnow-key-'));
  try {
    await assert.rejects(submit({ revision: 'abc', previousPath: join(dir, 'state.json'),
      fetchFn: async target => target.includes('manifest') ? Response.json(manifest({ [url('')]: hash })) : new Response('wrong'),
    }), /key verification failed/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('build uses final canonical URLs and tracks actual generated HTML changes', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'indexnow-build-'));
  try {
    await mkdir(join(dir, 'hello'));
    await writeFile(join(dir, 'hello/index.html'), '<h1>Hello</h1>');
    await writeFile(join(dir, 'sitemap-0.xml'), `<urlset><url><loc>${config.sitemapOrigin}/hello/</loc></url></urlset>`);
    const first = await buildManifest(dir, 'one');
    assert.equal(first.version, 2);
    assert.deepEqual(Object.keys(first.pages), [url('hello/')]);
    await writeFile(join(dir, 'hello/index.html'), '<h1>Updated</h1>');
    const second = await buildManifest(dir, 'two');
    assert.deepEqual(changedUrls(first, second), [url('hello/')]);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('build identifiers do not notify unchanged pages, while content and SEO changes do', () => {
  const html = '<link rel="stylesheet" href="/_astro/_slug_.Abcd1234.css"><script src="/_astro/page.Efgh5678.js"></script><main data-astro-cid-abcdefgh><h1>Review</h1><a href="/notes">Notes</a><img src="/_astro/cover.Image123.jpg"></main><meta name="description" content="Personal notes"><script type="application/ld+json">{"name":"Review"}</script>';
  const assetOnly = html.replace('Abcd1234', 'NewHash1').replace('Efgh5678', 'NewHash2').replace('abcdefgh', 'ijklmnop');
  assert.equal(contentFingerprint(html), contentFingerprint(assetOnly));
  const island = '<astro-island uid="randomA" component-url="/_astro/Navbar.Abcd1234.js" renderer-url="/_astro/client.Efgh5678.js" props="{&quot;title&quot;:&quot;Notes&quot;}"><h1>Notes</h1></astro-island>';
  assert.equal(contentFingerprint(island), contentFingerprint(island.replace('randomA', 'randomB').replace('Abcd1234', 'NewHash1').replace('Efgh5678', 'NewHash2')));
  assert.notEqual(contentFingerprint(island), contentFingerprint(island.replace('title', 'description')));
  for (const [from, to] of [['<h1>Review', '<h1>Updated'], ['href="/notes"', 'href="/books"'], ['Image123', 'Image456'], ['Personal notes', 'New preview'], ['{"name":"Review"}', '{"name":"Other"}']]) {
    assert.notEqual(contentFingerprint(html), contentFingerprint(html.replace(from, to)), from);
  }
  const inline = '<script>const example = "<link href=\"/_astro/a.Abcd1234.css\">";</script>';
  assert.notEqual(contentFingerprint(inline), contentFingerprint(inline.replace('Abcd1234', 'NewHash1')));
  const meta = '<meta name="description" content="Example data-astro-cid-abcdefgh">';
  assert.notEqual(contentFingerprint(meta), contentFingerprint(meta.replace('abcdefgh', 'ijklmnop')));
});

test('pre-rollout migration reconstructs only verified legacy HTML and preserves state on mismatch', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'indexnow-migrate-'));
  try {
    const previousPath = join(dir, 'state.json');
    const html = '<astro-island uid="random"><h1>Original</h1></astro-island>';
    const raw = createHash('sha256').update(html).digest('hex');
    const legacy = manifest({ [url('same')]: raw });
    let live = legacy, body = html;
    const fetchFn = async target => target.includes('manifest') ? Response.json(live) : new Response(body);
    await writeFile(previousPath, JSON.stringify(legacy));
    await prepareBaseline({ previousPath, fetchFn });
    const upgraded = JSON.parse(await readFile(previousPath));
    assert.equal(upgraded.version, 2);
    assert.equal(upgraded.pages[url('same')], contentFingerprint(html));
    assert.equal(upgraded.rawPages[url('same')], raw);
    await prepareBaseline({ previousPath, fetchFn: () => { throw new Error('Already upgraded; no network expected'); } });
    for (const mismatch of ['html', 'revision', 'inventory']) {
      await writeFile(previousPath, JSON.stringify(legacy));
      body = mismatch === 'html' ? '<h1>Changed</h1>' : html;
      live = mismatch === 'revision' ? { ...legacy, revision: 'wrong' } : mismatch === 'inventory' ? manifest({}) : legacy;
      await assert.rejects(prepareBaseline({ previousPath, fetchFn }), /differs|not the live baseline/);
      assert.deepEqual(JSON.parse(await readFile(previousPath)), legacy);
    }
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('legacy migration requires matching raw hashes; never hides edits or compares unlike algorithms', () => {
  const previous = manifest({ [url('same')]: hash, [url('gone')]: hash });
  const current = { version: 2, revision: 'new', pages: { [url('same')]: 'b'.repeat(64), [url('new')]: hash }, rawPages: { [url('same')]: hash, [url('new')]: hash } };
  assert.deepEqual(changedUrls(previous, current), [url('gone'), url('new')]);
  assert.throws(() => changedUrls(previous, { ...current, rawPages: { ...current.rawPages, [url('same')]: 'c'.repeat(64) } }), /reconcile before migration/);
  assert.throws(() => changedUrls(current, previous), /downgrade/);
  assert.throws(() => validateManifest({ ...current, rawPages: {} }), /inventories differ/);
});

test('cache loss seeds a baseline without resubmitting healthy URLs; next real edit is submitted', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'indexnow-seed-'));
  try {
    const previousPath = join(dir, 'state.json');
    let current = { version: 2, revision: 'abc', pages: { [url('same')]: hash }, rawPages: { [url('same')]: hash } };
    let posts = 0;
    const fetchFn = async (target, options) => {
      if (target.includes('manifest')) return Response.json(current);
      if (target.endsWith('.txt')) return new Response(config.key);
      posts++;
      assert.deepEqual(JSON.parse(options.body).urlList, [url('same')]);
      return new Response('', { status: 200 });
    };
    await submit({ revision: 'abc', previousPath, fetchFn });
    assert.equal(posts, 0);
    assert.deepEqual(JSON.parse(await readFile(previousPath)), current);
    const legacy = manifest(current.rawPages);
    await writeFile(previousPath, JSON.stringify(legacy));
    await submit({ revision: 'abc', previousPath, fetchFn });
    assert.equal(posts, 0);
    assert.equal(JSON.parse(await readFile(previousPath)).version, 2);
    current = { ...current, pages: { [url('same')]: 'c'.repeat(64) }, rawPages: { [url('same')]: 'd'.repeat(64) } };
    await submit({ revision: 'abc', previousPath, fetchFn });
    assert.equal(posts, 1);
    await writeFile(previousPath, JSON.stringify(legacy));
    await assert.rejects(submit({ revision: 'abc', previousPath, fetchFn }), /reconcile before migration/);
    assert.deepEqual(JSON.parse(await readFile(previousPath)), legacy);
    assert.equal(posts, 1);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
