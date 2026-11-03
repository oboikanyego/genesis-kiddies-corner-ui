import { Component,inject,signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookingApiService } from '../core/booking-api.service';
import { Booking } from '../core/models';
@Component({selector:'app-track',standalone:true,imports:[ReactiveFormsModule,RouterLink],template:`
<section class="page-hero slim"><div class="container"><div class="eyebrow">LET'S SEE HOW IT'S GOING</div><h1>Track your <span>booking</span></h1><p>Use your reference number and email to check the status.</p></div></section>
<div class="container section track-container"><form class="surface-card tracking-form" [formGroup]="form" (ngSubmit)="lookup()"><h2>Find my booking</h2><p>Enter the details from your booking confirmation.</p><label class="form-field"><span>Booking reference</span><input formControlName="reference" placeholder="GKC-20261115-XXXXXXXX"/></label><label class="form-field"><span>Email address</span><input formControlName="email" type="email" placeholder="you@example.com"/></label><button type="submit" class="btn btn-pink btn-full" [disabled]="form.invalid||busy()">{{busy()?'Searching...':'Check booking status →'}}</button>@if(error()){<div class="notice error" role="alert">{{error()}}</div>}</form>
@if(booking();as b){<div class="surface-card booking-result"><div class="result-top"><div><small>BOOKING REFERENCE</small><h2>{{b.reference}}</h2></div><span class="status-chip" [class]="b.status">{{b.status}}</span></div><div class="result-list"><div><span>Event</span><strong>{{b.event.type}}</strong></div><div><span>Date</span><strong>{{b.event.date}}</strong></div><div><span>Time</span><strong>{{b.event.startTime}}–{{b.event.endTime}}</strong></div><div><span>Location</span><strong>{{b.event.location}}</strong></div></div><hr/><h3>Booked items</h3>@for(i of b.items;track i.serviceId){<div class="result-service">{{i.quantity}}× {{i.name}} <small>({{i.mode}})</small></div>}<div class="notice">@if(b.status==='pending'){Your request is waiting for review by the owner.}@else if(b.status==='confirmed'){Great news! Your booking is confirmed.}@else{Current status: {{b.status}}.}</div></div>}
</div>`})
export class TrackPage {
  api=inject(BookingApiService); fb=inject(FormBuilder); booking=signal<Booking|null>(null); error=signal(''); busy=signal(false);
  form=this.fb.nonNullable.group({reference:['',Validators.required],email:['',[Validators.required,Validators.email]]});
  lookup(){if(this.form.invalid)return;this.busy.set(true);this.error.set('');this.booking.set(null);const v=this.form.getRawValue();this.api.track(v.reference.trim().toUpperCase(),v.email.trim()).subscribe({next:r=>{this.booking.set(r);this.busy.set(false);},error:e=>{this.error.set(e.error?.message||'Unable to retrieve booking right now.');this.busy.set(false);}});}
}
