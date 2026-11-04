import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/app/app.component.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.scss', import.meta.url), 'utf8');
const detail = readFileSync(new URL('../src/app/pages/detail.page.ts', import.meta.url), 'utf8');

test('Ionic document scroll lock is bypassed with an explicit native scroll host', () => {
  assert.match(app, /<ion-app>\s*<div #scrollHost class="site-scroll"/);
  assert.match(app, /class="app-frame"[\s\S]*<router-outlet>/);
  assert.match(app, /<\/footer>\s*<\/div>\s*<\/div>\s*<nav class="mobile-nav"/);
  assert.doesNotMatch(app, /<ion-content/);
});

test('the scroll host fills the viewport, scrolls by touch and still lets visitors pinch to zoom', () => {
  // "manipulation" (not "pan-y", which forbids pinching) keeps vertical scrolling and pinch/pan zoom, and keeps double-tap zoom off.
  assert.match(styles, /ion-app > \.site-scroll \{[^}]*position:\s*absolute;[^}]*inset:\s*0;[^}]*height:\s*100%;[^}]*overflow-y:\s*auto;[^}]*touch-action:\s*manipulation;/);
  assert.match(styles, /\.app-frame\{min-height:100%;/);
});

test('bottom navigation stays outside the scroll host', () => {
  const end = app.indexOf('</div>\n      <nav class="mobile-nav"');
  const nav = app.indexOf('<nav class="mobile-nav"');
  assert.ok(end > 0 && end < nav);
  assert.match(styles, /\.mobile-nav\{display:grid[^}]*position:fixed/);
});

test('router navigation resets the native scroll host', () => {
  assert.match(app, /@ViewChild\("scrollHost"\)/);
  assert.match(app, /NavigationEnd/);
  assert.match(app, /scrollHost\?\.nativeElement\.scrollTo\(0,\s*0\)/);
});

test('jumping-castles detail route uses the shared scroll host', () => {
  const routes = readFileSync(new URL('../src/app/app.routes.ts', import.meta.url), 'utf8');
  assert.match(routes, /path:\s*'services\/:slug'/);
  assert.match(detail, /class="container detail-page"/);
  assert.doesNotMatch(detail, /overflow:\s*hidden|height:\s*100vh/);
});
