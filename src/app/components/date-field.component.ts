import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, ViewChild, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from './icon.component';
import { formatDate } from '../core/format';

/**
 * Shows the chosen date as "15 Nov 2026" with a calendar icon, while the browser's own date picker
 * (a transparent native input laid over the field) does the choosing. Works with formControlName.
 */
@Component({
  selector: 'app-date-field',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DateFieldComponent), multi: true }],
  template: `<label class="date-field" [class.is-empty]="!value" [class.is-disabled]="disabled">
    <span class="date-text">{{ value ? text : placeholder }}</span>
    <app-icon name="calendar" [size]="19"/>
    <input #native type="date" [value]="value" [min]="min" [disabled]="disabled" [attr.aria-label]="label" (click)="openPicker()" (input)="picked($event)" (change)="picked($event)" (blur)="onTouched()"/>
  </label>`
})
export class DateFieldComponent implements ControlValueAccessor {
  private cd = inject(ChangeDetectorRef);
  @ViewChild('native') private native?: ElementRef<HTMLInputElement>;
  @Input() min = '';
  @Input() label = 'Date';
  @Input() placeholder = 'Select a date';
  value = '';
  disabled = false;
  private onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  get text() { return formatDate(this.value); }
  openPicker() { try { this.native?.nativeElement.showPicker?.(); } catch { /* not allowed here: typing still works */ } }
  picked(event: Event) {
    const v = (event.target as HTMLInputElement).value;
    if (v === this.value) return;
    this.value = v;
    this.onChange(v);
    this.cd.markForCheck();
  }
  writeValue(v: string | null): void { this.value = v ?? ''; this.cd.markForCheck(); }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.disabled = disabled; this.cd.markForCheck(); }
}
