// this_file: test/config.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveConfig, mergeConfig, defaults } from '../src/config.js';

test('defaults: title and description on, thumbnail and favicon off', () => {
  assert.equal(defaults.content.title, true);
  assert.equal(defaults.content.description, true);
  assert.equal(defaults.content.thumbnail, false);
  assert.equal(defaults.content.favicon, false);
  assert.equal(defaults.content.cta, null); // CTA off by default
});

test('defaults: arrow on, placement auto (prefers above)', () => {
  assert.equal(defaults.popup.arrow, true);
  assert.equal(defaults.popup.placement, 'auto');
});

test('deep-merges nested objects, leaves siblings intact', () => {
  const c = resolveConfig({ content: { thumbnail: true } });
  assert.equal(c.content.thumbnail, true);
  assert.equal(c.content.title, true); // untouched default
  assert.equal(c.content.descriptionMaxLength, 350);
});

test('arrays replace, not merge', () => {
  const c = resolveConfig({ thumbnail: { providers: ['mshots'] } });
  assert.deepEqual(c.thumbnail.providers, ['mshots']);
});

test('selector and class overrides pass through', () => {
  const c = resolveConfig({ selector: 'a.preview', classes: { title: 'x-title' } });
  assert.equal(c.selector, 'a.preview');
  assert.equal(c.classes.title, 'x-title');
});

test('does not mutate defaults', () => {
  resolveConfig({ content: { title: false }, popup: { theme: 'dark' } });
  assert.equal(defaults.content.title, true);
  assert.equal(defaults.popup.theme, 'auto');
});

test('mergeConfig handles undefined override', () => {
  assert.equal(mergeConfig(defaults, undefined), defaults);
});
