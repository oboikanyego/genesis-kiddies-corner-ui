import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingApiService } from '../core/booking-api.service';
import { GALLERY_EXTRAS, SITE } from '../core/site-config';
import { IconComponent } from '../components/icon.component';
import { PhotoPipe } from '../components/photo.pipe';

/** About: only says what the rest of the site already says. */
@Component({ selector: 'app-about', standalone: true, imports: [RouterLink], template: `
<section class="page-head info-head"><div class="container"><h1>About</h1><p>The Genesis Kiddies Corner</p></div></section>
<div class="container info-wrap"><div class="info-card">
  <h2>Making Every Event Extra Special</h2>
  <p>We bring the fun to kiddies parties, family days, graduation days, school events, community events, church events and more, with mascot characters, jumping castles, slush and ice cream machines, face painting and a stall &amp; sales service.</p>
  <h3>How booking works</h3>
  <ol class="info-steps">
    <li>Choose your services and tell us about your event.</li>
    <li>Send your booking request. No payment is needed to submit it.</li>
    <li>Your request is pending confirmation while we review the availability and contact you.</li>
  </ol>
  <a routerLink="/services" class="btn btn-pink btn-pill">Book Now</a>
</div></div>` })
export class AboutPage {}

@Component({ selector: 'app-gallery', standalone: true, imports: [AsyncPipe, RouterLink, PhotoPipe], template: `
<section class="page-head info-head"><div class="container"><h1>Gallery</h1><p>Take a look at what we bring to your event.</p></div></section>
<div class="container info-wrap wide"><div class="gallery-grid">
  @for (s of (api.services$ | async); track s.slug) {
    <a class="gallery-tile" [routerLink]="['/services', s.slug]"><img [src]="s.image | photo:'md'" [alt]="s.name"/><span>{{s.name}}</span></a>
  }
  @for (e of extras; track e.label) {
    <figure class="gallery-tile"><img [src]="e.src" [alt]="e.label"/><figcaption>{{e.label}}</figcaption></figure>
  }
</div>
<p class="photo-note">Illustrative images. The exact equipment is confirmed when we review your booking.</p></div>` })
export class GalleryPage { api = inject(BookingApiService); extras = GALLERY_EXTRAS; }

@Component({ selector: 'app-contact', standalone: true, imports: [RouterLink, IconComponent], template: `
<section class="page-head info-head"><div class="container"><h1>Contact</h1><p>We will review the availability and contact you soon.</p></div></section>
<div class="container info-wrap"><div class="info-card">
  @if (hasDetails) {
    <ul class="contact-list">
      @if (c.phone) { <li><app-icon name="phone" [size]="20"/><a [href]="telHref">{{c.phone}}</a></li> }
      @if (c.whatsapp) { <li><app-icon name="phone" [size]="20"/><a [href]="'https://wa.me/' + c.whatsapp" target="_blank" rel="noopener">WhatsApp</a></li> }
      @if (c.email) { <li><app-icon name="mail" [size]="20"/><a [href]="'mailto:' + c.email">{{c.email}}</a></li> }
      @if (c.area) { <li><app-icon name="pin" [size]="20"/><span>{{c.area}}</span></li> }
    </ul>
  }
  <h3>Ready to book?</h3>
  <p>Choose your services and send a booking request. Your booking request is pending confirmation until we review the availability.</p>
  <div class="info-actions"><a routerLink="/services" class="btn btn-pink btn-pill">Book Now</a><a routerLink="/my-bookings" class="btn btn-outline btn-pill">View My Bookings</a></div>
</div></div>` })
export class ContactPage {
  c = SITE.contact;
  hasDetails = !!(this.c.phone || this.c.whatsapp || this.c.email || this.c.area);
  telHref = 'tel:' + this.c.phone.replace(/\s+/g, '');
}

/** The "More" tab on phones: everything that is not a main tab. */
@Component({ selector: 'app-more', standalone: true, imports: [RouterLink, IconComponent], template: `
<header class="m-bar"><h1>More</h1></header>
<div class="container more-wrap"><nav class="more-list" aria-label="More">
  <a routerLink="/cart"><app-icon name="bag" [size]="22"/><span>Your Booking</span>@if (api.cart().length) { <b class="count-pill">{{api.cart().length}}</b> }<app-icon name="chevron-right" [size]="18"/></a>
  <a routerLink="/about"><app-icon name="info" [size]="22"/><span>About</span><app-icon name="chevron-right" [size]="18"/></a>
  <a routerLink="/gallery"><app-icon name="image" [size]="22"/><span>Gallery</span><app-icon name="chevron-right" [size]="18"/></a>
  <a routerLink="/contact"><app-icon name="phone" [size]="22"/><span>Contact</span><app-icon name="chevron-right" [size]="18"/></a>
  <a routerLink="/admin"><app-icon name="lock" [size]="22"/><span>Owner login</span><app-icon name="chevron-right" [size]="18"/></a>
</nav></div>` })
export class MorePage { api = inject(BookingApiService); }
