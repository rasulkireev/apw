import assert from 'node:assert/strict';
import test from 'node:test';

// Run against the actual production image in Docker CI, not Astro's dev server.
const origin = process.env.APW_ROUTING_TEST_ORIGIN;
const request = path => fetch(new URL(path, origin), {
  redirect: 'manual',
  headers: { Host: 'rasulkireev.com', 'X-Forwarded-Proto': 'https' },
});

test('nginx directory redirects retain the public HTTPS scheme and query', { skip: !origin }, async () => {
  for (const [path, title] of [
    ['/articles', 'Articles by Rasul Kireev'],
    ['/how-to-read-a-book', 'How to Read a Book by Mortimer Adler | Book Review by Rasul Kireev'],
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
  for (const path of ['/', '/articles/', '/how-to-read-a-book/', '/sitemap.xml', '/sitemap-index.xml', '/logo.png']) {
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
