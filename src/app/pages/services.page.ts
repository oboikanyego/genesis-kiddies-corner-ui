import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingApiService } from '../core/booking-api.service';
import { formatMoney } from '../core/format';
import { ServiceItem } from '../core/models';
import { ServiceCardComponent } from '../components/service-card.component';
import { IconComponent } from '../components/icon.component';
@Component({ selector:'app-services', standalone:true, imports:[AsyncPipe,RouterLink,ServiceCardComponent,IconComponent], template: `
<header class="m-bar"><a routerLink="/" class="m-back" aria-label="Back to home"><app-icon name="back" [size]="28"/></a><h1>Our Services</h1><span></span></header>
<section class="page-head"><div class="container"><h1>Our Services</h1><p>Choose from our exciting range of services to make your event unforgettable.</p></div></section>
<div class="container services-wrap">
  @if(api.catalogOffline()) { <div class="notice warning">Preview mode: our live booking service isn't connected. Contact the owner before booking.</div> }
  @if ((api.services$ | async); as services) {
    <div class="cards-grid">@for(item of services; track item.slug){<app-service-card [service]="item"/>}</div>
    <nav class="m-list" aria-label="Services">
      @for(item of services; track item.slug){
        <a class="m-row" [routerLink]="['/services', item.slug]"><img [src]="item.image" alt=""/><span class="m-row-text"><strong>{{item.name}}</strong><em>{{price(item)}}</em></span><app-icon name="chevron-right" [size]="22"/></a>
      }
    </nav>
  } @else { <p class="page-loading" role="status">Loading services…</p> }
</div>` })
export class ServicesPage {
  api = inject(BookingApiService);
  price(item: ServiceItem): string { return item.price === null ? 'Price on request' : 'From ' + formatMoney(item.price); }
}
