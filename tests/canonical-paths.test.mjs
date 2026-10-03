import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildCanonicalPaths } from '../scripts/canonical-paths.mjs';
import { buildManifest } from '../scripts/indexnow.mjs';

async function fixture(run) {
  const dir = await mkdtemp(join(tmpdir(), 'apw-paths-'));
  try {
    const dist = join(dir, 'dist');
    await mkdir(dist);
    const pages = [
      ['/', 'https://www.rasulkireev.com/'],
      ['/book/', 'https://www.rasulkireev.com/book'],
      ['/articles/', 'https://www.rasulkireev.com/articles/'],
      ['/tag/Personal%20Finance/', 'https://www.rasulkireev.com/tag/Personal%20Finance/'],
      ['/syndicated/', 'https://builtwithdjango.com/blog/syndicated'],
    ];
    for (const [path, canonical] of pages) {
      const folder = join(dist, decodeURIComponent(path));
      await mkdir(folder, { recursive: true });
      await writeFile(join(folder, 'index.html'), `<html><head><link rel="canonical" href="${canonical}"></head><body>Unchanged text</body></html>`);
    }
    await writeFile(join(dist, 'sitemap-0.xml'), '<urlset>' + pages.map(([path]) =>
      `<url><loc>https://www.rasulkireev.com${path}</loc></url>`).join('') + '</urlset>');
    await run(dist, join(dir, 'routes.conf'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test('routing and IndexNow preserve declared article owners without rewriting HTML or hubs', async () => {
  await fixture(async (dist, output) => {
    const before = await readFile(join(dist, 'book/index.html'), 'utf8');
    assert.deepEqual(await buildCanonicalPaths(dist, output), [{
      from: 'https://www.rasulkireev.com/book/', to: 'https://www.rasulkireev.com/book',
    }]);
    const routes = await readFile(output, 'utf8');
    assert.match(routes, /location = \/book \{ try_files \/book\/index.html =404; \}/);
    assert.match(routes, /return 301 \/book\$is_args\$args;/);
    assert.doesNotMatch(routes, /articles|syndicated|Personal/);
    const xml = await readFile(join(dist, 'sitemap-0.xml'), 'utf8');
    assert.ok(xml.includes('<loc>https://www.rasulkireev.com/book</loc>'));
    assert.ok(xml.includes('<loc>https://www.rasulkireev.com/articles/</loc>'));
    assert.doesNotMatch(xml, /lastmod/);
    const manifest = await buildManifest(dist, 'test-revision');
    assert.equal(Object.keys(manifest.pages).length, 5);
    assert.ok(manifest.pages['https://www.rasulkireev.com/book']);
    assert.equal(await readFile(join(dist, 'book/index.html'), 'utf8'), before);
    await buildCanonicalPaths(dist, output);
    assert.equal(await readFile(output, 'utf8'), routes, 'repeated generation must retain routing');
  });
});

test('unexpected canonical relationships and unsafe nginx paths fail closed', async () => {
  for (const canonical of ['https://www.rasulkireev.com/other', 'https://www.rasulkireev.com/book?x=1']) {
    await fixture(async (dist, output) => {
      await writeFile(join(dist, 'book/index.html'), `<link rel="canonical" href="${canonical}">`);
      await assert.rejects(buildCanonicalPaths(dist, output), /Unsupported canonical mapping/);
    });
  }
  await fixture(async (dist, output) => {
    await writeFile(join(dist, 'tag/Personal Finance/index.html'), '<link rel="canonical" href="https://www.rasulkireev.com/tag/Personal%20Finance">');
    await assert.rejects(buildCanonicalPaths(dist, output), /Unsafe nginx path/);
  });
});
