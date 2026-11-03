import type { Booking, EventDraft } from './models';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** R1,500 (comma thousands, as in the design). */
export function formatMoney(amount: number): string {
  return 'R' + amount.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2 });
}

/** "2026-11-15" -> "15 Nov 2026". Done by hand so every browser prints the same short month. */
export function formatDate(iso: string | undefined | null): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '');
  if (!match) return '';
  return `${Number(match[3])} ${MONTHS[Number(match[2]) - 1]} ${match[1]}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${start} - ${end}`;
}

/** "15 Nov 2026 · 10:00 - 16:00" */
export function formatWhen(event: Pick<EventDraft, 'date' | 'startTime' | 'endTime'>): string {
  return `${formatDate(event.date)} · ${formatTimeRange(event.startTime, event.endTime)}`;
}

/** Local calendar date as YYYY-MM-DD (not UTC, so "today" is right late in the evening in South Africa). */
export function todayIso(now = new Date()): string {
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
}

export function isUpcoming(booking: Pick<Booking, 'event'>, today = todayIso()): boolean {
  return booking.event.date >= today;
}

export function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/** "R1,500 per day" style price line; null price means the owner has not set one. */
export function priceLine(price: number | null, unit: string): string {
  return price === null ? 'Price on request' : `From ${formatMoney(price)} per ${unit}`;
}
