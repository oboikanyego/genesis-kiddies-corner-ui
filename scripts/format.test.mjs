import test from 'node:test';
import assert from 'node:assert/strict';
// format.ts is TypeScript; Node runs it directly from 22.18 (older Node skips this file instead of failing).
const supported = Boolean(process.features?.typescript);
const { formatDate, formatMoney, formatTimeRange, formatWhen, isUpcoming, priceLine, statusLabel, todayIso } = supported ? await import('../src/app/core/format.ts') : {};
const check = (name, fn) => test(name, supported ? {} : { skip: 'needs Node 22.18+ (built-in TypeScript support)' }, fn);

check('money is shown with comma thousands, as in the design', () => {
  assert.equal(formatMoney(1500), 'R1,500');
  assert.equal(formatMoney(3700), 'R3,700');
  assert.equal(formatMoney(800), 'R800');
  assert.equal(formatMoney(1299.5), 'R1,299.50');
});

check('dates read like "15 Nov 2026", whatever the browser language', () => {
  assert.equal(formatDate('2026-11-15'), '15 Nov 2026');
  assert.equal(formatDate('2026-09-05'), '5 Sep 2026');
  assert.equal(formatDate('2027-01-20'), '20 Jan 2027');
  assert.equal(formatDate(''), '');
  assert.equal(formatDate(undefined), '');
  assert.equal(formatDate('not a date'), '');
});

check('times and the "when" line match the cart and bookings screens', () => {
  assert.equal(formatTimeRange('10:00', '16:00'), '10:00 - 16:00');
  assert.equal(formatWhen({ date: '2026-11-15', startTime: '10:00', endTime: '16:00' }), '15 Nov 2026 · 10:00 - 16:00');
});

check('price lines', () => {
  assert.equal(priceLine(1500, 'day'), 'From R1,500 per day');
  assert.equal(priceLine(1200, 'event'), 'From R1,200 per event');
  assert.equal(priceLine(null, 'event'), 'Price on request');
});

check('today is the local calendar date, and upcoming/past split on it', () => {
  assert.equal(todayIso(new Date(2026, 10, 15, 23, 59)), '2026-11-15');
  assert.equal(todayIso(new Date(2026, 0, 5, 0, 1)), '2026-01-05');
  assert.equal(isUpcoming({ event: { date: '2026-11-15' } }, '2026-11-15'), true);
  assert.equal(isUpcoming({ event: { date: '2026-11-14' } }, '2026-11-15'), false);
});

check('status labels', () => {
  assert.equal(statusLabel('pending'), 'Pending');
  assert.equal(statusLabel('cancelled'), 'Cancelled');
});
