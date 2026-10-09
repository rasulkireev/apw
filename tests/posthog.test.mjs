import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { publicPageUrl, sanitizePageEvent } from '../src/lib/analytics.mjs';

const source = readFileSync(new URL('../src/components/PostHog.astro', import.meta.url), 'utf8')
  .replace(/^<script>\s*/, '').replace(/<\/script>\s*$/, '')
  .replace('import { publicPageUrl, sanitizePageEvent } from "../lib/analytics.mjs";', '')
  .replaceAll('import.meta.env', 'env')
  .replace("import('posthog-js')", 'loadSDK()');

async function run({ prod = true, key = 'public-test-key', hostname = 'www.rasulkireev.com', blocked = false, dnt = '0', gpc = false } = {}) {
  const calls = [];
  let loads = 0;
  vm.runInNewContext(source, {
    env: { PROD: prod, PUBLIC_POSTHOG_KEY: key, PUBLIC_POSTHOG_HOST: 'https://us.i.posthog.com' },
    window: { location: { hostname } },
    navigator: { doNotTrack: dnt, globalPrivacyControl: gpc },
    document: { referrer: '' }, publicPageUrl, sanitizePageEvent,
    loadSDK() {
      loads++;
      return blocked ? Promise.reject(new Error('blocked')) : Promise.resolve({ default: { init: (...args) => calls.push(args) } });
    },
  });
  await new Promise(resolve => setImmediate(resolve));
  return { calls, loads };
}

test('both production domains initialize once with anonymous page-only analytics', async () => {
  for (const hostname of ['rasulkireev.com', 'www.rasulkireev.com']) {
    const { calls, loads } = await run({ hostname });
    assert.equal(loads, 1);
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], 'public-test-key');
    const config = calls[0][1];
    assert.equal(config.api_host, 'https://us.i.posthog.com');
    assert.equal(config.capture_pageview, true);
    assert.equal(config.capture_pageleave, true);
    assert.equal(config.person_profiles, 'identified_only');
    assert.equal(config.disable_session_recording, true);
    assert.equal(config.autocapture, false);
    assert.equal(config.advanced_disable_flags, true);
    assert.equal(config.save_campaign_params, false);
    assert.equal(config.save_referrer, false);
    assert.equal(config.respect_dnt, true);
  }
});

test('development, preview hosts, lookalike domains, and missing keys never load the SDK', async () => {
  for (const options of [{ prod: false }, { dnt: '1' }, { gpc: true }, { key: '' }, { hostname: 'localhost' }, { hostname: 'preview.example.com' }, { hostname: 'rasulkireev.com.example.com' }]) {
    assert.equal((await run(options)).loads, 0);
  }
});

test('blocked analytics SDK does not cause an unhandled rejection', async () => {
  const result = await run({ blocked: true });
  assert.equal(result.loads, 1);
  assert.equal(result.calls.length, 0);
});


test('page payload excludes subscriber data, private links, query strings and nested person properties', () => {
  const event = sanitizePageEvent({ event: '$pageview', uuid: 'event-id', timestamp: '2026-10-09',
    $set_once: { email: 'private@example.com' }, properties: {
      token: 'public-key', distinct_id: 'anonymous-id', $session_id: 'session-id',
      $current_url: 'https://www.rasulkireev.com/how-to-read-a-book?email=private#secret',
      $session_entry_url: 'https://www.rasulkireev.com/hunt-gather-parent?token=secret',
      $session_entry_referrer: 'https://search.example/private?q=secret#private',
      $initial_current_url: 'https://example.com/private?token=secret',
      $set: { email: 'private@example.com' }, $elements: [{ href: 'obsidian://private' }],
      email: 'private@example.com', utm_source: 'private',
    } }, 'https://search.example/private?q=secret#private');
  assert.equal(event.properties.$current_url, 'https://www.rasulkireev.com/how-to-read-a-book');
  assert.equal(event.properties.$session_entry_url, 'https://www.rasulkireev.com/hunt-gather-parent');
  assert.equal(event.properties.$session_entry_referrer, 'https://search.example');
  assert.equal(event.properties.$referrer, 'https://search.example');
  assert.equal(event.properties.$referring_domain, 'search.example');
  assert.equal(event.properties.$session_id, 'session-id');
  assert.doesNotMatch(JSON.stringify(event), /private|secret|email|obsidian|utm_source|\$set/);
});

test('non-page events and unsafe URLs are not sent', () => {
  for (const event of ['$autocapture', '$identify', 'newsletter_success', '$exception']) {
    assert.equal(sanitizePageEvent({ event, properties: {} }), null);
  }
  for (const url of ['https://evil.test/article', 'https://www.rasulkireev.com/api/newsletter', 'obsidian://private', 'not-a-url', 'https://user:secret@www.rasulkireev.com/article']) {
    assert.equal(publicPageUrl(url), null);
    assert.equal(sanitizePageEvent({ event: '$pageview', properties: { $current_url: url } }), null);
  }
  assert.equal(sanitizePageEvent({event: '$pageleave', properties: {$current_url: 'https://www.rasulkireev.com/happy-sleeper'}}, 'obsidian://private').properties.$referrer, '$direct');
});
