import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { BookingApiService } from '../core/booking-api.service';
import { BookingMode, MODE_LABELS } from '../core/models';
@Component({ selector:'app-detail', standalone:true, imports:[AsyncPipe,RouterLink,UpperCasePipe], template: `
<div class="container detail-page"><a routerLink="/services" class="back-link">← Back to all services</a>
  @if(service$ | async; as service){
    <div class="detail-grid"><div><div class="detail-main-img"><img [src]="service.image" [alt]="service.name" decoding="async"/><p class="service-image-disclaimer">Reference photo — exact equipment confirmed by the owner</p></div><div class="detail-benefits"><span>✔ Perfect for special events</span><span>✔ Friendly service</span><span>✔ Booking confirmation from our team</span></div></div>
    <div class="detail-info"><div class="eyebrow pink-text">{{service.category | uppercase}}</div><h1>{{service.name}}</h1><div class="detail-rating">🎉 Making memories, one celebration at a time</div><div class="detail-price">{{service.price===null?'Price on request':'From R'+service.price.toLocaleString('en-ZA')}}<small> {{service.price!==null? '/ '+service.unit : '• final quote confirmed by owner'}}</small></div><p class="detail-description">{{service.description}}</p>
    <div class="included"><h3>What's included?</h3>@for(inclusion of service.includes;track inclusion){<div><span>✓</span>{{inclusion}}</div>}</div>
    <div class="detail-book-box"><h3>Let's add some fun!</h3><p>Choose how you'd like to book this item.</p><label class="field-label">Booking type</label><select class="input-field" [value]="mode()||service.modes[0]" (change)="mode.set($any($event.target).value)">@for(m of service.modes;track m){<option [value]="m">{{modeLabels[m]}}</option>}</select>
    <label class="field-label">Quantity</label><div class="qty-selector"><button (click)="count.set(Math.max(1,count()-1))" aria-label="Decrease quantity">−</button><span>{{count()}}</span><button (click)="count.set(Math.min(service.stock,count()+1))" aria-label="Increase quantity">+</button></div>
    <button class="btn btn-pink btn-full" (click)="add(service)">Add to booking <span>↗</span></button><p class="under-button">No payment now — the owner will confirm your request.</p>
    </div></div></div>
  } @else { <div class="page-loading">Loading service details...</div> }
</div>` })
export class DetailPage {
  api=inject(BookingApiService); route=inject(ActivatedRoute); router=inject(Router);
  count=signal(1); mode=signal<BookingMode|null>(null); modeLabels=MODE_LABELS; Math=Math;
  service$=this.api.services$.pipe(map(s=>s.find(x=>x.slug===this.route.snapshot.paramMap.get('slug'))));
  add(service: import('../core/models').ServiceItem){this.api.add(service,this.mode()||service.modes[0],this.count());this.router.navigate(['/cart']);}
}
