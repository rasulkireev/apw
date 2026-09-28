import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { changedUrls, validateManifest, submit } from '../scripts/indexnow.mjs';
const config = JSON.parse(await readFile(new URL('../scripts/indexnow-config.json', import.meta.url)));
const url = name => `${config.origin}/${name}`;
const manifest = pages => ({ version: 1, revision: 'abc', pages });
const hash = 'a'.repeat(64);

test('includes additions, changes and deletions but not unchanged URLs', () => {
  assert.deepEqual(changedUrls(manifest({ [url('old')]: hash, [url('same')]: hash, [url('changed')]: hash }),
    manifest({ [url('new')]: hash, [url('same')]: hash, [url('changed')]: 'b'.repeat(64) })),
    [url('changed'), url('new'), url('old')]);
});
test('rejects foreign hosts and malformed hashes', () => {
  assert.throws(() => validateManifest(manifest({ 'https://example.com/': hash })));
  assert.throws(() => validateManifest(manifest({ [url('')]: 'bad' })));
});
test('waits for revision, verifies key, preserves state on failure, then saves accepted submission', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'indexnow-'));
  try {
    const previousPath = join(dir, 'state.json');
    const current = manifest({ [url('')]: hash });
    let polls = 0, status = 429, posts = 0;
    const fetchFn = async (target, options) => {
      if (target.includes('indexnow-manifest')) return Response.json({ ...current, revision: ++polls === 1 ? 'old' : 'abc' });
      if (target.endsWith('.txt')) return new Response(config.key);
      posts++;
      assert.deepEqual(JSON.parse(options.body).urlList, [url('')]);
      return new Response('', { status });
    };
    const opts = { fetchFn, sleep: async () => {}, revision: 'abc', previousPath };
    await assert.rejects(submit(opts), /429/);
    await assert.rejects(readFile(previousPath), { code: 'ENOENT' });
    status = 202;
    await submit(opts);
    assert.deepEqual(JSON.parse(await readFile(previousPath)), current);
    await submit(opts);
    assert.equal(posts, 2); // Successful state prevents duplicate submissions.
  } finally { await rm(dir, { recursive: true, force: true }); }
});
test('does not submit when live key differs', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'indexnow-key-'));
  try {
    await assert.rejects(submit({ revision: 'abc', previousPath: join(dir, 'state.json'),
      fetchFn: async target => target.includes('manifest') ? Response.json(manifest({ [url('')]: hash })) : new Response('wrong'),
    }), /key verification failed/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
