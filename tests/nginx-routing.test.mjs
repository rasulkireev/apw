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

// Check rendered hrefs against nginx, not only a hard-coded list of destinations.
test('shared navigation and tag browsing link directly to existing pages', { skip: !origin }, async () => {
  const targets = new Set();
  for (const path of ['/', '/how-to-read-a-book', '/tags/', '/tag/Personal%20Finance/']) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    const shared = [...html.matchAll(/<(nav|footer)\b[^>]*>[\s\S]*?<\/\1>/g)];
    assert.ok(shared.length >= 2, `navigation and footer rendered on ${path}`);
    for (const [section] of shared) {
      for (const [, href] of section.matchAll(/href="([^"]+)"/g)) {
        if (href.startsWith('/') && !href.startsWith('//')) targets.add(href);
      }
    }
    if (path === '/tags/') {
      const tagLinks = [...html.matchAll(/href="(\/tag\/[^"#?]+)"/g)];
      assert.ok(tagLinks.length > 350, 'all tag destinations exercised');
      assert.ok(tagLinks.some(([, href]) => href.includes('%20')), 'multi-word tags encoded');
      for (const [, href] of tagLinks) {
        assert.ok(!href.includes(' '), href);
        targets.add(href);
      }
    }
    if (path.startsWith('/tag/')) {
      const backLinks = [...html.matchAll(/href="(\/tags\/?)"/g)];
      assert.ok(backLinks.length > 0, 'tag archive links back to tag index');
      for (const [, href] of backLinks) targets.add(href);
    }
  }
  for (const href of targets) {
    const response = await request(href);
    assert.equal(response.status, 200, href);
    assert.equal(response.headers.get('location'), null, href);
    await response.arrayBuffer();
  }
});


test('social icons render from a complete local sprite without icon-font CSS', { skip: !origin }, async () => {
  const spriteResponse = await request('/icons/social.svg');
  assert.equal(spriteResponse.status, 200);
  assert.match(spriteResponse.headers.get('content-type'), /image\/svg\+xml/);
  const sprite = await spriteResponse.text();
  const symbols = new Set([...sprite.matchAll(/<symbol id="([^"]+)"/g)].map(match => match[1]));
  assert.equal(symbols.size, 12);
  assert.doesNotMatch(sprite, /<script|onload=|https?:\/\/(?!www\.w3\.org)/);
  for (const path of ['/', '/how-to-read-a-book', '/10-years-of-great-books']) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.doesNotMatch(html, /maxst\.icons8\.com|line-awesome.*\.css|class="[^"]*\bla[bsr]? la-/);
    const icons = [...html.matchAll(/<svg\b[^>]*>[\s\S]*?<use href="\/icons\/social\.svg#([^"]+)"[^>]*>[\s\S]*?<\/svg>/g)];
    assert.ok(icons.length >= 7, `rendered icons on ${path}`);
    for (const [markup, name] of icons) {
      assert.ok(symbols.has(name), `${path}: ${name} exists`);
      assert.match(markup, /aria-hidden="true"/);
      assert.match(markup, /width="1em" height="1em"/);
    }
    for (const [anchor] of html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)) {
      if (!anchor.includes('/icons/social.svg#')) continue;
      const visibleText = anchor.replace(/<[^>]+>/g, '').trim();
      assert.ok(visibleText || /aria-label="[^" ]/.test(anchor), `icon link has an accessible name on ${path}`);
    }
  }
});

test('native newsletter endpoint validates requests and rate limits spoofed client headers', { skip: !origin }, async () => {
  const call = (headers = {}, data = {}) => fetch(new URL('/api/newsletter', origin), {
    method: 'POST', headers: { Origin: 'https://www.rasulkireev.com', 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
    body: JSON.stringify({ email: 'reader@example.com', ...data }),
  });
  assert.equal((await call({ Origin: 'https://attacker.example' })).status, 403);
  assert.equal((await call({}, { email: 'bad' })).status, 400);
  // CI has no provider configuration: unavailable must not look like successful signup.
  assert.equal((await call()).status, 503);
  let limited = false;
  for (let i = 0; i < 6; i++) {
    const response = await call({ 'X-Real-IP': `192.0.2.${i + 1}`, 'X-Forwarded-For': `192.0.2.${i + 1}` }, { website: 'bot' });
    if (response.status === 429) { limited = true; assert.equal(response.headers.get('cache-control'), 'no-store'); }
    else assert.equal(response.status, 200);
  }
  assert.ok(limited, 'client-supplied IP headers cannot bypass the ingress budget');
});
