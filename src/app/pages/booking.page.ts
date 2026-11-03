import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BookingApiService } from '../core/booking-api.service';
import { EVENT_TYPES, BookingRequest } from '../core/models';
@Component({ selector:'app-booking', standalone:true, imports:[ReactiveFormsModule,RouterLink,IonicModule], template: `
<section class="page-hero slim"><div class="container"><div class="eyebrow">JUST A FEW DETAILS</div><h1>Complete your <span>booking</span></h1><p>Tell us about the big day and we'll take it from there.</p></div></section>
<div class="container section"><div class="stepper"><span class="step done">1</span><b>Selected items</b><div class="step-line"></div><span class="step active">2</span><b>Event details</b><div class="step-line"></div><span class="step">3</span><b>Confirmation</b></div>
<div class="booking-layout"><form class="surface-card booking-form" [formGroup]="form" (ngSubmit)="submit()"><h2>🎉 Tell us about your celebration</h2><p class="form-intro">Fields marked * are required.</p>
<div class="form-grid"><label class="form-field"><span>Event type *</span><select formControlName="type"><option value="">Select occasion</option>@for(e of eventTypes;track e){<option [value]="e">{{e}}</option>}</select></label><label class="form-field"><span>Event date *</span><input type="date" formControlName="date" [min]="today"/></label><label class="form-field"><span>Start time *</span><input type="time" formControlName="startTime"/></label><label class="form-field"><span>End time *</span><input type="time" formControlName="endTime"/></label><label class="form-field full"><span>Event location / address *</span><input type="text" formControlName="location" placeholder="Where will the event take place?"/></label><label class="form-field"><span>Approximate number of kids</span><input type="number" formControlName="guestCount" min="0" max="50000"/></label><label class="form-field full"><span>Special requests (optional)</span><textarea formControlName="notes" rows="3" placeholder="Setup info, special requests, themes..."></textarea></label></div>
<div class="form-divider"></div><h2>👋 How can we reach you?</h2><div class="form-grid"><label class="form-field"><span>Full name *</span><input formControlName="name" placeholder="Your full name"/></label><label class="form-field"><span>Mobile number *</span><input formControlName="phone" type="tel" placeholder="e.g. 082 123 4567"/></label><label class="form-field full"><span>Email address *</span><input formControlName="email" type="email" placeholder="you@example.com"/></label></div>
@if(error()){<div class="notice error" role="alert">{{error()}}</div>}
<div class="form-actions"><a routerLink="/cart" class="back-link">← Back to cart</a><button type="submit" class="btn btn-pink" [disabled]="busy()||api.cart().length===0">{{busy()?'Submitting...':'Submit booking request'}} ↗</button></div>
</form><aside class="surface-card booking-aside"><h3>Your selected fun</h3>@for(i of api.cart();track i.service.slug+'-'+i.mode){<div class="aside-item"><img [src]="i.service.image" [alt]="i.service.name"/><div><b>{{i.service.name}}</b><small>{{i.quantity}} × {{i.mode}}</small></div></div>}<hr/><p>✅ No payment required to submit.</p><p>💗 Your booking will be <strong>pending</strong> until the owner confirms availability.</p></aside></div></div>` })
export class BookingPageComponent {
  api=inject(BookingApiService); router=inject(Router); fb=inject(FormBuilder); eventTypes=EVENT_TYPES; busy=signal(false); error=signal('');
  today=new Date(Date.now()+2*3600_000).toISOString().slice(0,10);
  form=this.fb.nonNullable.group({ type:['',Validators.required], date:['',Validators.required],startTime:['10:00',Validators.required],endTime:['16:00',Validators.required],location:['',[Validators.required,Validators.minLength(5)]],guestCount:[20,[Validators.min(0),Validators.max(50000)]],notes:[''],name:['',[Validators.required,Validators.minLength(2)]],phone:['',[Validators.required,Validators.minLength(9)]],email:['',[Validators.required,Validators.email]] });
  submit(){
    this.error.set(''); if(!this.api.cart().length){this.error.set('Please add an item first.');return;}
    if(this.form.invalid){this.form.markAllAsTouched();this.error.set('Please fill in all required fields correctly.');return;}
    const v=this.form.getRawValue();
    if(v.startTime>=v.endTime){this.error.set('End time must be after start time.');return;}
    const body:BookingRequest={customer:{name:v.name,email:v.email,phone:v.phone},event:{type:v.type,date:v.date,startTime:v.startTime,endTime:v.endTime,location:v.location,guestCount:v.guestCount,notes:v.notes},items:this.api.cart().map(i=>({serviceId:i.service._id,quantity:i.quantity,mode:i.mode}))};
    this.busy.set(true);
    this.api.sendBooking(body).subscribe({ next:r=>{this.api.clear();this.router.navigate(['/confirmation',r.reference],{state:{email:v.email}});}, error:e=>{this.busy.set(false);this.error.set(e?.error?.message||'Could not submit your request. Please try again once the booking service is available.');} });
  }
}
