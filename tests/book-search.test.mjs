import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesBookSearch } from '../src/lib/book-search.mjs';

test('book search matches title and author words without case or accent sensitivity', () => {
  for (const [title, author, query, expected] of [
    ['Getting Real', '37 Signals', '  REAL  37 ', true],
    ['Getting Real', '37 Signals', '37signals', true],
    ['Four Thousand Weeks', 'Oliver Burkeman', 'burkeman four', true],
    ['A Book', 'José', 'JOSE', true],
    ['Getting Real', '37 Signals', 'real missing', false],
    ['Getting Real', '37 Signals', '   ', true],
    ['Getting Real', '37 Signals', '<script>', false],
  ]) {
    assert.equal(matchesBookSearch(title, author, query), expected, query);
  }
});
