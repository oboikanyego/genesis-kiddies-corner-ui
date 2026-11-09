import { Component, computed, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingApiService } from '../core/booking-api.service';
import { telHref, whatsappHref } from '../core/contact';
import { ContactDetails, EMPTY_CONTACT } from '../core/models';
import { DEFAULT_OCCASIONS, OCCASION_BACKGROUNDS } from '../core/site-config';
import type { OccasionTheme } from '../core/models';
import { IconComponent } from '../components/icon.component';
import { PhotoPipe } from '../components/photo.pipe';

/** About: only says what the rest of the site already says. */
@Component({ selector: 'app-about', standalone: true, imports: [RouterLink], template: `
<section class="page-head info-head"><div class="container"><h1>About</h1><p>The Genesis Kiddies Corner</p></div></section>
<div class="container info-wrap"><div class="info-card">
  <h2>Making Every Event Extra Special</h2>
  <p>We bring fun to parties, celebrations and community gatherings, with mascot characters, jumping castles, slush and ice cream machines, face painting and a stall &amp; sales service.</p>
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
  @for (e of ((api.occasions$ | async) ?? fallbackOccasions); track e._id) {
    <figure class="gallery-tile">
      @if(e.photo){<img [src]="e.photo" [alt]="e.label"/>}
      @else{<div class="occasion-art" [style.background]="background(e.theme)"><span aria-hidden="true">{{e.emoji}}</span></div>}
      <figcaption>{{e.label}}</figcaption>
    </figure>
  }
</div>
<p class="photo-note">Illustrative images. The exact equipment is confirmed when we review your booking.</p></div>` })
export class GalleryPage { api = inject(BookingApiService); fallbackOccasions = DEFAULT_OCCASIONS; background(t:OccasionTheme){return OCCASION_BACKGROUNDS[t];} }

/** Contact: shows the details the owner entered in Admin > Settings (read from the API); an empty detail is left out. */
@Component({ selector: 'app-contact', standalone: true, imports: [RouterLink, IconComponent], template: `
<section class="page-head info-head"><div class="container"><h1>Contact</h1><p>We will review the availability and contact you soon.</p></div></section>
<div class="container info-wrap"><div class="info-card">
  @if (state() === 'loading') {
    <p class="contact-status" role="status">Loading our contact details…</p>
  } @else if (state() === 'error') {
    <p class="contact-status" role="alert">We couldn't load our contact details just now. <button type="button" class="link-btn" (click)="load()">Try again</button></p>
  } @else if (hasDetails()) {
    <ul class="contact-list">
      @if (c().phone) { <li><app-icon name="phone" [size]="20"/><a [href]="telHref(c().phone)">{{c().phone}}</a></li> }
      @if (c().whatsapp) { <li><app-icon name="phone" [size]="20"/><a [href]="whatsappHref(c().whatsapp)" target="_blank" rel="noopener">WhatsApp {{c().whatsapp}}</a></li> }
      @if (c().email) { <li><app-icon name="mail" [size]="20"/><a [href]="'mailto:' + c().email">{{c().email}}</a></li> }
      @if (c().area) { <li><app-icon name="pin" [size]="20"/><span>{{c().area}}</span></li> }
    </ul>
  }
  <h3>Ready to book?</h3>
  <p>Choose your services and send a booking request. Your booking request is pending confirmation until we review the availability.</p>
  <div class="info-actions"><a routerLink="/services" class="btn btn-pink btn-pill">Book Now</a><a routerLink="/my-bookings" class="btn btn-outline btn-pill">View My Bookings</a></div>
</div></div>` })
export class ContactPage {
  private api = inject(BookingApiService);
  state = signal<'loading' | 'ready' | 'error'>('loading');
  c = signal<ContactDetails>(EMPTY_CONTACT);
  hasDetails = computed(() => Object.values(this.c()).some(value => !!value));
  telHref = telHref;
  whatsappHref = whatsappHref;
  constructor() { this.load(); }
  load() {
    this.state.set('loading');
    this.api.contactDetails().subscribe({
      next: details => { this.c.set({ ...EMPTY_CONTACT, ...details }); this.state.set('ready'); },
      error: () => this.state.set('error')
    });
  }
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
