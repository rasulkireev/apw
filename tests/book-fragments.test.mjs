import test from 'node:test';
import assert from 'node:assert/strict';
import { revealBookFragment } from '../src/lib/book-fragments.mjs';

function fixture() {
  const targets = new Map([
    ['highlights', { section: 'highlights' }],
    ['chapter: café', { section: 'highlights' }],
    ['analysis', { section: 'analysis' }],
    ['ideas', { section: 'ideas' }],
    ['review', { section: null }],
    ['footer', { outside: true }],
  ]);
  const root = {
    ownerDocument: { getElementById: id => targets.get(id) },
    contains: target => !target.outside,
  };
  const opened = [];
  const sections = ['highlights', 'analysis', 'ideas'].map(name => ({
    element: { contains: target => target.section === name },
    reveal: () => opened.push(name),
  }));
  return { targets, root, opened, sections };
}

test('shared links reveal the matching book section, including encoded IDs', () => {
  for (const [hash, id, section] of [
    ['#highlights', 'highlights', 'highlights'],
    ['#chapter%3A%20caf%C3%A9', 'chapter: café', 'highlights'],
    ['#analysis', 'analysis', 'analysis'],
    ['#ideas', 'ideas', 'ideas'],
  ]) {
    const { targets, root, opened, sections } = fixture();
    assert.equal(revealBookFragment(root, hash, sections), targets.get(id));
    assert.deepEqual(opened, [section]);
  }
});

test('ordinary, missing, outside and malformed fragments do not open or scroll sections', () => {
  for (const hash of ['', '#', 'highlights', '#review', '#missing', '#footer', '#bad%ZZ']) {
    const { root, opened, sections } = fixture();
    assert.equal(revealBookFragment(root, hash, sections), null);
    assert.deepEqual(opened, []);
  }
  assert.equal(revealBookFragment(null, '#highlights', []), null);
});

test('a target inside nested managed sections opens every enclosing section', () => {
  const { root, sections, opened } = fixture();
  sections.unshift({ element: { contains: () => true }, reveal: () => opened.push('outer') });
  revealBookFragment(root, '#analysis', sections);
  assert.deepEqual(opened, ['outer', 'analysis']);
});
