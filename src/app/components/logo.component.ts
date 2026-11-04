import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * The official The Genesis Kiddies Corner logo (a transparent image, so it sits on the white header,
 * on the hero and on the dark owner sidebar). Two sizes are offered and the browser picks the sharper one on
 * high-resolution screens. `large` asks for the bigger size: on the phone homepage and in the owner sidebar.
 */
@Component({
  selector: 'app-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<img class="logo" [class.logo-lg]="large"
    src="/assets/images/brand/logo-md.webp"
    srcset="/assets/images/brand/logo-md.webp 240w, /assets/images/brand/logo-lg.webp 480w"
    [attr.sizes]="large ? '217px' : '110px'"
    width="240" height="131" alt="The Genesis Kiddies Corner" decoding="async"/>`
})
export class LogoComponent {
  @Input() large = false;
}
