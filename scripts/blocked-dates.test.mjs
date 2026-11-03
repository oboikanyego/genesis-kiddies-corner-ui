import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const page = readFileSync(new URL('../src/app/pages/admin.page.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.scss', import.meta.url), 'utf8');

test('admin services use an accessible native date picker instead of comma separated text', () => {
  assert.doesNotMatch(page, /Blocked dates \(comma separated\)/);
  assert.match(page, /class="blocked-date-picker" type="date"/);
  assert.match(page, /\[id\]="'blocked-date-'\+item\._id"/);
  assert.match(page, /addBlockedDate\(item\)/);
});

test('multiple blocked dates display as removable chips', () => {
  assert.match(page, /@for\(blockedDate of item\.blockedDates; track blockedDate\)/);
  assert.match(page, /removeBlockedDate\(item,blockedDate\)/);
  assert.match(page, /item\.blockedDates = \[\.\.\.item\.blockedDates, date\]\.sort\(\)/);
  assert.match(page, /item\.blockedDates = item\.blockedDates\.filter/);
  assert.match(page, /item\.blockedDates\.includes\(date\)/);
});

test('blocked date limits and save are retained', () => {
  assert.match(page, /item\.blockedDates\.length >= 100/);
  assert.match(page, /saveService\(item\)/);
  assert.match(page, /Save changes/);
  assert.match(styles, /@media \(max-width: 720px\)[\s\S]*\.blocked-date-controls/);
});
