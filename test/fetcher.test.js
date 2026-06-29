// this_file: test/fetcher.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DOMParser } from 'linkedom';
import { resolveConfig } from '../src/config.js';
import { createFetcher } from '../src/fetcher.js';

// extract() uses DOMParser, which the browser provides. Polyfill it for Node.
globalThis.DOMParser = DOMParser;

const HTML = '<html><head><meta property="og:title" content="Hi"><meta property="og:description" content="There"></head><body></body></html>';

test('caches and de-dupes: one fetch for concurrent + repeat calls', async () => {
  let calls = 0;
  const proxy = async () => {
    calls++;
    await new Promise((r) => setTimeout(r, 10));
    return HTML;
  };
  const f = createFetcher(resolveConfig({ fetch: { proxies: [proxy] } }));
  const [a, b] = await Promise.all([f.getData('https://x.com/a'), f.getData('https://x.com/a')]);
  assert.equal(a.title, 'Hi');
  assert.equal(b.title, 'Hi');
  assert.equal(calls, 1); // in-flight de-dupe
  await f.getData('https://x.com/a'); // cache hit
  assert.equal(calls, 1);
});

test('falls through the proxy chain on failure', async () => {
  const bad = async () => {
    throw new Error('nope');
  };
  const good = async () => HTML;
  const f = createFetcher(resolveConfig({ fetch: { proxies: [bad, good] } }));
  const data = await f.getData('https://y.com');
  assert.equal(data.title, 'Hi');
});

test('resolves built-in proxy names to functions', () => {
  const f = createFetcher(resolveConfig({ fetch: { proxies: ['jina', 'allorigins'] } }));
  assert.equal(typeof f.getData, 'function'); // no throw building the chain
});

test('timeout aborts a hanging proxy', async () => {
  const hang = (_url, signal) =>
    new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')));
    });
  const f = createFetcher(resolveConfig({ fetch: { proxies: [hang], timeout: 30 } }));
  await assert.rejects(() => f.getData('https://z.com'));
});

test('rejects when a page has nothing worth showing', async () => {
  const empty = async () => '<html><head></head><body></body></html>';
  const f = createFetcher(resolveConfig({ fetch: { proxies: [empty] } }));
  await assert.rejects(() => f.getData('https://blank.com'));
});
