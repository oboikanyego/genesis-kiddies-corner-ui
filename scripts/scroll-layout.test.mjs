import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = readFileSync(new URL('../src/app/app.component.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.scss', import.meta.url), 'utf8');

test('Ionic root uses a scrollable ion-content inside ion-app', () => {
  assert.match(root, /<ion-app>\s*<ion-content[^>]*\[scrollY\]="true"/);
  assert.match(root, /<ion-content[\s\S]*class="app-frame"[\s\S]*<router-outlet>/);
  assert.match(root, /<\/footer>\s*<\/div>\s*<\/ion-content>/);
});

test('mobile navigation is outside the scrolling area, within ion-app', () => {
  const close = root.indexOf('</ion-content>');
  const nav = root.indexOf('<nav class="mobile-nav"');
  const app = root.indexOf('</ion-app>');
  assert.ok(close > 0 && close < nav && nav < app);
  assert.match(styles, /\.mobile-nav\{display:grid[^}]*position:fixed/);
});

test('app frame no longer forces a viewport-height document scroll inside ion-app', () => {
  assert.match(styles, /\.app-frame\{min-height:100%;/);
  assert.doesNotMatch(styles, /\.app-frame\{min-height:100vh;/);
});

test('Angular route changes reset the Ionic content scroll position', () => {
  assert.match(root, /NavigationEnd/);
  assert.match(root, /this\.content\?\.scrollToTop\(0\)/);
});
