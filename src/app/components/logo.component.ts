import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * The official The Genesis Kiddies Corner logo: a nearly square badge (tent, two children, name and "Where The Fun Begins!")
 * with a white outline, as a transparent image, so it sits on the white header, on the hero and on the dark owner sidebar.
 * Two sizes are offered (280 and 560 px wide) and the browser picks the sharper one on high-resolution screens.
 * `large` asks for the bigger display size: on the phone homepage and in the owner sidebar. The width and height
 * attributes must match the image files (the brand test checks this), so the page does not jump while it loads.
 */
@Component({
  selector: 'app-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<img class="logo" [class.logo-lg]="large"
    src="/assets/images/brand/logo-md.webp"
    srcset="/assets/images/brand/logo-md.webp 280w, /assets/images/brand/logo-lg.webp 560w"
    [attr.sizes]="large ? '176px' : '100px'"
    width="280" height="223" alt="The Genesis Kiddies Corner" decoding="async"/>`
})
export class LogoComponent {
  @Input() large = false;
}
