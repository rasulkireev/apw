import test from 'node:test';
import assert from 'node:assert/strict';
import { subscribe } from '../src/lib/newsletter.mjs';
const env = { LISTMONK_URL: 'http://listmonk:9000', LISTMONK_LIST_UUID: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' };
function request(data = {}, headers = {}) {
  return new Request('https://www.rasulkireev.com/api/newsletter', { method: 'POST', headers: { origin: 'https://www.rasulkireev.com', 'content-type': 'application/json', accept: 'application/json', ...headers }, body: JSON.stringify({ email: 'reader@example.com', name: 'Reader', tag: 'book', ...data }) });
}
test('submits double opt-in and only reports accepted after the provider confirms', async () => {
  let sent;
  const response = await subscribe(request(), env, async (url, options) => {
    assert.equal(url, 'http://listmonk:9000/api/public/subscription');
    sent = JSON.parse(options.body);
    return Response.json({ data: { has_optin: true } });
  });
  assert.equal(response.status, 200);
  assert.deepEqual(sent, { email: 'reader@example.com', name: 'Reader', list_uuids: ['aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'], attribs: { signup_tag: 'book' } });
  assert.match((await response.json()).message, /confirmation/i);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
test('rejects cross-origin, missing-origin, malformed and oversized submissions before delivery', async () => {
  const noFetch = () => assert.fail('must not contact provider');
  for (const origin of ['https://evil.example', 'null', '']) assert.equal((await subscribe(request({}, { origin }), env, noFetch)).status, 403);
  for (const data of [{ email: '' }, { email: 'broken' }, { name: {} }, { email: 'a'.repeat(300) + '@example.com' }]) assert.equal((await subscribe(request(data), env, noFetch)).status, 400);
  assert.equal((await subscribe(request({ source: 'x'.repeat(5000) }), env, noFetch)).status, 413);
});
test('honeypot is accepted generically without sending', async () => {
  assert.equal((await subscribe(request({ website: 'spam' }), env, () => assert.fail())).status, 200);
});
test('missing configuration, timeouts and invalid upstream contract do not show success', async () => {
  assert.equal((await subscribe(request(), {}, () => assert.fail())).status, 503);
  for (const response of [new Response('bad', { status: 500 }), Response.json({ data: true })]) {
    assert.equal((await subscribe(request(), env, async () => response)).status, 503);
  }
  assert.equal((await subscribe(request(), env, async () => { throw new Error('timeout'); })).status, 503);
});
test('native HTML form works without JavaScript and does not echo personal data', async () => {
  const req = new Request('https://www.rasulkireev.com/api/newsletter', { method: 'POST', headers: { origin: 'https://www.rasulkireev.com' }, body: new URLSearchParams({ email: 'reader@example.com', name: 'Reader' }) });
  const response = await subscribe(req, env, async () => Response.json({ data: { has_optin: true } }));
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.match(body, /Check your inbox/);
  assert.doesNotMatch(body, /reader@example.com/);
  assert.match(response.headers.get('content-type'), /text\/html/);
});

test('already confirmed subscribers get the same generic response', async () => {
  const response = await subscribe(request(), env, async () => Response.json({ data: { has_optin: false } }));
  assert.equal(response.status, 200);
  assert.match((await response.json()).message, /confirmation/);
});
