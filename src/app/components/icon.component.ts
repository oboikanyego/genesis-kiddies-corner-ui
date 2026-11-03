import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** Small line icons (24x24, drawn with currentColor so they follow the text colour). */
@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg class="icon" [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" [attr.stroke-width]="stroke" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    @switch (name) {
      @case ('home') { <path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h5v-6h4v6h5V10"/> }
      @case ('services') { <circle cx="8.2" cy="8.2" r="3.4"/><circle cx="15.8" cy="8.2" r="3.4"/><circle cx="8.2" cy="15.8" r="3.4"/><circle cx="15.8" cy="15.8" r="3.4"/> }
      @case ('bookings') { <rect x="3.5" y="4.5" width="17" height="16" rx="3"/><path d="M8 3v3M16 3v3M3.5 10h17"/><path d="m9 15 2 2 4-4"/> }
      @case ('more') { <circle cx="6" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="6" cy="18" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="18" r="1.5" fill="currentColor" stroke="none"/> }
      @case ('back') { <path d="m15 18-6-6 6-6"/> }
      @case ('arrow-left') { <path d="M19 12H5M11 18l-6-6 6-6"/> }
      @case ('chevron-right') { <path d="m9 18 6-6-6-6"/> }
      @case ('chevron-left') { <path d="m15 18-6-6 6-6"/> }
      @case ('chevron-down') { <path d="m6 9 6 6 6-6"/> }
      @case ('calendar') { <rect x="3.5" y="4.5" width="17" height="16" rx="3"/><path d="M8 3v3M16 3v3M3.5 10h17"/><rect x="8" y="13" width="3" height="3" rx=".6"/> }
      @case ('clock') { <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/> }
      @case ('pin') { <path d="M20 10.5c0 6-8 11.5-8 11.5s-8-5.5-8-11.5a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10.5" r="2.8"/> }
      @case ('trash') { <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/> }
      @case ('plus') { <path d="M12 5v14M5 12h14"/> }
      @case ('minus') { <path d="M5 12h14"/> }
      @case ('check') { <path d="m5 12.5 4.5 4.5L19 7.5"/> }
      @case ('copy') { <rect x="8.5" y="8.5" width="12" height="12" rx="3"/><path d="M15.5 8.5v-2a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h2"/> }
      @case ('share') { <circle cx="18" cy="5.5" r="2.8"/><circle cx="6" cy="12" r="2.8"/><circle cx="18" cy="18.5" r="2.8"/><path d="m8.5 10.6 6.9-4M8.5 13.4l6.9 4"/> }
      @case ('user') { <circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/> }
      @case ('dashboard') { <rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/> }
      @case ('settings') { <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/> }
      @case ('logout') { <path d="M9 21H5.5A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3H9M16 17l5-5-5-5M21 12H9"/> }
      @case ('bag') { <path d="M6 2.5 3.5 6.5V19a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V6.5L18 2.5Z"/><path d="M3.5 6.5h17M16 10.5a4 4 0 0 1-8 0"/> }
      @case ('info') { <circle cx="12" cy="12" r="9"/><path d="M12 16v-4.5M12 8h.01"/> }
      @case ('image') { <rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="m20.5 15-5-5-9 10.5"/> }
      @case ('phone') { <path d="M21.5 16.9v2.6a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 10.7 18.4a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1.6 3.7 2 2 0 0 1 3.6 1.5h2.6a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.1 9.4a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/> }
      @case ('mail') { <rect x="2.5" y="4.5" width="19" height="15" rx="3"/><path d="m3 7 9 6.5L21 7"/> }
      @case ('lock') { <rect x="4" y="10.5" width="16" height="10.5" rx="3"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/> }
      @case ('refresh') { <path d="M20 11a8 8 0 0 0-14.5-4M4 4v4h4M4 13a8 8 0 0 0 14.5 4M20 20v-4h-4"/> }
      @case ('search') { <circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.2-4.2"/> }
      @case ('close') { <path d="M6 6l12 12M18 6 6 18"/> }
      @case ('star') { <path d="m12 2.8 2.8 5.9 6.4.9-4.6 4.5 1.1 6.4L12 17.5l-5.7 3 1.1-6.4-4.6-4.5 6.4-.9Z" fill="currentColor" stroke="none"/> }
    }
  </svg>`
})
export class IconComponent {
  @Input({ required: true }) name!: string;
  @Input() size = 20;
  @Input() stroke = 2;
}
