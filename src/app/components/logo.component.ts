import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { environment } from '../../environments/environment';

/** The visible logo is served from the current client's MongoDB via their API. */
@Component({
  selector:'app-logo',
  standalone:true,
  changeDetection:ChangeDetectionStrategy.OnPush,
  template:`<img class="logo" [class.logo-lg]="large"
    [src]="logoUrl"
    [attr.sizes]="large ? '176px' : '100px'"
    width="280" height="223" alt="The Genesis Kiddies Corner" decoding="async"/>`
})
export class LogoComponent {
  @Input() large=false;
  readonly logoUrl=environment.apiUrl.replace(/\/$/,'')+'/branding/logo';
}
