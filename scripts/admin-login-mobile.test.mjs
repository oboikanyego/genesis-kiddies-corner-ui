import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const css = read('../src/styles.scss');
const admin = read('../src/app/pages/admin.page.ts');
const index = read('../src/index.html');
const mobile = css.slice(css.indexOf('/* Owner login: mobile-first proportions'));

test('admin email and password fields are optimized for mobile and autocomplete', () => {
  assert.ok(admin.includes('autocomplete="username"'));
  assert.ok(admin.includes('autocomplete="current-password"'));
  assert.ok(admin.includes('inputmode="email"'));
  assert.ok(admin.includes('type="submit" class="btn btn-pink btn-full"'));
});

test('login inputs are at least 16px on iPhone Safari so focusing does not auto zoom', () => {
  assert.ok(mobile.includes('@media (max-width: 720px)'));
  assert.match(mobile, /\.admin-login \.form-field input \{[^}]*font-size: 16px;/);
  assert.match(mobile, /min-height: 50px/);
});

test('mobile card fits within narrow viewports without fixed-width overflow', () => {
  assert.match(mobile, /\.admin-login-wrap \{[^}]*width: 100%;[^}]*min-width: 0;/);
  assert.match(mobile, /\.admin-login \{[^}]*width: min\(100%, 420px\);[^}]*min-width: 0;/);
  assert.match(mobile, /@media \(max-width: 375px\)/);
});

test('normal user pinch zoom remains enabled', () => {
  assert.match(index, /width=device-width,initial-scale=1,viewport-fit=cover/);
  assert.ok(!index.includes('user-scalable=no'));
  assert.ok(!index.includes('maximum-scale=1'));
});

test('admin sign-in has an accessible Back to Home link before the login fields', () => {
  const login = admin.slice(admin.indexOf('@if(!loggedIn())'), admin.indexOf('}@else{'));
  assert.match(login, /<a routerLink="/" class="admin-login-back" aria-label="Back to home">/);
  assert.match(login, /<app-icon name="arrow-left"/);
  assert.ok(login.indexOf('class="admin-login-back"') < login.indexOf('name="email"'));
  assert.ok(css.includes('.admin-login-back:focus-visible'));
  assert.ok(css.includes('min-height:44px'));
});
