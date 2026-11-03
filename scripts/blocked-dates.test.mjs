import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const page = readFileSync(new URL('../src/app/pages/admin.page.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.scss', import.meta.url), 'utf8');

test('blocked dates are opened through a calendar icon button, not entered as text', () => {
  assert.ok(!page.includes('Blocked dates (comma separated)'));
  assert.ok(!page.includes('type="date"'));
  assert.ok(page.includes('class="blocked-date-trigger"'));
  assert.ok(page.includes('openBlockedDateCalendar(item)'));
  assert.ok(page.includes('Open blocked dates calendar'));
});
test('Ionic calendar disables past and already blocked days', () => {
  assert.ok(page.includes('<ion-modal class="blocked-date-calendar-modal"'));
  assert.ok(page.includes('<ion-datetime class="blocked-date-calendar"'));
  assert.ok(page.includes('[min]="todayIsoLocal()"'));
  assert.ok(page.includes('[isDateEnabled]="isBlockedDateEnabled"'));
  assert.ok(page.includes('day >= this.todayIsoLocal() && !item.blockedDates.includes(day)'));
  assert.ok(page.includes('(ionChange)="onBlockedDatePicked($event.detail.value)"'));
});
test('selected dates are removable and the existing save/100-date limit remain', () => {
  assert.ok(page.includes('item.blockedDates = [...item.blockedDates, date].sort()'));
  assert.ok(page.includes('item.blockedDates = item.blockedDates.filter'));
  assert.ok(page.includes('item.blockedDates.length >= 100'));
  assert.ok(page.includes('saveService(item)'));
  assert.ok(styles.includes('ion-modal.blocked-date-calendar-modal'));
});
