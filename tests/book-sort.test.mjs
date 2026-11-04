import test from 'node:test';
import assert from 'node:assert/strict';
import { compareBooks } from '../src/lib/book-sort.mjs';

test('book order keeps rating/date priorities and resolves ties independently of collection order', () => {
  const books = [
    { slug: 'z', title: 'Same', author: 'Zed', rating: 8.5, dateRead: '2020-01-01' },
    { slug: 'a', title: 'Same', author: 'Amy', rating: 8.5, dateRead: '2020-01-01' },
    { slug: 'b', title: 'Same', author: 'Amy', rating: 8.5, dateRead: '2020-01-01' },
    { slug: 'new', title: 'Alpha', author: 'Amy', rating: 8, dateRead: '2021-01-01' },
  ];
  for (const [option, expected] of [
    ['rating-desc', ['a', 'b', 'z', 'new']],
    ['rating-asc', ['new', 'a', 'b', 'z']],
    ['date-desc', ['new', 'a', 'b', 'z']],
    ['date-asc', ['a', 'b', 'z', 'new']],
    ['unknown', ['a', 'b', 'z', 'new']],
  ]) {
    // All rotations in either direction model nondeterministic collection loads.
    for (const input of [books, [...books].reverse()]) {
      for (let i = 0; i < input.length; i++) {
        const shuffled = [...input.slice(i), ...input.slice(0, i)];
        assert.deepEqual(shuffled.sort((a, b) => compareBooks(a, b, option)).map(b => b.slug), expected, option);
      }
    }
  }
});
