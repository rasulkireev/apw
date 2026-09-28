import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/components/PostHog.astro', import.meta.url), 'utf8')
  .replace(/^<script>\s*/, '').replace(/<\/script>\s*$/, '')
  .replaceAll('import.meta.env', 'env')
  .replace("import('posthog-js')", 'loadSDK()');

async function run({ prod = true, key = 'public-test-key', hostname = 'www.rasulkireev.com', blocked = false } = {}) {
  const calls = [];
  let loads = 0;
  vm.runInNewContext(source, {
    env: { PROD: prod, PUBLIC_POSTHOG_KEY: key, PUBLIC_POSTHOG_HOST: 'https://us.i.posthog.com' },
    window: { location: { hostname } },
    loadSDK() {
      loads++;
      return blocked ? Promise.reject(new Error('blocked')) : Promise.resolve({ default: { init: (...args) => calls.push(args) } });
    },
  });
  await new Promise(resolve => setImmediate(resolve));
  return { calls, loads };
}

test('both production domains initialize once with anonymous, masked analytics', async () => {
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
    assert.equal(config.autocapture.mask_all_text, true);
    assert.equal(config.autocapture.mask_all_element_attributes, true);
  }
});

test('development, preview hosts, lookalike domains, and missing keys never load the SDK', async () => {
  for (const options of [{ prod: false }, { key: '' }, { hostname: 'localhost' }, { hostname: 'preview.example.com' }, { hostname: 'rasulkireev.com.example.com' }]) {
    assert.equal((await run(options)).loads, 0);
  }
});

test('blocked analytics SDK does not cause an unhandled rejection', async () => {
  const result = await run({ blocked: true });
  assert.equal(result.loads, 1);
  assert.equal(result.calls.length, 0);
});
