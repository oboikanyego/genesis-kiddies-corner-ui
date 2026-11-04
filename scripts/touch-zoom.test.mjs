import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

// The bug this guards against: on an iPhone or iPad the owner sign-in (and the booking form) zoomed the page in when a text box
// was tapped and could not be zoomed back out.
//  1. iPhone/iPad Safari zoom into any text box whose text is smaller than 16px.
//  2. "touch-action: pan-y" on the scroll area forbids pinching, so once zoomed there was no way back.
const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const css = read('src/styles.scss');
const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

function sourceFiles(dir) {
  return readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap(entry => {
    const path = `${dir}${entry.name}`;
    if (entry.isDirectory()) return sourceFiles(`${path}/`);
    return /\.(ts|scss|css|html)$/.test(entry.name) ? [path] : [];
  });
}

// The last section of the stylesheet: the 16px rule for text boxes on touch screens.
const guardStart = css.indexOf('18. Text boxes on touch screens');
const guard = guardStart > 0 ? css.slice(guardStart).match(/@media\s+([^{]+)\{([\s\S]*)\}\s*$/) : null;

test('there is a rule that keeps every text box at 16px on touch screens', () => {
  assert.ok(guard, 'section "18. Text boxes on touch screens" with an @media block is missing from src/styles.scss');
  const [, condition, rules] = guard;
  assert.match(rules, /font-size:\s*16px\s*!important/);
  assert.match(rules, /\bselect\b/);
  assert.match(rules, /\btextarea\b/);
  assert.match(rules, /\binput:not\(/);
  // Tick boxes, radio buttons and the like are not text boxes and keep their own look.
  for (const type of ['checkbox', 'radio', 'hidden', 'file', 'submit', 'button']) assert.ok(rules.includes(`:not([type="${type}"])`), `${type} inputs should be left alone`);
  // Every kind of box you type or pick into is covered, so none of these may be excluded.
  for (const type of ['text', 'email', 'tel', 'password', 'search', 'number', 'date', 'url']) assert.ok(!rules.includes(`:not([type="${type}"])`), `${type} inputs must be covered`);
  assert.ok(condition.length > 0);
});

test('the 16px rule applies on every touch screen and on narrow windows, not only in the phone layout', () => {
  const [, condition] = guard;
  // A phone held sideways (about 812-932px) and an iPad (768px and wider) are wider than the 720px phone layout.
  assert.match(condition, /any-pointer:\s*coarse/);
  assert.match(condition, /max-width:\s*899px/);
});

test('owner sign-in boxes keep 16px text on a phone held sideways and on an iPad', () => {
  const [, condition, rules] = guard;
  // The sign-in boxes use the shared .form-field input style (12px on a computer). Only the 16px rule above makes them safe
  // wider than 720px, so it must apply to plain inputs of every type the sign-in uses.
  assert.match(css, /\.form-field input\{[^}]*font-size:12px/);
  assert.match(condition, /any-pointer:\s*coarse/);
  assert.ok(!rules.includes(':not([type="email"])') && !rules.includes(':not([type="password"])'));
  assert.match(read('src/app/pages/admin.page.ts'), /<input name="email"[^>]*type="email"/);
  assert.match(read('src/app/pages/admin.page.ts'), /<input name="password"[^>]*type="password"/);
});

test('no other style forces a text box smaller than the 16px rule, which would undo it', () => {
  const blocks = [...withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(match => ({ selector: match[1].trim(), body: match[2] }));
  const forced = blocks.filter(block => /\b(input|select|textarea)\b/.test(block.selector) && /\bfont(-size)?\s*:[^;}]*!important/.test(block.body));
  assert.equal(forced.length, 1, `only the 16px rule may use !important for text box sizes, found: ${forced.map(block => block.selector).join(' | ')}`);
  assert.match(forced[0].selector, /textarea/);
  assert.match(forced[0].body, /font-size:\s*16px\s*!important/);
});

test('pinch zoom is never blocked: every touch-action allows it', () => {
  const found = [];
  for (const file of ['src/styles.scss', ...sourceFiles('src/app/')]) {
    for (const match of read(file).matchAll(/touch-action\s*:\s*([^;}"'`]+)/g)) found.push({ file, value: match[1].trim().replace(/\s*!important$/, '') });
  }
  assert.ok(found.length >= 2, 'expected touch-action on the page and on the scroll area');
  for (const { file, value } of found) {
    const words = value.split(/\s+/);
    assert.ok(words.includes('auto') || words.includes('manipulation') || words.includes('pinch-zoom'), `${file}: "touch-action: ${value}" stops visitors pinching to zoom (use manipulation)`);
  }
});

test('the page and the scroll area use manipulation: scroll, pinch and pan work, double-tap zoom stays off', () => {
  assert.match(css, /html\{touch-action:manipulation\}/);
  assert.match(css, /ion-app > \.site-scroll \{[^}]*touch-action:\s*manipulation;/);
  assert.doesNotMatch(css, /touch-action:\s*pan-y\s*;/);
});
