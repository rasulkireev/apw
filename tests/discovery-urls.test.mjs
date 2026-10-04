import test from 'node:test';
import assert from 'node:assert/strict';
import rss from '@astrojs/rss';
import { localEntryUrl, feedItem } from '../src/utils/discovery-urls.mjs';

const site = new URL('https://www.rasulkireev.com/');
const entry = {
  collection: 'books', slug: 'how-to-read-a-book',
  data: { title: 'Original title', description: 'Original description', dateCreated: new Date('2020-01-02') },
};

test('discovery URLs respect actual local routing and external canonical overrides', () => {
  for (const collection of ['articles', 'books', 'tutorials', 'recipes', 'prompts']) {
    assert.equal(localEntryUrl({ ...entry, collection }, site), `${site}how-to-read-a-book`);
  }
  const syndicated = { ...entry, collection: 'tutorials', slug: 'django-version-control',
    data: { ...entry.data, canonical: 'https://builtwithdjango.com/blog/django-version-control' } };
  assert.equal(localEntryUrl(syndicated, site), `${site}django-version-control/`);
  assert.equal(localEntryUrl({ ...entry, data: { ...entry.data, canonical: `${site}custom-path` } }, site), `${site}custom-path`);
  for (const collection of ['now', 'reviews']) {
    assert.equal(localEntryUrl({ ...entry, collection }, site), null);
    assert.throws(() => feedItem({ ...entry, collection }, site), /No standalone route/);
  }
});

test('RSS serializer changes destinations without changing existing item identities or dates', async () => {
  const options = { title: 'Feed', description: 'Description', site };
  const old = await (await rss({ ...options, items: [{
    title: entry.data.title, description: entry.data.description,
    pubDate: entry.data.dateCreated, link: `/${entry.slug}/`,
  }] })).text();
  const current = await (await rss({ ...options, items: [feedItem(entry, site)] })).text();
  const item = xml => xml.match(/<item>([\s\S]*?)<\/item>/)[1];
  assert.equal(item(current), item(old).replace(`<link>${site}${entry.slug}/</link>`, `<link>${site}${entry.slug}</link>`));
});

test('RSS GUIDs remain well-formed XML for escaped paths', async () => {
  const special = { ...entry, slug: 'notes/a&b' };
  const xml = await (await rss({ title: 'Feed', description: 'Description', site, items: [feedItem(special, site)] })).text();
  assert.match(xml, /<guid isPermaLink="true">https:\/\/www\.rasulkireev\.com\/notes\/a&amp;b\/<\/guid>/);
});
