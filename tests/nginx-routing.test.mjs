import assert from 'node:assert/strict';
import test from 'node:test';

// Run against the actual production image in Docker CI, not Astro's dev server.
const origin = process.env.APW_ROUTING_TEST_ORIGIN;
const request = path => fetch(new URL(path, origin), {
  redirect: 'manual',
  headers: { Host: 'rasulkireev.com', 'X-Forwarded-Proto': 'https' },
});

test('all advertised RSS and machine-readable source URLs resolve without redirects', { skip: !origin }, async () => {
  const urls = new Set();
  for (const path of ['/rss.xml', '/django-rss.xml', '/llms.txt']) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    const body = await response.text();
    const matches = path.endsWith('.xml')
      ? [...body.matchAll(/<link>(.*?)<\/link>/g)].map(match => match[1])
      : [...body.matchAll(/^URL: (\S+)/gm)].map(match => match[1]);
    assert.ok(matches.length > 1, `nonempty discovery endpoint ${path}`);
    for (const url of matches) urls.add(url);
  }
  assert.ok(urls.size > 100, 'exercise all advertised source URLs');
  for (const url of urls) {
    const parsed = new URL(url);
    assert.equal(parsed.origin, 'https://www.rasulkireev.com');
    assert.ok(!parsed.pathname.includes('//'), url);
    const response = await request(parsed.pathname);
    assert.equal(response.status, 200, url);
    assert.equal(response.headers.get('location'), null, url);
    await response.arrayBuffer();
  }
});

test('nginx directory redirects retain the public HTTPS scheme and query', { skip: !origin }, async () => {
  for (const [path, title] of [
    ['/articles', 'Articles by Rasul Kireev'],
  ]) {
    for (const query of ['', '?source=seo-test&value=a%20b']) {
      const response = await request(path + query);
      assert.equal(response.status, 301);
      const location = response.headers.get('location');
      assert.equal(location, path + '/' + query);
      const publicDestination = new URL(location, 'https://rasulkireev.com' + path);
      assert.equal(publicDestination.origin, 'https://rasulkireev.com');
      const destination = await request(location);
      assert.equal(destination.status, 200);
      const html = await destination.text();
      assert.equal(html.match(/<title>(.*?)<\/title>/s)?.[1], title);
    }
  }
});

test('nginx keeps pages, sitemap, assets and real 404 responses working', { skip: !origin }, async () => {
  for (const path of ['/', '/articles/', '/how-to-read-a-book', '/tag/Personal%20Finance/', '/sitemap.xml', '/sitemap-index.xml', '/logo.png']) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get('location'), null, path);
    await response.arrayBuffer();
  }
  for (const path of ['/seo-routing-test-missing', '/seo-routing-test-missing/']) {
    const response = await request(path);
    assert.equal(response.status, 404, path);
    assert.equal(response.headers.get('location'), null, path);
  }
});

test('every generated article canonical serves directly and its alias redirects once', { skip: !origin }, async () => {
  const response = await request('/indexnow-manifest.json');
  assert.equal(response.status, 200);
  const { pages } = await response.json();
  const owners = Object.keys(pages).map(url => new URL(url).pathname).filter(path => !path.endsWith('/'));
  assert.ok(owners.length > 100, 'exercise the complete generated article routing inventory');
  for (const path of owners) {
    const direct = await request(path);
    assert.equal(direct.status, 200, path);
    assert.equal(direct.headers.get('location'), null, path);
    const html = await direct.text();
    assert.ok(html.includes(`href="https://www.rasulkireev.com${path}"`), path);
    for (const query of ['', '?source=seo-test&value=a%20b']) {
      const alias = await request(path + '/' + query);
      assert.equal(alias.status, 301, path);
      assert.equal(alias.headers.get('location'), path + query, path);
      const final = await request(alias.headers.get('location'));
      assert.equal(final.status, 200, path);
      assert.equal(await final.text(), html, path);
    }
  }
});
