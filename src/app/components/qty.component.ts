import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from './icon.component';

/** "- 20 +" stepper. Works on its own ([value]/(valueChange)) or inside a reactive form (formControlName). */
@Component({
  selector: 'app-qty',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => QtyComponent), multi: true }],
  template: `<div class="qty" [class.qty-compact]="compact">
    <button type="button" (click)="change(-step)" [disabled]="disabled || value <= min" [attr.aria-label]="'Decrease ' + label"><app-icon name="minus" [size]="16" [stroke]="2.4"/></button>
    @if (editable) {
      <input type="number" inputmode="numeric" [value]="value" [min]="min" [max]="max" (input)="typed($event)" (blur)="touch()" [attr.aria-label]="label" [disabled]="disabled"/>
    } @else {
      <span aria-live="polite" [attr.aria-label]="label + ' ' + value">{{ value }}</span>
    }
    <button type="button" (click)="change(step)" [disabled]="disabled || value >= max" [attr.aria-label]="'Increase ' + label"><app-icon name="plus" [size]="16" [stroke]="2.4"/></button>
  </div>`
})
export class QtyComponent implements ControlValueAccessor {
  private cd = inject(ChangeDetectorRef);
  @Input() value = 1;
  @Input() min = 1;
  @Input() max = 999;
  @Input() step = 1;
  @Input() editable = false;
  @Input() compact = false;
  @Input() label = 'quantity';
  @Output() valueChange = new EventEmitter<number>();
  disabled = false;
  private onChange: (v: number) => void = () => {};
  private onTouched: () => void = () => {};

  change(delta: number) { this.set(this.value + delta); }
  typed(event: Event) { const n = Number((event.target as HTMLInputElement).value); if (Number.isFinite(n)) this.set(n, false); }
  private set(next: number, redraw = true) {
    const clamped = Math.max(this.min, Math.min(this.max, Math.round(next)));
    this.value = clamped;
    this.valueChange.emit(clamped);
    this.onChange(clamped);
    if (redraw) this.cd.markForCheck();
  }
  touch() { this.onTouched(); }
  writeValue(v: number | null): void { this.value = v ?? this.min; this.cd.markForCheck(); }
  registerOnChange(fn: (v: number) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.disabled = disabled; this.cd.markForCheck(); }
}
