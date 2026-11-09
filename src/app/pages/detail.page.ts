import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { BookingApiService } from '../core/booking-api.service';
import { EVENT_TYPES, ServiceItem, TIME_SLOTS } from '../core/models';
import { formatMoney, todayIso } from '../core/format';
import { IconComponent } from '../components/icon.component';
import { DateFieldComponent } from '../components/date-field.component';
import { QtyComponent } from '../components/qty.component';
import { PhotoPipe } from '../components/photo.pipe';
@Component({ selector:'app-detail', standalone:true, imports:[AsyncPipe,RouterLink,ReactiveFormsModule,IconComponent,DateFieldComponent,QtyComponent,PhotoPipe], template: `
<div class="container detail-page">
  @if(service$ | async; as service){
    <a routerLink="/services" class="back-link"><app-icon name="arrow-left" [size]="16" [stroke]="2.4"/> Back to Services</a>
    <div class="detail-grid">
      <div class="detail-left">
        <div class="detail-hero">
          <img [src]="service.image | photo:'lg'" [alt]="service.name" decoding="async" fetchpriority="high"/>
          <a routerLink="/services" class="round-btn m-only left" aria-label="Back to services"><app-icon name="back" [size]="22" [stroke]="2.4"/></a>
          <button type="button" class="round-btn m-only right" (click)="share(service)" aria-label="Share this service"><app-icon name="share" [size]="20"/></button>
        </div>
        @if (service.gallery?.length) {
          <div class="thumb-row">@for (g of service.gallery; track g) { <img [src]="g" [alt]="service.name + ' photo'" loading="lazy"/> }</div>
        }
        <div class="detail-sheet">
          <h1>{{service.name}}</h1>
          <p class="detail-price">@if (service.price === null) { Price on request } @else { From <b>{{money(service.price)}} per {{service.unit}}</b> }</p>
          @if (service.rating && service.reviewCount) {
            <p class="detail-rating" [attr.aria-label]="'Rated ' + service.rating + ' out of 5 from ' + service.reviewCount + ' reviews'"><span class="stars" aria-hidden="true">@for (i of stars; track i) { <app-icon name="star" [size]="17" [class.on]="i <= service.rating!"/> }</span> {{service.rating}} <small>({{service.reviewCount}} reviews)</small></p>
          }
          <p class="detail-description">{{service.description}}</p>
          <div class="included"><h2>What's Included</h2>
            <ul>@for(inclusion of service.includes;track inclusion){<li><app-icon name="check" [size]="19" [stroke]="2.6"/>{{inclusion}}</li>}</ul>
          </div>
          <p class="service-image-disclaimer">Illustrative image — exact equipment confirmed by the owner</p>
        </div>
      </div>
      <aside class="book-panel" [class.open]="sheetOpen()" aria-labelledby="book-title">
        <div class="book-card">
          <div class="sheet-bar"><button type="button" class="m-back" (click)="sheetOpen.set(false)" aria-label="Close booking form"><app-icon name="back" [size]="28"/></button><h2 id="book-title">Book This Service</h2><span></span></div>
          <form [formGroup]="form" (ngSubmit)="add(service)" novalidate>
            <div class="field"><label>Event Date</label><app-date-field formControlName="date" [min]="today" label="Event date"/></div>
            <div class="field"><label for="b-start">Start Time</label><div class="select-wrap"><select id="b-start" formControlName="startTime">@for(t of times;track t){<option [value]="t">{{t}}</option>}</select><app-icon name="chevron-down" [size]="18"/></div></div>
            <div class="field"><label for="b-end">End Time</label><div class="select-wrap"><select id="b-end" formControlName="endTime">@for(t of times;track t){<option [value]="t">{{t}}</option>}</select><app-icon name="chevron-down" [size]="18"/></div></div>
            <div class="field"><label for="b-type">Event Type</label><div class="select-wrap"><select id="b-type" formControlName="type">@for(e of eventTypes;track e){<option [value]="e">{{e}}</option>}</select><app-icon name="chevron-down" [size]="18"/></div></div>
            <div class="field"><label>Number of Kids (approx)</label><app-qty formControlName="guestCount" [editable]="true" [min]="0" [max]="50000" [step]="1" label="number of kids"/></div>
            @if(error()){<div class="notice error" role="alert">{{error()}}</div>}
            <button type="submit" class="btn btn-pink btn-block btn-lg">Add to Booking</button>
          </form>
        </div>
      </aside>
    </div>
    <div class="m-cta"><button type="button" class="btn btn-pink btn-block btn-lg" (click)="sheetOpen.set(true)">Book This Service</button></div>
    @if (copied()) { <div class="toast" role="status">Link copied</div> }
  } @else { <div class="page-loading" role="status">Loading service details...</div> }
</div>` })
export class DetailPage {
  api=inject(BookingApiService); route=inject(ActivatedRoute); router=inject(Router); fb=inject(FormBuilder);
  times=TIME_SLOTS; eventTypes=EVENT_TYPES; today=todayIso(); stars=[1,2,3,4,5];
  sheetOpen=signal(false); error=signal(''); copied=signal(false);
  form=this.fb.nonNullable.group({
    date:[this.api.event().date,Validators.required],
    startTime:[this.api.event().startTime,Validators.required],
    endTime:[this.api.event().endTime,Validators.required],
    type:[this.api.event().type,Validators.required],
    guestCount:[this.api.event().guestCount,[Validators.min(0),Validators.max(50000)]]
  });
  service$=this.api.services$.pipe(map(s=>s.find(x=>x.slug===this.route.snapshot.paramMap.get('slug'))));
  constructor(){
    this.api.occasions$.subscribe(occasions=>{
      this.eventTypes=[...new Set([...occasions.map(o=>o.name),'Other'])];
      if(!this.eventTypes.includes(this.form.controls.type.value)){
        this.form.controls.type.setValue(this.eventTypes[0]||'Other');
      }
    });
  }
  money=formatMoney;
  add(service: ServiceItem){
    const v=this.form.getRawValue();
    this.error.set('');
    if(!v.date){this.error.set('Please choose your event date.');return;}
    if(v.date<this.today){this.error.set('Please choose a date in the future.');return;}
    if(v.startTime>=v.endTime){this.error.set('End time must be after start time.');return;}
    if(service.blockedDates?.includes(v.date)){this.error.set(`${service.name} is not available on that date. Please choose another day.`);return;}
    this.api.setEvent({date:v.date,startTime:v.startTime,endTime:v.endTime,type:v.type,guestCount:v.guestCount});
    this.api.add(service,service.modes[0],1);
    this.router.navigate(['/cart']);
  }
  async share(service: ServiceItem){
    const data={title:service.name,url:location.href};
    try{
      if(navigator.share){await navigator.share(data);}
      else{await navigator.clipboard.writeText(location.href);this.copied.set(true);setTimeout(()=>this.copied.set(false),2200);}
    }catch{/* sharing cancelled */}
  }
}
