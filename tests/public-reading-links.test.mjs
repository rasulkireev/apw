import test from 'node:test';
import assert from 'node:assert/strict';
import publicReadingLinks from '../scripts/remark-public-reading-links.mjs';

test('imported private links retain nested labels without publishing their destinations', () => {
  const label = [{ type: 'strong', children: [{ type: 'text', value: 'Chapter 2' }] }];
  for (const url of ['private://read/example#chapter', 'PRIVATE://read/example#chapter']) {
    const tree = { type: 'root', children: [{ type: 'paragraph', children: [
      { type: 'text', value: 'See ' }, { type: 'link', url, children: structuredClone(label) },
    ] }] };
    publicReadingLinks()(tree);
    assert.deepEqual(tree.children[0].children, [{ type: 'text', value: 'See ' }, ...label]);
    assert.ok(!JSON.stringify(tree).includes(url));
  }
});

test('private reference-style links are unwrapped, while public links and code stay intact', () => {
  const controls = [
    ...['https://example.com/book', '/book-notes/', '#chapter-2', 'mailto:reader@example.com']
      .map(url => ({ type: 'link', url, children: [{ type: 'text', value: 'Reference' }] })),
    { type: 'inlineCode', value: 'private://example' },
    { type: 'linkReference', identifier: 'public', referenceType: 'full', children: [{ type: 'text', value: 'Public' }] },
  ];
  const definition = { type: 'definition', identifier: 'public', url: 'https://example.com' };
  const tree = { type: 'root', children: [
    { type: 'paragraph', children: [...structuredClone(controls), { type: 'linkReference', identifier: 'note', referenceType: 'full', children: [{ type: 'text', value: 'II' }] }] },
    { type: 'definition', identifier: 'note', url: 'private://read/example#note' }, definition,
  ] };
  publicReadingLinks()(tree);
  assert.deepEqual(tree.children, [
    { type: 'paragraph', children: [...controls, { type: 'text', value: 'II' }] }, definition,
  ]);
});
