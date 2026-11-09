import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { BookingApiService } from '../core/booking-api.service';

/** The visible logo is served from the current client's MongoDB via their API. */
@Component({
  selector:'app-logo',
  standalone:true,
  changeDetection:ChangeDetectionStrategy.OnPush,
  template:`<img class="logo" [class.logo-lg]="large"
    [src]="api.brandLogoUrl()"
    [attr.sizes]="large ? '176px' : '100px'"
    width="280" height="223" alt="The Genesis Kiddies Corner" decoding="async"/>`
})
export class LogoComponent {
  @Input() large=false;
  readonly api=inject(BookingApiService);
}
