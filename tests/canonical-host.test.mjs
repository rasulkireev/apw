import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ejs from 'ejs';

const template = await readFile(new URL('../nginx/caprover-server.conf.ejs', import.meta.url), 'utf8');
const config = JSON.parse(await readFile(new URL('../scripts/indexnow-config.json', import.meta.url)));
const canonical = 'https://www.rasulkireev.com';
const base = {
  forceSsl: true, hasSsl: true, crtPath: '/cert.pem', keyPath: '/key.pem',
  logAccessPath: '', gzipOn: true, gzipTypes: 'text/plain text/css',
  localDomain: 'srv-captain--apw', containerHttpPort: 80,
  staticWebRoot: '/static', customErrorPagesDirectory: '/errors',
  httpBasicAuthPath: '', websocketSupport: false,
};

for (const domain of ['www.rasulkireev.com', 'rasulkireev.com', 'apw.example.test']) {
  test(`canonical routing for ${domain}`, () => {
    const noncanonical = domain !== 'www.rasulkireev.com';
    const rendered = ejs.render(template, { s: { ...base, publicDomain: domain,
      redirectToPath: noncanonical ? 'http://www.rasulkireev.com' : '',
    } });
    const redirects = [...rendered.matchAll(/return (\d+) ([^;]+);/g)];
    assert.equal(redirects.length, noncanonical ? 2 : 1);
    for (const [, status, target] of redirects) {
      assert.equal(status, '301');
      assert.equal(target, `${canonical}$request_uri`); // Keeps path, escaping and query.
    }
    assert.equal(rendered.includes('proxy_pass $upstream;'), !noncanonical);
    assert.equal((rendered.match(/location \/.well-known\/acme-challenge\//g) || []).length, 2);
    assert.equal((rendered.match(/location \/.well-known\/captain-identifier/g) || []).length, 2);
    assert.ok(rendered.includes('ssl_certificate     /cert.pem;'));
    assert.ok(!rendered.includes('<%'));
  });
}

test('IndexNow origin and sitemap origin agree with the canonical host', () => {
  assert.equal(config.origin, canonical);
  assert.equal(config.sitemapOrigin, canonical);
});

test('deployment does not reuse incompatible apex IndexNow state', async () => {
  const workflow = await readFile(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8');
  assert.ok(!workflow.includes('indexnow-v1-'));
  assert.equal((workflow.match(/key: indexnow-v2-www-\$\{\{ github.sha \}\}/g) || []).length, 2);
  assert.ok(workflow.includes('restore-keys: indexnow-v2-www-'));
});
