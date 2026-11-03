import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const admin = readFileSync(new URL('../src/app/pages/admin.page.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.scss', import.meta.url), 'utf8');
const shell = readFileSync(new URL('../src/app/app.component.ts', import.meta.url), 'utf8');

test('admin navigation exposes labels and accessible mobile tabs', () => {
  assert.match(admin, /class="admin-mobile-heading"/);
  assert.match(admin, /class="admin-tab-list"/);
  for (const label of ['Overview','Bookings','Calendar','Services']) {
    assert.match(admin, new RegExp('>'+label+'<\\\\/span>'));
  }
  assert.match(admin, /\[attr\.aria-current\]/);
});

test('mobile admin layout never stretches the sidebar to fill the viewport', () => {
  const mobile=styles.slice(styles.indexOf('/* Owner workspace: phone-sized dashboard'));
  assert.match(mobile, /@media \(max-width: 720px\)/);
  assert.match(mobile, /\.admin-layout \{[^}]*display: flex;[^}]*flex-direction: column;[^}]*min-height: 0;/);
  assert.match(mobile, /\.admin-sidebar \{[^}]*background: #fff;/);
  assert.match(mobile, /\.admin-tab-list \{[^}]*grid-template-columns: repeat\(4,minmax\(0,1fr\)\)/);
});

test('calendar has an actionable empty state', () => {
  assert.match(admin, /No confirmed events yet/);
  assert.match(admin, /View booking requests/);
  assert.match(admin, /tab\.set\('bookings'\);load\(\)/);
});

test('admin workspace hides consumer mobile navigation and footer', () => {
  assert.match(shell, /\[class\.admin-shell\]="router\.url\.startsWith\('\/admin'\)"/);
  assert.match(shell, /\[class\.admin-route-hidden\]="router\.url\.startsWith\('\/admin'\)"/);
  assert.match(styles, /\.mobile-nav\.admin-route-hidden \{ display: none !important; \}/);
  assert.match(styles, /\.app-frame\.admin-shell \.site-footer \{ display: none; \}/);
});
