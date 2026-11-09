import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {blockedMonthGrid,shiftBlockedMonth,makeBlockedDateFilter} from '../src/app/core/blocked-date-filter.ts';

const page=readFileSync(new URL('../src/app/pages/admin.page.ts',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles.scss',import.meta.url),'utf8');

test('the blocked-date button can expand a native inline calendar for a service',()=>{
  assert.ok(page.includes('class="blocked-date-trigger"'));
  assert.ok(page.includes('(click)="openBlockedDateCalendar(item)"'));
  assert.ok(page.includes('[attr.aria-expanded]="activeBlockedService()?._id===item._id"'));
  assert.ok(page.includes('@if(activeBlockedService()?._id === item._id)'));
  assert.ok(page.includes('class="blocked-calendar-panel"'));
  assert.ok(!page.includes('ion-modal class="blocked-date-calendar-modal"'),'no inaccessible Ionic overlay');
  assert.ok(!page.includes('ion-datetime'),'native day buttons instead of an Ionic picker');
  assert.ok(!page.includes('[disabled]="item.blockedDates.length >= 100"'),'trigger never disabled at 100 dates');
  assert.ok(css.includes('.blocked-calendar-panel'));
  assert.ok(css.includes('touch-action:manipulation'));
});
test('day buttons navigate months and select dates by real click',()=>{
  assert.ok(page.includes('(click)="moveBlockedMonth(-1)"'));
  assert.ok(page.includes('(click)="moveBlockedMonth(1)"'));
  assert.ok(page.includes('(click)="onBlockedDatePicked(day.date)"'));
  assert.ok(page.includes('[disabled]="!isBlockedDateEnabled(day.date)||item.blockedDates.length>=100"'));
  assert.ok(page.includes('this.activeBlockedService.set(item)'));
  assert.ok(page.includes('item.blockedDates = [...item.blockedDates, date].sort()'));
  assert.ok(page.includes('item.blockedDates = item.blockedDates.filter'));
  assert.ok(page.includes('saveService(item)'),'owner must still save service to persist');
  assert.ok(page.includes('(click)="closeBlockedDateCalendar()"'));
});
test('month grid is Monday-first, includes leap days and complete weeks',()=>{
  const nov=blockedMonthGrid('2026-11');
  assert.equal(nov.length,42);
  assert.equal(nov.filter(Boolean).length,30);
  assert.deepEqual(nov.slice(0,6),[null,null,null,null,null,null]);
  assert.deepEqual(nov[6],{day:1,date:'2026-11-01'});
  assert.ok(nov.some(d=>d?.date==='2026-11-30'));
  assert.equal(blockedMonthGrid('2028-02').filter(Boolean).length,29);
  assert.deepEqual(blockedMonthGrid('2026-13'),[]);
  assert.equal(shiftBlockedMonth('2026-12',1),'2027-01');
  assert.equal(shiftBlockedMonth('2027-01',-1),'2026-12');
});
test('past dates and already-blocked days are disabled while upcoming days work',()=>{
  const filter=makeBlockedDateFilter('2026-11-09',['2026-11-12']);
  assert.equal(filter('2026-11-08'),false);
  assert.equal(filter('2026-11-09'),true);
  assert.equal(filter('2026-11-10T12:00:00'),true);
  assert.equal(filter('2026-11-12'),false);
  assert.equal(filter('2026-11-13'),true);
  assert.equal(filter(''),false);
  const other=makeBlockedDateFilter('2026-11-09',['2026-11-13']);
  assert.equal(other('2026-11-12'),true,'new service can select the day');
});
