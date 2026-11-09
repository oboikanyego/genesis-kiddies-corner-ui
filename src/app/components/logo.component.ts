import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { BookingApiService } from '../core/booking-api.service';

/**
 * The official The Genesis Kiddies Corner logo: a nearly square badge (tent, two children, name and "Where The Fun Begins!")
 * with a white outline, as a transparent image, so it sits on the white header, on the hero and on the dark owner sidebar.
 * The owner-managed PNG is served from the client's MongoDB through their own Render API.
 * `large` asks for the bigger display size: on the phone homepage and in the owner sidebar. The width and height
 * attributes retain the original logo aspect ratio so the page does not jump while it loads.
 */
@Component({
  selector: 'app-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<img class="logo" [class.logo-lg]="large"
    [src]="api.brandLogoUrl()"
    width="280" height="223" alt="The Genesis Kiddies Corner" decoding="async"/>`
})
export class LogoComponent {
  api = inject(BookingApiService);
  @Input() large = false;
}
