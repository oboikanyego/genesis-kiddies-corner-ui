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
  assert.ok(logo.includes('api.brandLogoUrl()'),'visible logo must load from MongoDB API');
  assert.ok(!logo.includes('srcset='),'logo source must not silently switch to static assets');
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
  assert.ok(admin.includes('[src]="brandLogoUrl"'),'login logo must use MongoDB endpoint');
});

/** The pixel size of a WebP file (reads the VP8X, VP8 and VP8L layouts). */
function webpSize(buf) {
  assert.equal(buf.toString('latin1', 0, 4), 'RIFF');
  assert.equal(buf.toString('latin1', 8, 12), 'WEBP');
  const kind = buf.toString('latin1', 12, 16);
  if (kind === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
  if (kind === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  if (kind === 'VP8L') { const bits = buf.readUInt32LE(21); return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) }; }
  throw new Error('unknown WebP layout ' + kind);
}

test('the logo files, the srcset and the width/height attributes all agree, so the page does not jump and the logo is never stretched', () => {
  const md = webpSize(readFileSync(new URL('src/assets/images/brand/logo-md.webp', root)));
  const lg = webpSize(readFileSync(new URL('src/assets/images/brand/logo-lg.webp', root)));
  assert.deepEqual(lg, { width: md.width * 2, height: md.height * 2 }, 'the large logo should be exactly twice the medium one');
  const logo = read('src/app/components/logo.component.ts');
  assert.ok(logo.includes(`width="${md.width}" height="${md.height}"`), `the <img> should say width="${md.width}" height="${md.height}"`);
  assert.ok(logo.includes("'/branding/logo'"),'app logo must be fetched from the backend');
});

test('the header is tall enough for the logo with a little room above and below', () => {
  const css = read('src/styles.scss');
  const header = Number(/--header-h:\s*(\d+)px/.exec(css)?.[1]);
  const logo = Number(/\.logo\{[^}]*height:(\d+)px/.exec(css)?.[1]);
  assert.ok(header > 0 && logo > 0, 'could not read the header and logo heights');
  assert.ok(header - logo >= 8, `header ${header}px is too tight for a ${logo}px logo`);
});
