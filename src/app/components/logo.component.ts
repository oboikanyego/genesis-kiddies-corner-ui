import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** The Genesis Kiddies Corner logo, drawn as SVG so it stays sharp at any size. */
@Component({
  selector: 'app-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg class="logo" [class.logo-lg]="large" viewBox="0 0 262 120" role="img" aria-label="The Genesis Kiddies Corner">
    <g transform="rotate(-4 131 64)">
      <g stroke="#fff" stroke-width="3.2" stroke-linejoin="round" paint-order="stroke">
        <g transform="translate(12 20) rotate(-16 22 18)">
          <path d="M0 30 L3 9 L12 19 L21 3 L30 19 L39 9 L42 30 Z" fill="#ffb21f"/>
          <rect x="0" y="29" width="42" height="7" rx="2.5" fill="#ff9420"/>
        </g>
        <g transform="translate(106 0)">
          <path d="M0 36 L4 9 L15 22 L26 2 L37 22 L48 9 L52 36 Z" fill="#ff8a1f"/>
          <rect x="0" y="35" width="52" height="8" rx="2.8" fill="#f2681a"/>
        </g>
      </g>
      <g fill="#e11d74"><circle cx="132" cy="38" r="2.6"/><circle cx="120" cy="38" r="2" fill="#7a5cff"/><circle cx="144" cy="38" r="2" fill="#7a5cff"/><circle cx="27" cy="45" r="2.2" fill="#7a5cff"/></g>
      <text x="214" y="40" class="logo-the" stroke="#fff" stroke-width="4" paint-order="stroke">The</text>
      <text x="8" y="90" class="logo-main" textLength="246" lengthAdjust="spacingAndGlyphs" stroke="#fff" stroke-width="9" stroke-linejoin="round" paint-order="stroke">Genesis</text>
      <text x="44" y="114" class="logo-sub" textLength="176" lengthAdjust="spacingAndGlyphs" stroke="#fff" stroke-width="5" paint-order="stroke">Kiddies Corner</text>
    </g>
  </svg>`
})
export class LogoComponent {
  @Input() large = false;
}
