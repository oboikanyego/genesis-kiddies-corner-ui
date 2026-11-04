import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const exists = path => existsSync(new URL(path, root));
const kb = path => statSync(new URL(path, root)).size / 1024;

test('the logo and icon files exist and stay light', () => {
  for (const [file, limit] of [
    ['src/assets/images/brand/logo-md.webp', 40], ['src/assets/images/brand/logo-lg.webp', 90], ['src/assets/images/brand/icon-120.webp', 30],
    ['src/assets/images/brand/favicon-64.png', 30], ['src/assets/images/brand/icon-192.png', 100], ['src/assets/images/brand/icon-512.png', 400],
    ['public/favicon.ico', 50], ['public/apple-touch-icon.png', 60]
  ]) {
    assert.ok(exists(file), `missing ${file}`);
    assert.ok(kb(file) < limit, `${file} is ${Math.round(kb(file))} KB (limit ${limit} KB)`);
  }
});

test('the page declares the favicon, the iPhone icon and the app manifest', () => {
  const html = read('src/index.html');
  for (const needle of ['href="/favicon.ico"', 'href="/assets/images/brand/favicon-64.png"', 'rel="apple-touch-icon" href="/apple-touch-icon.png"', 'rel="manifest" href="/manifest.webmanifest"']) {
    assert.ok(html.includes(needle), `index.html is missing ${needle}`);
  }
});

test('the iPhone home-screen icon is opaque and 180 x 180 (iPhones turn transparency black)', () => {
  const png = readFileSync(new URL('public/apple-touch-icon.png', root));
  assert.equal(png.toString('latin1', 1, 4), 'PNG');
  assert.equal(png.readUInt32BE(16), 180);
  assert.equal(png.readUInt32BE(20), 180);
  assert.equal(png[25], 2, 'colour type 2 means RGB without a transparency channel');
});

test('the app manifest is valid and every icon it lists exists', () => {
  const manifest = JSON.parse(read('public/manifest.webmanifest'));
  assert.equal(manifest.name, 'The Genesis Kiddies Corner');
  assert.equal(manifest.start_url, '/');
  assert.ok(manifest.icons.length >= 2);
  for (const icon of manifest.icons) assert.ok(exists('src' + icon.src), `missing ${icon.src}`);
});

test('the logo component shows the supplied logo with a text alternative; the old drawn logo and its font are gone', () => {
  const logo = read('src/app/components/logo.component.ts');
  assert.ok(logo.includes('/assets/images/brand/logo-md.webp') && logo.includes('/assets/images/brand/logo-lg.webp'));
  assert.ok(logo.includes('alt="The Genesis Kiddies Corner"'));
  assert.ok(!logo.includes('<svg'));
  assert.ok(!read('src/index.html').includes('Fredoka'));
  assert.ok(!read('src/styles.scss').includes('logo-main'));
});

test('the logo is used in the header, on the phone homepage and in the owner sidebar; the sign-in card uses the brand icon', () => {
  assert.ok(read('src/app/app.component.ts').includes('<app-logo/>'));
  assert.ok(read('src/app/pages/home.page.ts').includes('<app-logo [large]="true"/>'));
  const admin = read('src/app/pages/admin.page.ts');
  assert.ok(admin.includes('<app-logo [large]="true"/>'));
  assert.ok(admin.includes('/assets/images/brand/icon-120.webp'));
});
