import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const page = readFileSync(new URL('../src/pages/tutorials.astro', import.meta.url), 'utf8');
const script = page.match(/<script>([\s\S]*?)<\/script>/)[1];

// Execute the actual page controller against a small browser/DOM fixture.
function fixture(search = '') {
  function element(attributes = {}, classes = []) {
    const names = new Set(classes), events = {};
    return {
      style: {}, events,
      getAttribute: name => attributes[name] ?? null,
      setAttribute: (name, value) => { attributes[name] = value; },
      addEventListener: (name, fn) => { events[name] = fn; },
      classList: {
        contains: name => names.has(name),
        remove: name => names.delete(name),
        toggle(name, force = !names.has(name)) {
          if (force) names.add(name); else names.delete(name);
          return force;
        },
      },
    };
  }
  const pills = ['Django', 'Bash Scripting', 'Python'].map(tag => element({ 'data-tag': tag }));
  const items = ['Django,Python', 'Bash Scripting', 'Python', ''].map(tags => element({ 'data-tags': tags }));
  const toggle = element(), container = element({}, ['hidden']);
  const browser = { location: new URL('https://example.com/tutorials/' + search), events: {} };
  browser.addEventListener = (name, fn) => { browser.events[name] = fn; };
  browser.history = { pushState(_state, _title, url) { browser.location = new URL(url); } };
  const document = {
    getElementById: id => id === 'toggleTags' ? toggle : container,
    querySelectorAll: selector => selector === '.tag-pill' ? pills : items,
  };
  vm.runInNewContext(script, { document, window: browser, URL, URLSearchParams });
  return {
    browser, pills, items, toggle, container,
    visible: () => items.map((item, index) => item.style.display === 'none' ? null : index).filter(i => i !== null),
    navigate(search) {
      browser.location = new URL('https://example.com/tutorials/' + search);
      browser.events.popstate();
    },
  };
}

test('Back and Forward restore both visible tutorials and selected controls', () => {
  const f = fixture();
  assert.deepEqual(f.visible(), [0, 1, 2, 3]);
  f.pills[0].events.click();
  assert.equal(f.browser.location.search, '?tags=Django');
  assert.deepEqual(f.visible(), [0]);
  f.navigate('');
  assert.deepEqual(f.visible(), [0, 1, 2, 3]);
  assert.equal(f.pills[0].getAttribute('aria-pressed'), 'false');
  f.navigate('?tags=Django');
  assert.deepEqual(f.visible(), [0]);
  assert.equal(f.pills[0].getAttribute('aria-pressed'), 'true');
});

test('shared encoded multi-tag URLs restore union filtering and disclosure state', () => {
  const f = fixture('?tags=Django%2CBash+Scripting&keep=yes#tutorials');
  assert.deepEqual(f.visible(), [0, 1]);
  assert.equal(f.container.classList.contains('hidden'), false);
  assert.equal(f.toggle.getAttribute('aria-expanded'), 'true');
  f.pills[0].events.click();
  assert.deepEqual(f.visible(), [1]);
  assert.equal(f.browser.location.searchParams.get('keep'), 'yes');
  assert.equal(f.browser.location.hash, '#tutorials');
  f.pills[1].events.click();
  assert.equal(f.browser.location.searchParams.has('tags'), false);
  assert.deepEqual(f.visible(), [0, 1, 2, 3]);
  f.toggle.events.click();
  assert.equal(f.toggle.getAttribute('aria-expanded'), 'false');
});

test('unknown or empty tags do not hide all tutorials; valid tags still apply', () => {
  assert.deepEqual(fixture('?tags=unknown,,').visible(), [0, 1, 2, 3]);
  assert.deepEqual(fixture('?tags=unknown,Django').visible(), [0]);
});
