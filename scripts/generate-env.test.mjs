import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeApiUrl } from './generate-env.mjs';

test('normalizes production API URL', () => {
  assert.equal(normalizeApiUrl(' https://genesis-kiddies-corner-api.onrender.com/api/ '), 'https://genesis-kiddies-corner-api.onrender.com/api');
});

test('requires a build-time setting', () => {
  assert.throws(() => normalizeApiUrl(undefined), /Missing API_URL/);
  assert.throws(() => normalizeApiUrl(''), /Missing API_URL/);
});

test('rejects non-web URLs and non-absolute URLs', () => {
  assert.throws(() => normalizeApiUrl('file:///tmp/secrets'), /http\(s\)/);
  assert.throws(() => normalizeApiUrl('/api'), /absolute http\(s\)/);
});

test('rejects embedded credentials, query params and fragments', () => {
  assert.throws(() => normalizeApiUrl('https://user:pass@example.com/api'), /without credentials/);
  assert.throws(() => normalizeApiUrl('https://example.com/api?key=abc'), /without credentials/);
  assert.throws(() => normalizeApiUrl('https://example.com/api#x'), /without credentials/);
});
