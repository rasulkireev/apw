import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import sitemapAlias from '../scripts/sitemap-alias.mjs';

test('legacy sitemap tracks the generated index, including multiple chunks and rebuilds', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'apw-sitemap-'));
  try {
    const hook = sitemapAlias().hooks['astro:build:done'];
    const directoryUrl = pathToFileURL(`${dir}/`);
    for (const chunks of [2, 1]) {
      const xml = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
        Array.from({ length: chunks }, (_, i) =>
          `<sitemap><loc>https://www.rasulkireev.com/sitemap-${i}.xml</loc></sitemap>`).join('') +
        '</sitemapindex>';
      await writeFile(join(dir, 'sitemap-index.xml'), xml);
      await hook({ dir: directoryUrl });
      assert.equal(await readFile(join(dir, 'sitemap.xml'), 'utf8'), xml);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('missing generated sitemap fails the build instead of silently publishing a stale alias', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'apw-sitemap-'));
  try {
    await assert.rejects(sitemapAlias().hooks['astro:build:done']({
      dir: pathToFileURL(`${dir}/`),
    }), { code: 'ENOENT' });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
