import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingApiService } from '../core/booking-api.service';
import { ServiceCardComponent } from '../components/service-card.component';
@Component({ selector:'app-services', standalone:true, imports:[AsyncPipe,RouterLink,ServiceCardComponent], template: `
<section class="page-hero"><div class="container"><div class="eyebrow">THE FUN IS ALL HERE ✨</div><h1>Our <span>services</span></h1><p>Everything you need for a joy-filled event. Pick one or bundle a few together.</p></div></section>
<div class="container section catalog-section"><div class="catalog-toolbar"><div><strong>Find your perfect party extras</strong><small>7 favourite services for happy celebrations</small></div><label class="search-field"><span>⌕</span><input type="search" placeholder="Search for something fun..." [value]="query()" (input)="query.set($any($event.target).value)" aria-label="Search services"/></label></div>
<div class="filter-pills"><button [class.active]="category()==='All'" (click)="category.set('All')">✨ All services</button><button [class.active]="category()==='Equipment'" (click)="category.set('Equipment')">🏰 Equipment</button><button [class.active]="category()==='Treats'" (click)="category.set('Treats')">🍿 Sweet treats</button><button [class.active]="category()==='Entertainment'" (click)="category.set('Entertainment')">🎨 Entertainment</button></div>
@if(api.catalogOffline()) { <div class="notice warning">Preview mode: our live booking service isn't connected. Contact the owner before booking.</div> }
<div class="cards-grid catalog-grid">@for(item of (api.services$ | async); track item.slug){ @if((category()==='All'||item.category===category()) && (item.name.toLowerCase().includes(query().toLowerCase()) || item.description.toLowerCase().includes(query().toLowerCase()))){<app-service-card [service]="item"/>}}</div>
<div class="service-help">💗 <b>Not sure what to choose?</b> You can add several items to one booking and we'll help with the details.</div></div>` })
export class ServicesPage { api=inject(BookingApiService); category=signal('All'); query=signal(''); }
