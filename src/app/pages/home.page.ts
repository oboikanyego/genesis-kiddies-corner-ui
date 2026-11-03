import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingApiService } from '../core/booking-api.service';
import { DEMO_SERVICES } from '../core/demo-data';
import { HERO_PHOTO } from '../core/service-photos';
import { OCCASIONS, SERVICE_EMOJI } from '../core/site-config';
import { LogoComponent } from '../components/logo.component';
@Component({ selector:'app-home', standalone:true, imports:[AsyncPipe,RouterLink,LogoComponent], template: `
<section class="hero">
  <img class="hero-photo" [src]="heroPhoto" alt="" fetchpriority="high"/>
  <div class="hero-shade"></div>
  <div class="container hero-inner">
    <a routerLink="/" class="hero-logo" aria-label="The Genesis Kiddies Corner"><app-logo [large]="true"/></a>
    <h1>Making Every<br/>Event <span class="hl-desk">Extra </span><span class="hl">Special</span></h1>
    <p class="hero-lead">Kiddies parties · Family days<span class="desk-only"> · Graduation days</span><br/>School events · Community events<span class="desk-only"> · Church events</span><br/>and more</p>
    <div class="hero-buttons"><a routerLink="/services" class="btn btn-pink btn-lg">Book Now</a><a routerLink="/services" class="btn btn-ghost btn-lg"><span>View <span class="desk-only">Our </span>Services</span></a></div>
  </div>
</section>
<section class="container shortcuts-wrap" aria-label="Our services">
  <div class="shortcuts">
    @for (s of ((api.services$ | async) ?? demo).slice(0, 6); track s.slug; let i = $index) {
      <a [routerLink]="['/services', s.slug]"><span class="shortcut-icon tone-{{i % 6}}" aria-hidden="true">{{emoji[s.slug] || '🎉'}}</span><span class="shortcut-label">{{s.name}}</span></a>
    }
  </div>
</section>
<section class="container occasions" id="occasions">
  <h2>Perfect for Every Occasion</h2>
  <div class="occasion-grid">
    @for (o of occasions; track o.label) {
      <figure class="occasion"><div class="occasion-art" [style.background]="o.tint">@if (o.photo) { <img [src]="o.photo" [alt]="o.label" loading="lazy"/> } @else { <span aria-hidden="true">{{o.emoji}}</span> }</div><figcaption>{{o.label}}</figcaption></figure>
    }
  </div>
</section>
` })
export class HomePage {
  api = inject(BookingApiService);
  heroPhoto = HERO_PHOTO;
  occasions = OCCASIONS;
  emoji = SERVICE_EMOJI;
  /** Shown instantly while the live list loads, so the page never jumps. */
  demo = DEMO_SERVICES;
}
