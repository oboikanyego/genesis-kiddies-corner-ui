import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingApiService } from '../core/booking-api.service';
import { DEMO_SERVICES } from '../core/demo-data';
import { HERO_IMAGES, SERVICE_ICONS } from '../core/service-photos';
import { OCCASION_BACKGROUNDS, SERVICE_EMOJI } from '../core/site-config';
import type { OccasionTheme } from '../core/models';
import { LogoComponent } from '../components/logo.component';
@Component({ selector:'app-home', standalone:true, imports:[AsyncPipe,RouterLink,LogoComponent], template: `
<section class="hero">
  <img class="hero-photo" [src]="hero.desktop" [attr.srcset]="hero.phone + ' 800w, ' + hero.desktop + ' 1448w'" sizes="(max-width: 899px) 100vw, 64vw" alt="" fetchpriority="high"/>
  <div class="hero-shade"></div>
  <div class="container hero-inner">
    <a routerLink="/" class="hero-logo" aria-label="The Genesis Kiddies Corner"><app-logo [large]="true"/></a>
    <h1>Making Every<br/>Event <span class="hl-desk">Extra </span><span class="hl">Special</span></h1>
    <p class="hero-lead">Parties, celebrations and special moments<br/>for every family and community</p>
    <div class="hero-buttons"><a routerLink="/services" class="btn btn-pink btn-lg">Book Now</a><a routerLink="/services" class="btn btn-ghost btn-lg"><span>View <span class="desk-only">Our </span>Services</span></a></div>
  </div>
</section>
<section class="container shortcuts-wrap" aria-label="Our services">
  <div class="shortcuts">
    @for (s of ((api.services$ | async) ?? demo).slice(0, 6); track s.slug; let i = $index) {
      <a [routerLink]="['/services', s.slug]"><span class="shortcut-icon tone-{{i % 6}}" aria-hidden="true">@if (icons[s.slug]) { <img [src]="icons[s.slug]" alt="" width="66" height="66"/> } @else { {{emoji[s.slug] || '🎉'}} }</span><span class="shortcut-label">{{s.name}}</span></a>
    }
  </div>
</section>
<section class="container occasions" id="occasions">
  <h2>Perfect for Every Occasion</h2>
  <div class="occasion-grid">
    @for (o of ((api.occasions$ | async) ?? []); track o._id) {
      <figure class="occasion"><div class="occasion-art" [style.background]="occasionBackground(o.theme)">@if (o.photo) { <img [src]="o.photo" [alt]="o.label" loading="lazy"/> } @else { <span aria-hidden="true">{{o.emoji}}</span> }</div><figcaption>{{o.label}}</figcaption></figure>
    }
  </div>
</section>
` })
export class HomePage {
  api = inject(BookingApiService);
  hero = HERO_IMAGES;
  icons = SERVICE_ICONS;
  occasionBackground(theme:OccasionTheme):string{return OCCASION_BACKGROUNDS[theme] || OCCASION_BACKGROUNDS.pink;}
  emoji = SERVICE_EMOJI;
  /** Shown instantly while the live list loads, so the page never jumps. */
  demo = DEMO_SERVICES;
}
