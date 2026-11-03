import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { IconComponent } from './icon.component';
import { Booking } from '../core/models';
import { MONTH_NAMES, todayIso } from '../core/format';

interface Cell { date: string; day: number; other: boolean; today: boolean; items: Booking[]; tone: string; label: string; }

/** A month grid (Sun-Sat). Days with bookings get a coloured dot; days outside the month are greyed out. */
@Component({
  selector: 'app-month-calendar',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="cal">
    <div class="cal-head">
      <button type="button" (click)="prev.emit()" aria-label="Previous month"><app-icon name="chevron-left" [size]="22" [stroke]="2.4"/></button>
      <strong aria-live="polite">{{title}}</strong>
      <button type="button" (click)="next.emit()" aria-label="Next month"><app-icon name="chevron-right" [size]="22" [stroke]="2.4"/></button>
    </div>
    <div class="cal-grid">
      @for (d of weekdays; track d) { <span class="cal-dow">{{d}}</span> }
      @for (c of cells; track c.date) {
        <button type="button" class="cal-day" [class.other]="c.other" [class.today]="c.today" [class.selected]="c.date === selected" [class.has]="c.items.length > 0" [disabled]="c.other" [attr.aria-label]="c.label" [attr.aria-pressed]="c.date === selected" (click)="pick.emit(c.date)">
          <span>{{c.day}}</span>
          @if (c.items.length) { <i class="dot dot-{{c.tone}}"></i> }
        </button>
      }
    </div>
  </div>`
})
export class MonthCalendarComponent implements OnChanges {
  /** YYYY-MM */
  @Input() month = todayIso().slice(0, 7);
  @Input() items: Booking[] = [];
  @Input() selected: string | null = null;
  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() pick = new EventEmitter<string>();
  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  title = '';
  cells: Cell[] = [];

  ngOnChanges(): void {
    const [y, m] = this.month.split('-').map(Number);
    this.title = `${MONTH_NAMES[m - 1]} ${y}`;
    const offset = new Date(y, m - 1, 1).getDay();
    const daysInMonth = new Date(y, m, 0).getDate();
    const prevDays = new Date(y, m - 1, 0).getDate();
    const total = Math.ceil((offset + daysInMonth) / 7) * 7;
    const today = todayIso();
    const byDate = new Map<string, Booking[]>();
    for (const b of this.items) byDate.set(b.event.date, [...(byDate.get(b.event.date) ?? []), b]);
    const pad = (n: number) => String(n).padStart(2, '0');
    this.cells = Array.from({ length: total }, (_, i) => {
      const n = i - offset + 1;
      const other = n < 1 || n > daysInMonth;
      const day = n < 1 ? prevDays + n : n > daysInMonth ? n - daysInMonth : n;
      const monthIndex = n < 1 ? m - 2 : n > daysInMonth ? m : m - 1;
      const d = new Date(y, monthIndex, day);
      const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const items = other ? [] : byDate.get(date) ?? [];
      const tone = items.some(b => b.status === 'pending') ? 'pending' : items.some(b => b.status === 'confirmed') ? 'confirmed' : items[0]?.status ?? '';
      const count = items.length ? `, ${items.length} booking${items.length === 1 ? '' : 's'}` : '';
      return { date, day, other, today: date === today, items, tone, label: `${day} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}${count}` };
    });
  }
}
