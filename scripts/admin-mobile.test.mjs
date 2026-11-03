import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const admin = readFileSync(new URL('../src/app/pages/admin.page.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.scss', import.meta.url), 'utf8');
const shell = readFileSync(new URL('../src/app/app.component.ts', import.meta.url), 'utf8');
const phone = styles.slice(styles.indexOf('17. Phones (and narrow windows)'));

test('admin navigation exposes the labels from the design and accessible tabs', () => {
  assert.match(admin, /class="admin-tab-list"/);
  for (const label of ['Dashboard','Bookings','Calendar','Services','Settings']) {
    assert.ok(admin.includes('<span>'+label+'</span>'), `Missing admin tab: ${label}`);
  }
  assert.ok(admin.includes('<span>Logout</span>'));
  assert.match(admin, /\[attr\.aria-current\]/);
});

test('on a phone the admin sidebar becomes a fixed bottom tab bar, not a full-height column', () => {
  assert.ok(phone.includes('@media (max-width: 899px)'), 'the phone layout must live in the phone media query');
  assert.match(phone, /\.admin-layout\{display:block;/);
  assert.match(phone, /\.admin-sidebar\{position:fixed;left:0;right:0;bottom:0;/);
  assert.match(phone, /\.admin-tab-list\{flex-direction:row;/);
  assert.match(phone, /\.admin-topbar\{background:var\(--navy\)/);
});

test('the dashboard shows the stat tiles and upcoming bookings from the design', () => {
  for (const text of ['Total Bookings','Pending','Confirmed','Cancelled','Upcoming Bookings','>Calendar</h2>']) {
    assert.ok(admin.includes(text), `Missing dashboard text: ${text}`);
  }
  assert.match(admin, /<app-month-calendar/);
  assert.match(admin, /class="btn-view"/);
});

test('calendar has an actionable empty state', () => {
  assert.match(admin, /No bookings \{\{calSelected\(\)\?'on this day':'this month'\}\}/);
  assert.match(admin, /View booking requests/);
  assert.match(admin, /\(click\)="go\('bookings'\)"/);
});

test('admin workspace hides consumer navigation and footer', () => {
  assert.match(shell, /\[class\.admin-shell\]="isAdmin\(\)"/);
  assert.match(shell, /\[class\.admin-route-hidden\]="isAdmin\(\)"/);
  assert.match(styles, /\.mobile-nav\.flow-hidden,\.mobile-nav\.admin-route-hidden\{display:none!important\}/);
  assert.match(styles, /\.app-frame\.admin-shell \.site-header,\.app-frame\.admin-shell \.site-footer\{display:none\}/);
});

test('booking details open in an accessible dialog that Escape closes', () => {
  assert.match(admin, /role="dialog" aria-modal="true" aria-labelledby="dlg-title"/);
  assert.match(admin, /@HostListener\('document:keydown\.escape'\)/);
});

test('older API versions without the new dashboard data still work', () => {
  assert.match(admin, /e\.status!==404/);
  assert.match(admin, /stats\(\)!\.cancelled\?\?0/);
  assert.match(admin, /if\(s\.upcoming\)return s\.upcoming/);
});
