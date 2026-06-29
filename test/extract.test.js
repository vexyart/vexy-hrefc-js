// this_file: test/extract.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { extractMeta } from '../src/extract.js';

const doc = (html) => parseHTML('<!doctype html><html><head></head><body>' + html + '</body></html>').document;
const head = (html) => parseHTML('<!doctype html><html><head>' + html + '</head><body></body></html>').document;

test('prefers og:title, falls back to twitter:title then <title>', () => {
  assert.equal(extractMeta(head('<title>Plain</title><meta property="og:title" content="OG">'), 'https://e.com', {}).title, 'OG');
  assert.equal(extractMeta(head('<title>Plain</title><meta name="twitter:title" content="TW">'), 'https://e.com', {}).title, 'TW');
  assert.equal(extractMeta(head('<title>Plain</title>'), 'https://e.com', {}).title, 'Plain');
});

test('strips title suffix only when asked', () => {
  const d = head('<title>Page | My Site</title>');
  assert.equal(extractMeta(d, 'https://e.com', {}).title, 'Page | My Site');
  assert.equal(extractMeta(d, 'https://e.com', { stripTitleSuffix: true, titleSeparators: ['|'] }).title, 'Page');
});

test('description chain: og → twitter → meta description', () => {
  assert.equal(extractMeta(head('<meta property="og:description" content="OG desc"><meta name="description" content="meta">'), 'https://e.com', {}).description, 'OG desc');
  assert.equal(extractMeta(head('<meta name="twitter:description" content="TW desc">'), 'https://e.com', {}).description, 'TW desc');
  assert.equal(extractMeta(head('<meta name="description" content="meta desc">'), 'https://e.com', {}).description, 'meta desc');
});

test('description falls back to collapsed body text', () => {
  const d = doc('<p>  Hello   world   body text. </p>');
  assert.equal(extractMeta(d, 'https://e.com', {}).description, 'Hello world body text.');
});

test('body-text fallback respects max length and adds ellipsis', () => {
  const d = doc('<p>' + 'x'.repeat(500) + '</p>');
  const out = extractMeta(d, 'https://e.com', { descriptionMaxLength: 50 });
  assert.equal(out.description.length, 51);
  assert.ok(out.description.endsWith('…'));
});

test('description can be turned off', () => {
  const d = head('<meta name="description" content="x">');
  assert.equal(extractMeta(d, 'https://e.com', { description: false }).description, '');
});

test('thumbnail image resolved absolute, only when enabled', () => {
  const d = head('<meta property="og:image" content="/img/a.png">');
  assert.equal(extractMeta(d, 'https://e.com/page', {}).image, '');
  assert.equal(extractMeta(d, 'https://e.com/page', { thumbnail: true }).image, 'https://e.com/img/a.png');
});

test('favicon: largest declared icon, else /favicon.ico, only when enabled', () => {
  const d1 = head('<link rel="icon" href="/fav.png" sizes="32x32"><link rel="icon" href="/big.png" sizes="180x180">');
  assert.equal(extractMeta(d1, 'https://e.com', { favicon: true }).favicon, 'https://e.com/big.png');
  const d2 = head('<title>x</title>');
  assert.equal(extractMeta(d2, 'https://e.com', { favicon: true }).favicon, 'https://e.com/favicon.ico');
  assert.equal(extractMeta(d2, 'https://e.com', {}).favicon, '');
});
