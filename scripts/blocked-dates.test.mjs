import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const page = readFileSync(new URL('../src/app/pages/admin.page.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.scss', import.meta.url), 'utf8');

test('blocked dates are selected by calendar icon button, never typed', () => {
  assert.doesNotMatch(page, /Blocked dates \\(comma separated\\)|type="date"/);
  assert.match(page, /class="blocked-date-trigger"/);
  assert.match(page, /openBlockedDateCalendar\\(item\\)/);
  assert.match(page, /Open blocked dates calendar/);
});
test('Ionic calendar picker disables past and previously blocked dates', () => {
  assert.match(page, /<ion-modal class="blocked-date-calendar-modal"/);
  assert.match(page, /<ion-datetime class="blocked-date-calendar"/);
  assert.match(page, /\\[min\\]="todayIsoLocal\\(\\)"/);
  assert.match(page, /\\[isDateEnabled\\]="isBlockedDateEnabled"/);
  assert.match(page, /day >= this\\.todayIsoLocal\\(\\) && !item\\.blockedDates\\.includes\\(day\\)/);
  assert.match(page, /\\(ionChange\\)="onBlockedDatePicked/);
});
test('dates remain removable, capped at 100 and saved through the existing API', () => {
  assert.match(page, /item\\.blockedDates = \\[\\.\\.\\.item\\.blockedDates, date\\]\\.sort\\(\\)/);
  assert.match(page, /item\\.blockedDates = item\\.blockedDates\\.filter/);
  assert.match(page, /item\\.blockedDates\\.length >= 100/);
  assert.match(page, /saveService\\(item\\)/);
  assert.match(styles, /ion-modal\\.blocked-date-calendar-modal/);
});
