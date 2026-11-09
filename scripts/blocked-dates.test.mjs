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
  assert.ok(page.includes('[isDateEnabled]="blockedDateFilter()"'));
  assert.ok(page.includes('@if(activeBlockedService()){'));
  assert.ok(page.includes('this.blockedDateFilter.set(makeBlockedDateFilter(this.todayIsoLocal(), item.blockedDates ?? []))'));
  assert.ok(page.includes('day >= this.todayIsoLocal() && !item.blockedDates.includes(day)'));
  assert.ok(page.includes('(ionChange)="onBlockedDatePicked($event.detail.value)"'));
});
test('selected dates are removable and the existing save/100-date limit remain', () => {
  assert.ok(page.includes('item.blockedDates = [...item.blockedDates, date].sort()'));
  assert.ok(page.includes('item.blockedDates = item.blockedDates.filter'));
  assert.ok(page.includes('item.blockedDates.length >= 100'));
  assert.ok(!page.includes('[disabled]="item.blockedDates.length >= 100"'), 'calendar button should remain clickable even when service has 100 blocked dates');
  assert.ok(page.includes('saveService(item)'));
  assert.ok(styles.includes('ion-modal.blocked-date-calendar-modal'));
});

test('selected service filter enables today and future days while excluding blocked days', async()=>{
 const { makeBlockedDateFilter }=await import('../src/app/core/blocked-date-filter.ts');
 const filter=makeBlockedDateFilter('2026-11-09',['2026-11-12']);
 assert.equal(filter('2026-11-08'),false,'past date');
 assert.equal(filter('2026-11-09'),true,'today');
 assert.equal(filter('2026-11-10T12:00:00'),true,'future date with timestamp');
 assert.equal(filter('2026-11-12'),false,'blocked date');
 assert.equal(filter('2026-11-13'),true,'day after blocked date');
 assert.equal(filter(''),false,'invalid date');
});
test('filter starts fresh for each service rather than permanently disabling all dates', async()=>{
 const { makeBlockedDateFilter }=await import('../src/app/core/blocked-date-filter.ts');
 const first=makeBlockedDateFilter('2026-11-09',['2026-11-12']);
 const second=makeBlockedDateFilter('2026-11-09',['2026-11-13']);
 assert.equal(first('2026-11-12'),false);
 assert.equal(second('2026-11-12'),true);
});
