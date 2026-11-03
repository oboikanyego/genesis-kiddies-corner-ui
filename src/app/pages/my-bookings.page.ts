import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { BookingApiService } from '../core/booking-api.service';
import { Booking, ServiceItem } from '../core/models';
import { formatMoney, formatWhen, isUpcoming, statusLabel } from '../core/format';
import { servicePhotoFor } from '../core/service-photos';
import { IconComponent } from '../components/icon.component';

@Component({ selector:'app-my-bookings', standalone:true, imports:[ReactiveFormsModule,RouterLink,IconComponent], template:`
<header class="m-bar"><span></span><h1>My Bookings</h1><span></span></header>
<section class="page-head"><div class="container"><h1>My Bookings</h1><p>Track the status of your bookings.</p></div></section>
<div class="container mb-wrap">
  <div class="tabs" role="tablist" aria-label="Bookings">
    <button type="button" role="tab" id="tab-upcoming" [attr.aria-selected]="tab()==='upcoming'" [class.active]="tab()==='upcoming'" (click)="tab.set('upcoming')">Upcoming</button>
    <button type="button" role="tab" id="tab-past" [attr.aria-selected]="tab()==='past'" [class.active]="tab()==='past'" (click)="tab.set('past')">Past</button>
  </div>
  <div role="tabpanel" [attr.aria-labelledby]="'tab-'+tab()">
    @if(loading()&&!bookings().length){<p class="page-loading" role="status">Loading your bookings…</p>}
    @for(b of visible();track b.reference){
      <article class="mb-card">
        <img class="mb-thumb" [src]="photo(b)" alt="" loading="lazy"/>
        <div class="mb-main">
          <strong class="mb-ref">{{b.reference}}</strong>
          <span class="mb-type">{{b.event.type}}</span>
          <span class="mb-meta"><app-icon name="calendar" [size]="15"/>{{when(b)}}</span>
          <span class="mb-meta mb-loc"><app-icon name="pin" [size]="15"/>{{b.event.location}}</span>
        </div>
        <span class="chip chip-{{b.status}}">{{label(b.status)}}</span>
        <button type="button" class="btn btn-outline-pink btn-sm" (click)="toggle(b.reference)" [attr.aria-expanded]="open()===b.reference">View Details</button>
        @if(open()===b.reference){
          <div class="mb-details">
            <p class="mb-note">@if(b.status==='pending'){Your request is waiting for review by the owner.}@else if(b.status==='confirmed'){Great news! Your booking is confirmed.}@else{Current status: {{label(b.status)}}.}</p>
            <h3>Booked items</h3>
            @for(i of b.items;track i.serviceId+i.mode){<div class="mb-item"><span>{{i.quantity}} × {{i.name}}</span><span>{{i.unitPrice===null?'Price on request':money(i.unitPrice*i.quantity)}}</span></div>}
            <div class="mb-item mb-total"><span>Estimated Total</span><strong>{{b.amount===null?'To be quoted':money(b.amount)}}</strong></div>
            <button type="button" class="link-btn danger" (click)="forget(b.reference)">Remove from this device</button>
          </div>
        }
      </article>
    }
    @if(!loading()&&!visible().length){
      <div class="empty-state">
        <app-icon name="bookings" [size]="44" [stroke]="1.6"/>
        <h2>{{tab()==='upcoming'?'No upcoming bookings':'No past bookings yet'}}</h2>
        <p>{{bookings().length?'Check the other tab for your other bookings.':'Bookings you make on this device will appear here.'}}</p>
        <a class="btn btn-pink btn-pill" routerLink="/services">Browse Services</a>
      </div>
    }
  </div>
  <details class="lookup">
    <summary>Find a booking made on another device</summary>
    <form [formGroup]="form" (ngSubmit)="lookup()" novalidate>
      <p>Enter the booking reference and email address from your confirmation.</p>
      <div class="field"><label for="l-ref">Booking Reference</label><input id="l-ref" formControlName="reference" placeholder="GKC-20261115-001" autocapitalize="characters"/></div>
      <div class="field"><label for="l-mail">Email Address</label><input id="l-mail" formControlName="email" type="email" inputmode="email" placeholder="you@example.com"/></div>
      <button type="submit" class="btn btn-pink btn-block" [disabled]="form.invalid||busy()">{{busy()?'Searching...':'Find My Booking'}}</button>
      @if(error()){<div class="notice error" role="alert">{{error()}}</div>}
    </form>
  </details>
</div>` })
export class MyBookingsPage {
  api=inject(BookingApiService); fb=inject(FormBuilder);
  tab=signal<'upcoming'|'past'>('upcoming'); loading=signal(false); busy=signal(false); error=signal(''); open=signal<string|null>(null);
  bookings=signal<Booking[]>(this.api.saved().map(s=>s.snapshot).filter((b):b is Booking=>!!b));
  private services=signal<ServiceItem[]>([]);
  money=formatMoney; label=statusLabel;
  form=this.fb.nonNullable.group({reference:['',Validators.required],email:['',[Validators.required,Validators.email]]});
  visible=computed(()=>{
    const list=this.bookings().filter(b=>this.tab()==='upcoming'?isUpcoming(b):!isUpcoming(b));
    return [...list].sort((a,b)=>this.tab()==='upcoming'?a.event.date.localeCompare(b.event.date)||a.event.startTime.localeCompare(b.event.startTime):b.event.date.localeCompare(a.event.date));
  });
  constructor(){
    this.api.services$.subscribe(s=>this.services.set(s));
    this.refresh();
  }
  when(b:Booking):string{return formatWhen(b.event);}
  photo(b:Booking):string{
    const first=b.items[0];
    const service=this.services().find(s=>s._id===first?.serviceId)||this.services().find(s=>s.name===first?.name);
    return service?service.image:servicePhotoFor({slug:'',image:''})||'assets/favicon.svg';
  }
  toggle(reference:string){this.open.set(this.open()===reference?null:reference);}
  forget(reference:string){this.api.forgetBooking(reference);this.bookings.set(this.bookings().filter(b=>b.reference!==reference));this.open.set(null);}
  /**
   * Asks the API for the latest status of the saved bookings that can still change; what is already saved is shown straight away.
   * Finished or cancelled bookings keep their saved copy, and at most 10 are checked at once (the API limits how many requests one visitor can make).
   */
  private refresh(){
    const saved=this.api.saved().filter(s=>!s.snapshot||s.snapshot.status==='pending'||s.snapshot.status==='confirmed').slice(0,10);
    if(!saved.length)return;
    this.loading.set(true);
    forkJoin(saved.map(s=>this.api.track(s.reference,s.email).pipe(catchError(()=>of(null))))).subscribe(results=>{
      const fresh=results.filter((b):b is Booking=>!!b);
      fresh.forEach(b=>this.api.updateSnapshot(b.reference,b));
      const byRef=new Map(this.bookings().map(b=>[b.reference,b]));
      fresh.forEach(b=>byRef.set(b.reference,b));
      this.bookings.set([...byRef.values()]);
      this.loading.set(false);
    });
  }
  lookup(){
    if(this.form.invalid)return;
    this.busy.set(true);this.error.set('');
    const v=this.form.getRawValue();
    this.api.track(v.reference.trim().toUpperCase(),v.email.trim()).subscribe({
      next:b=>{
        this.api.rememberBooking(b.reference,v.email,b);
        this.bookings.set([b,...this.bookings().filter(x=>x.reference!==b.reference)]);
        this.tab.set(isUpcoming(b)?'upcoming':'past');this.open.set(b.reference);
        this.form.reset({reference:'',email:''});this.busy.set(false);
      },
      error:e=>{this.error.set(e?.error?.message||'Unable to retrieve booking right now.');this.busy.set(false);}
    });
  }
}
