import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { BookingApiService } from '../core/booking-api.service';
import { Booking, BookingRequest, CartItem, EVENT_TYPES, TIME_SLOTS } from '../core/models';
import { bookingErrorMessage, isRetryableTokenError } from '../core/booking-guard';
import { phoneValidator } from '../core/validators';
import { formatDate, formatMoney, formatTimeRange, todayIso } from '../core/format';
import { IconComponent } from '../components/icon.component';
import { DateFieldComponent } from '../components/date-field.component';
import { QtyComponent } from '../components/qty.component';
import { PhotoPipe } from '../components/photo.pipe';

type Step = 1 | 2 | 3;
/** The form token the API handed out when the page opened, when it arrived, and how many milliseconds it must age before it is accepted. */
type FormTokenInfo = { token: string; minWaitMs: number; at: number };
const STEP_FIELDS: Record<Step, string[]> = {
  1: ['type', 'date', 'startTime', 'endTime', 'location', 'guestCount', 'notes'],
  2: ['name', 'phone', 'email'],
  3: []
};
@Component({ selector:'app-booking', standalone:true, imports:[ReactiveFormsModule,RouterLink,IconComponent,DateFieldComponent,QtyComponent,PhotoPipe], template: `
<header class="m-bar"><button type="button" class="m-back" (click)="back()" aria-label="Go back"><app-icon name="back" [size]="28"/></button><span></span><span></span></header>
<div class="container booking-wrap">
  @if(!api.cart().length){
    <div class="empty-state"><app-icon name="bag" [size]="44" [stroke]="1.6"/><h2>Your booking is empty</h2><p>Add a service first, then come back to enter your details.</p><a class="btn btn-pink btn-pill" routerLink="/services">Browse Services</a></div>
  } @else {
  <div class="booking-head"><h1>Booking Details</h1><p>Please provide your event information to complete your booking.</p></div>
  <ol class="stepper" aria-label="Booking steps">
    @for(s of steps; track s.n){
      <li [class.active]="step()===s.n" [class.done]="step()>s.n" [attr.aria-current]="step()===s.n?'step':null">
        <span class="step-dot">@if(step()>s.n){<app-icon name="check" [size]="16" [stroke]="3"/>}@else{{{s.n}}}</span><span class="step-label">{{s.label}}</span>
      </li>
      @if(s.n<3){<li class="step-line" [class.filled]="step()>s.n" aria-hidden="true"></li>}
    }
  </ol>
  <h2 class="step-title">{{steps[step()-1].label}}</h2>
  <form [formGroup]="form" (ngSubmit)="next()" novalidate>
    @if(step()===1){
      <div class="booking-grid">
        <section class="b-card b-fields">
          <div class="field m-full"><label for="f-type">Event Type <i>*</i></label><div class="select-wrap"><select id="f-type" formControlName="type">@for(e of eventTypes;track e){<option [value]="e">{{e}}</option>}</select><app-icon name="chevron-down" [size]="18"/></div></div>
          <div class="field m-full"><label>Event Date <i>*</i></label><app-date-field formControlName="date" [min]="today" label="Event date"/>@if(bad('date')){<small class="field-error">Please choose your event date.</small>}</div>
          <div class="field"><label for="f-start">Start Time <i>*</i></label><div class="select-wrap"><select id="f-start" formControlName="startTime">@for(t of times;track t){<option [value]="t">{{t}}</option>}</select><app-icon name="chevron-down" [size]="18"/></div></div>
          <div class="field"><label for="f-end">End Time <i>*</i></label><div class="select-wrap"><select id="f-end" formControlName="endTime">@for(t of times;track t){<option [value]="t">{{t}}</option>}</select><app-icon name="chevron-down" [size]="18"/></div></div>
          <div class="field full"><label for="f-loc">Event Location <i>*</i></label><input id="f-loc" formControlName="location" autocomplete="street-address" placeholder="e.g. 123 Main Street, Johannesburg"/>@if(bad('location')){<small class="field-error">Please enter where the event will take place.</small>}</div>
          <div class="field full kids-field"><label>Number of Kids (approx) <i>*</i></label><app-qty formControlName="guestCount" [editable]="true" [min]="0" [max]="50000" label="number of kids"/></div>
        </section>
        <section class="b-card b-notes">
          <label for="f-notes">Special Instructions (Optional)</label>
          <textarea id="f-notes" formControlName="notes" rows="8" maxlength="2000" placeholder="Tell us more about your event, venue access, setup requirements, etc."></textarea>
        </section>
      </div>
    }
    @if(step()===2){
      <div class="booking-grid">
        <section class="b-card b-fields">
          <div class="field full"><label for="f-name">Full Name <i>*</i></label><input id="f-name" formControlName="name" autocomplete="name" placeholder="Your full name"/>@if(bad('name')){<small class="field-error">Please enter your name.</small>}</div>
          <div class="field m-full"><label for="f-phone">Mobile Number <i>*</i></label><input id="f-phone" formControlName="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="e.g. 082 123 4567"/>@if(bad('phone')){<small class="field-error">Please enter a valid mobile number.</small>}</div>
          <div class="field m-full"><label for="f-email">Email Address <i>*</i></label><input id="f-email" formControlName="email" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com"/>@if(bad('email')){<small class="field-error">Please enter a valid email address.</small>}</div>
        </section>
        <section class="b-card b-summary">
          <h3>Your Booking</h3>
          @for(i of api.cart();track i.service.slug+'-'+i.mode){<div class="sum-item"><img [src]="i.service.image | photo:'sm'" [alt]="i.service.name"/><div><b>{{i.service.name}}</b><small>{{i.quantity}} × {{i.mode}}</small></div></div>}
          <p class="sum-note">No payment is needed to submit your request.</p>
        </section>
      </div>
    }
    @if(step()===3){
      <section class="b-card review">
        <h3>Your Booking</h3>
        @for(i of api.cart();track i.service.slug+'-'+i.mode){<div class="review-item"><img [src]="i.service.image | photo:'sm'" [alt]="i.service.name"/><div><b>{{i.service.name}}</b><small>{{i.quantity}} × {{i.mode}}</small></div><span>{{i.service.price===null?'Price on request':money(i.service.price*i.quantity)}}</span></div>}
        <div class="review-total"><span>Estimated Total</span><strong>{{api.totalKnown()?money(api.total()):'To be quoted'}}</strong></div>
        <div class="review-block"><div class="review-head"><h3>Event Details</h3><button type="button" class="link-btn" (click)="go(1)">Edit</button></div>
          <dl><dt>Event Type</dt><dd>{{v.type}}</dd><dt>Event Date</dt><dd>{{fmtDate(v.date)}}</dd><dt>Time</dt><dd>{{fmtRange(v.startTime,v.endTime)}}</dd><dt>Event Location</dt><dd>{{v.location}}</dd><dt>Number of Kids (approx)</dt><dd>{{v.guestCount}}</dd>@if(v.notes){<dt>Special Instructions</dt><dd>{{v.notes}}</dd>}</dl></div>
        <div class="review-block"><div class="review-head"><h3>Customer Details</h3><button type="button" class="link-btn" (click)="go(2)">Edit</button></div>
          <dl><dt>Full Name</dt><dd>{{v.name}}</dd><dt>Mobile Number</dt><dd>{{v.phone}}</dd><dt>Email Address</dt><dd>{{v.email}}</dd></dl></div>
        <p class="sum-note">Your booking will be pending until the owner confirms availability. No payment is needed to submit your request.</p>
      </section>
    }
    <div class="hp-field" aria-hidden="true"><label for="f-website">Website (leave this empty)</label><input id="f-website" formControlName="website" type="text" tabindex="-1" autocomplete="off"/></div>
    @if(error()){<div class="notice error" role="alert">{{error()}}</div>}
    <div class="step-actions">
      <button type="button" class="back-link" (click)="back()"><app-icon name="arrow-left" [size]="18" [stroke]="2.2"/> {{step()===1?'Back to Cart':'Back'}}</button>
      <button type="submit" class="btn btn-pink btn-lg" [disabled]="busy()">{{label()}}</button>
    </div>
  </form>
  }
</div>` })
export class BookingPageComponent {
  api=inject(BookingApiService); router=inject(Router); fb=inject(FormBuilder);
  eventTypes=EVENT_TYPES; times=TIME_SLOTS; today=todayIso(); money=formatMoney; fmtDate=formatDate; fmtRange=formatTimeRange;
  steps=[{n:1,label:'Event Details'},{n:2,label:'Customer Details'},{n:3,label:'Review & Submit'}] as const;
  step=signal<Step>(1); busy=signal(false); error=signal('');
  form=this.fb.nonNullable.group({
    type:[this.api.event().type,Validators.required],
    date:[this.api.event().date,Validators.required],
    startTime:[this.api.event().startTime,Validators.required],
    endTime:[this.api.event().endTime,Validators.required],
    location:[this.api.event().location,[Validators.required,Validators.minLength(5)]],
    guestCount:[this.api.event().guestCount,[Validators.min(0),Validators.max(50000)]],
    notes:[this.api.event().notes],
    name:['',[Validators.required,Validators.minLength(2)]],
    phone:['',[Validators.required,phoneValidator]],
    email:['',[Validators.required,Validators.email]],
    website:['']
  });
  /** Spam protection: asked for when the page opens (which also wakes a sleeping API), sent back with the request. */
  private tokenInfo:Promise<FormTokenInfo|null>|null=null;
  constructor(){
    if(this.api.cart().length)this.tokenInfo=this.requestToken();
    this.api.occasions$.subscribe(occasions=>{
      this.eventTypes=[...new Set([...occasions.map(o=>o.name),'Other'])];
      if(!this.eventTypes.includes(this.form.controls.type.value)){
        this.form.controls.type.setValue(this.eventTypes[0]||'Other');
      }
    });
  }
  get v(){return this.form.getRawValue();}
  label=computed(()=>this.busy()?'Submitting...':this.step()===1?'Next: Customer Details':this.step()===2?'Next: Review & Submit':'Submit Booking Request');
  bad(name:string):boolean{const c:AbstractControl|null=this.form.get(name);return !!c&&c.invalid&&(c.touched||c.dirty);}

  go(step:Step){this.error.set('');this.step.set(step);}
  back(){this.error.set('');if(this.step()===1){this.router.navigate(['/cart']);}else{this.step.set((this.step()-1) as Step);}}
  private stepValid():boolean{
    const names=STEP_FIELDS[this.step()];
    names.forEach(n=>this.form.get(n)?.markAsTouched());
    if(names.some(n=>this.form.get(n)?.invalid)){this.error.set('Please fill in all required fields correctly.');return false;}
    const v=this.v;
    if(this.step()===1){
      if(v.date<this.today){this.error.set('Please choose a date in the future.');return false;}
      if(v.startTime>=v.endTime){this.error.set('End time must be after start time.');return false;}
      const blocked=this.api.cart().find(i=>i.service.blockedDates?.includes(v.date));
      if(blocked){this.error.set(`${blocked.service.name} is not available on that date. Please choose another day.`);return false;}
    }
    return true;
  }
  next(){
    this.error.set('');
    if(!this.api.cart().length){this.error.set('Please add an item first.');return;}
    if(!this.stepValid())return;
    const v=this.v;
    if(this.step()===1){this.api.setEvent({type:v.type,date:v.date,startTime:v.startTime,endTime:v.endTime,location:v.location,guestCount:v.guestCount,notes:v.notes});this.step.set(2);return;}
    if(this.step()===2){this.step.set(3);return;}
    this.submit();
  }
  private submit(){
    if(this.busy())return;
    const v=this.v; const cart=this.api.cart();
    const body:BookingRequest={customer:{name:v.name.trim(),email:v.email.trim(),phone:v.phone.trim()},event:{type:v.type,date:v.date,startTime:v.startTime,endTime:v.endTime,location:v.location.trim(),guestCount:v.guestCount,notes:v.notes.trim()},items:cart.map(i=>({serviceId:i.service._id,quantity:i.quantity,mode:i.mode}))};
    this.busy.set(true);
    void this.send(body,cart,true);
  }
  /** Sends the request with its form token. If the API says the token was missing, too new or too old, it gets a fresh one and tries once more. */
  private async send(body:BookingRequest,cart:CartItem[],mayRetry:boolean):Promise<void>{
    let result:{reference:string};
    try{
      const token=await this.tokenForSending();
      result=await firstValueFrom(this.api.sendBooking({...body,website:this.v.website,...(token?{formToken:token}:{})}));
    }catch(e:any){
      if(mayRetry&&isRetryableTokenError(e)){this.tokenInfo=this.requestToken();return this.send(body,cart,false);}
      this.busy.set(false);this.error.set(bookingErrorMessage(e));return;
    }
    const snapshot:Booking={_id:'',reference:result.reference,customer:body.customer,event:body.event,items:cart.map(i=>({serviceId:i.service._id,name:i.service.name,quantity:i.quantity,mode:i.mode,unitPrice:i.service.price})),amount:this.api.totalKnown(cart)?this.api.total(cart):null,status:'pending',createdAt:new Date().toISOString()};
    this.api.rememberBooking(result.reference,body.customer.email,snapshot);
    this.api.clear();this.api.resetEvent();
    this.router.navigate(['/confirmation',result.reference],{state:{email:body.customer.email}});
  }
  private requestToken():Promise<FormTokenInfo|null>{
    return firstValueFrom(this.api.bookingFormToken()).then(t=>({token:t.token,minWaitMs:t.minWaitMs??3000,at:Date.now()})).catch(()=>null);
  }
  /** The token from when the page opened. People take longer than a few seconds to fill in three steps, so this normally returns at once. */
  private async tokenForSending():Promise<string|undefined>{
    let info=await (this.tokenInfo??=this.requestToken());
    if(!info)info=await (this.tokenInfo=this.requestToken());   // the first try failed (the service may have been asleep): ask once more
    if(!info)return undefined;                                   // an API that does not hand out tokens: send without one
    const wait=info.minWaitMs-(Date.now()-info.at);
    if(wait>0)await new Promise<void>(r=>setTimeout(r,wait+150));
    return info.token;
  }
}
