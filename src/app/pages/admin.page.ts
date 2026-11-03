import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BookingApiService } from '../core/booking-api.service';
import { Booking, BookingStatus, ServiceItem } from '../core/models';
@Component({selector:'app-admin',standalone:true,imports:[FormsModule,DatePipe,IonicModule],template:`
@if(!loggedIn()){
<div class="admin-login-wrap">
  <form class="surface-card admin-login" (ngSubmit)="login()" aria-label="Owner sign in">
    <div class="admin-login-icon" aria-hidden="true">🔐</div>
    <div class="eyebrow pink-text">OWNER'S SPACE</div>
    <h1>Welcome back!</h1>
    <p>Sign in to manage requests for The Genesis Kiddies Corner.</p>
    <label class="form-field"><span>Admin email</span><input name="email" [(ngModel)]="email" type="email" inputmode="email" autocomplete="username" autocapitalize="none" spellcheck="false" required placeholder="owner@example.com"/></label>
    <label class="form-field"><span>Password</span><input name="password" [(ngModel)]="password" type="password" autocomplete="current-password" required placeholder="Your password"/></label>
    @if(error()){<div class="notice error" role="alert">{{error()}}</div>}
    <button type="submit" class="btn btn-pink btn-full" [disabled]="busy()">{{busy()?'Signing in...':'Sign in →'}}</button>
  </form>
</div>
}@else{
<div class="admin-layout">
  <aside class="admin-sidebar" aria-label="Owner dashboard">
    <div class="admin-sidebar-heading">OWNER DASHBOARD</div>
    <div class="admin-mobile-heading">
      <div><span class="admin-mobile-eyebrow">OWNER WORKSPACE</span><strong>Manage your events</strong></div>
      <button type="button" class="admin-mobile-logout" (click)="logout()" aria-label="Sign out of admin dashboard">Sign out <span aria-hidden="true">↗</span></button>
    </div>
    <nav class="admin-tab-list" aria-label="Admin sections">
      <button type="button" class="admin-tab" [class.selected]="tab()==='overview'" [attr.aria-current]="tab()==='overview' ? 'page' : null" (click)="tab.set('overview');load()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/></svg><span>Overview</span></button>
      <button type="button" class="admin-tab" [class.selected]="tab()==='bookings'" [attr.aria-current]="tab()==='bookings' ? 'page' : null" (click)="tab.set('bookings');load()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4.5h11a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z"/><path d="M10 10h7M10 14h7M3 8v12"/></svg><span>Bookings</span></button>
      <button type="button" class="admin-tab" [class.selected]="tab()==='calendar'" [attr.aria-current]="tab()==='calendar' ? 'page' : null" (click)="tab.set('calendar');load()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 15h3v3H8z"/></svg><span>Calendar</span></button>
      <button type="button" class="admin-tab" [class.selected]="tab()==='services'" [attr.aria-current]="tab()==='services' ? 'page' : null" (click)="tab.set('services');load()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h16v10H4zM2 8h20v3H2zM12 8V20M12 8C5 8 5 2 9 2c2.5 0 3 3 3 6ZM12 8c7 0 7-6 3-6-2.5 0-3 3-3 6Z"/></svg><span>Services</span></button>
    </nav>
    <button type="button" class="admin-logout" (click)="logout()"><span aria-hidden="true">↪</span> Sign out</button>
  </aside>
<div class="admin-main"><div class="admin-topline"><div><small>THE GENESIS KIDDIES CORNER</small><h1>{{tab()==='overview'?'Dashboard':tab()==='bookings'?'Booking requests':tab()==='calendar'?'Event calendar':'Service management'}}</h1><p>Keep the smiles coming — one event at a time.</p></div><button class="btn btn-outline" (click)="load()">↻ Refresh</button></div>
@if(error()){<div class="notice error" role="alert">{{error()}}</div>}
@if(message()){<div class="notice success" role="status">{{message()}}</div>}
@if(tab()==='overview'){
  <div class="metric-grid"><div class="metric-card"><div class="metric-icon blue">▤</div><strong>{{stats()?.total??'—'}}</strong><small>Total bookings</small></div><div class="metric-card"><div class="metric-icon orange">◷</div><strong>{{stats()?.pending??'—'}}</strong><small>Pending review</small></div><div class="metric-card"><div class="metric-icon green">✓</div><strong>{{stats()?.confirmed??'—'}}</strong><small>Confirmed</small></div><div class="metric-card"><div class="metric-icon pink">★</div><strong>{{stats()?.completed??'—'}}</strong><small>Completed</small></div></div>
  <div class="admin-panels"><section class="surface-card"><div class="panel-header"><h2>Recent booking requests</h2><button class="text-action" (click)="tab.set('bookings');load()">View all →</button></div>
  @for(b of stats()?.recent||[];track b._id){<div class="admin-recent"><div class="recent-icon">🎉</div><div><b>{{b.event.type}}</b><small>{{b.customer?.name}} • {{b.event.date}} • {{b.items.length}} services</small></div><span class="status-chip" [class]="b.status">{{b.status}}</span></div>}@if(!stats()?.recent?.length){<p class="empty-admin">No bookings yet. New requests will show here.</p>}
  </section><section class="surface-card admin-help"><h2>Quick start ✨</h2><p>Before you launch, check these essentials:</p><div>✔ Confirm all seven services and images</div><div>✔ Set your own prices or keep quotes enabled</div><div>✔ Set your available stock and blocked dates</div><div>✔ Approve incoming booking requests</div><button class="btn btn-pink" (click)="tab.set('services');load()">Manage services →</button></section></div>
}
@if(tab()==='bookings'){
  <div class="surface-card admin-table-card"><div class="panel-header admin-table-heading"><div><h2>Booking requests</h2><p>Approve or decline incoming requests</p></div><select [(ngModel)]="filter" (change)="loadBookings()" aria-label="Filter bookings"><option value="">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="declined">Declined</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
  <div class="table-scroll"><table class="admin-table"><thead><tr><th>Booking</th><th>Customer</th><th>Event</th><th>Services</th><th>Status</th><th>Actions</th></tr></thead><tbody>
  @for(b of bookings();track b._id){<tr><td><b>{{b.reference}}</b><small>{{b.createdAt | date:'mediumDate'}}</small></td><td><b>{{b.customer?.name}}</b><small>{{b.customer?.email}}</small><small>{{b.customer?.phone}}</small></td><td><b>{{b.event.type}}</b><small>{{b.event.date}} {{b.event.startTime}}–{{b.event.endTime}}</small><small>{{b.event.location}}</small></td><td>@for(i of b.items;track i.serviceId){<small>{{i.quantity}}× {{i.name}} ({{i.mode}})</small>}</td><td><span class="status-chip" [class]="b.status">{{b.status}}</span></td><td><div class="table-actions">@if(b.status==='pending'){<button class="tiny-btn green-btn" (click)="setStatus(b,'confirmed')" [disabled]="busy()">Approve</button><button class="tiny-btn red-btn" (click)="setStatus(b,'declined')" [disabled]="busy()">Decline</button>}@if(b.status==='confirmed'){<button class="tiny-btn green-btn" (click)="setStatus(b,'completed')" [disabled]="busy()">Complete</button><button class="tiny-btn red-btn" (click)="setStatus(b,'cancelled')" [disabled]="busy()">Cancel</button>}</div></td></tr>}
  </tbody></table></div>@if(!bookings().length){<div class="empty-admin">No booking requests found.</div>}
  <div class="pagination"><button (click)="page.set(page()-1);loadBookings()" [disabled]="page()===1">← Previous</button><span>Page {{page()}} of {{pages()||1}}</span><button (click)="page.set(page()+1);loadBookings()" [disabled]="page()>=pages()">Next →</button></div>
  </div>
}
@if(tab()==='calendar'){
  <section class="surface-card calendar-panel" aria-label="Upcoming confirmed events">
    <div class="panel-header calendar-heading"><div><span class="calendar-kicker">YOUR SCHEDULE</span><h2>Upcoming events</h2><p>Confirmed bookings, sorted by event date</p></div><span class="calendar-count">{{calendarBookings().length}} shown</span></div>
    @for(b of calendarBookings(); track b._id){
      <article class="calendar-row">
        <div class="calendar-date"><strong>{{b.event.date.slice(8,10)}}</strong><span>{{monthLabel(b.event.date)}}</span></div>
        <div class="calendar-event"><strong>{{b.event.type}}</strong><small>{{b.customer?.name}}</small><small>{{b.event.startTime}}–{{b.event.endTime}} · {{b.event.location}}</small><small>@for(i of b.items; track i.serviceId){ {{i.quantity}}× {{i.name}} · }</small></div>
        <span class="status-chip confirmed">Confirmed</span>
      </article>
    }
    @if(!calendarBookings().length){
      <div class="calendar-empty">
        <div class="calendar-empty-art" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 15h3v3H8z"/></svg></div>
        <h3>No confirmed events yet</h3>
        <p>Once you approve an event booking, it will appear here. Check your requests to see what needs attention.</p>
        <button type="button" class="btn btn-pink" (click)="tab.set('bookings');load()">View booking requests <span aria-hidden="true">→</span></button>
      </div>
    }
  </section>
}
@if(tab()==='services'){
<div class="admin-services"><div class="admin-services-intro"><h2>Available services</h2><p>Control stock, pricing, availability and whether an item appears in the customer catalogue. Prices are optional.</p></div>
@for(item of services();track item._id){<article class="surface-card manage-service"><img [src]="item.image" [alt]="item.name"/><div class="manage-content"><div class="manage-title"><h3>{{item.name}}</h3><span class="category-tag">{{item.category}}</span></div><div class="manage-fields"><label><span>Price (R)</span><input type="number" min="0" [ngModel]="item.price" (ngModelChange)="item.price=$event===null||$event===''?null:+$event" placeholder="On request"/></label><label><span>Available stock</span><input type="number" min="1" [(ngModel)]="item.stock"/></label><div class="blocked-date-editor">
  <div class="blocked-date-heading"><span class="blocked-date-label">Blocked dates</span><span class="blocked-date-counter">{{item.blockedDates.length}} / 100</span></div>
  <button type="button" class="blocked-date-trigger" (click)="openBlockedDateCalendar(item)" [disabled]="item.blockedDates.length >= 100" [attr.aria-label]="'Open blocked dates calendar for ' + item.name">
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>
    <span>Choose blocked dates</span><span class="blocked-date-trigger-chevron" aria-hidden="true">›</span>
  </button>
  @if(item.blockedDates.length){
    <div class="blocked-date-chips" aria-label="Currently blocked dates">
      @for(blockedDate of item.blockedDates; track blockedDate){
        <span class="blocked-date-chip"><span>{{formatBlockedDate(blockedDate)}}</span><button type="button" (click)="removeBlockedDate(item,blockedDate)" [attr.aria-label]="'Remove blocked date ' + formatBlockedDate(blockedDate) + ' for ' + item.name" title="Remove blocked date">×</button></span>
      }
    </div>
  } @else {<div class="blocked-date-empty">No dates blocked for this service.</div>}
  <small class="blocked-date-help">Tap the calendar icon to select a day. Past and already blocked dates are disabled. Press <strong>Save changes</strong> to apply.</small>
</div></div><div class="manage-bottom"><label class="toggle-label"><input type="checkbox" [(ngModel)]="item.active"/> Show service to customers</label><button class="btn btn-pink" (click)="saveService(item)" [disabled]="busy()">Save changes →</button></div></div></article>}
</div>
  <ion-modal class="blocked-date-calendar-modal" [isOpen]="!!activeBlockedService()" (didDismiss)="closeBlockedDateCalendar()">
    <ng-template>
      <div class="blocked-date-modal-content">
        <div class="blocked-date-modal-header">
          <div><span class="blocked-date-modal-kicker">BLOCK DATES</span><h2>{{activeBlockedService()?.name}}</h2><p>Choose a date to make this service unavailable.</p></div>
          <button class="blocked-date-modal-close" type="button" (click)="closeBlockedDateCalendar()" aria-label="Close calendar">×</button>
        </div>
        <ion-datetime class="blocked-date-calendar" presentation="date" locale="en-ZA" [min]="todayIsoLocal()" [isDateEnabled]="isBlockedDateEnabled" [showDefaultButtons]="false" (ionChange)="onBlockedDatePicked($event.detail.value)"></ion-datetime>
        <p class="blocked-date-modal-hint">Grey days cannot be selected (past or already blocked).</p>
        <button class="blocked-date-modal-done" type="button" (click)="closeBlockedDateCalendar()">Done</button>
      </div>
    </ng-template>
  </ion-modal>

}
</div></div>
}`})
export class AdminPage {
  api=inject(BookingApiService); loggedIn=signal(this.api.loggedIn()); tab=signal<'overview'|'bookings'|'calendar'|'services'>('overview');
  email='';password='';error=signal('');message=signal('');busy=signal(false);
  stats=signal<{total:number;pending:number;confirmed:number;completed:number;declined:number;recent:Booking[]}|null>(null);
  bookings=signal<Booking[]>([]); calendarBookings=signal<Booking[]>([]); services=signal<ServiceItem[]>([]); filter=''; page=signal(1); pages=signal(1);
  constructor(){if(this.loggedIn())this.load();}
  login(){this.busy.set(true);this.error.set('');this.api.login(this.email,this.password).subscribe({next:()=>{this.busy.set(false);this.loggedIn.set(true);this.password='';this.load();},error:e=>{this.busy.set(false);this.error.set(e.error?.message||'Unable to sign in. Check the API connection.');}});}
  logout(){this.api.logout();this.loggedIn.set(false);this.password='';}
  load(){this.error.set('');this.message.set('');if(this.tab()==='overview')this.api.adminStats().subscribe({next:r=>this.stats.set(r),error:e=>this.handleError(e)});if(this.tab()==='bookings')this.loadBookings();if(this.tab()==='calendar')this.api.adminBookings('confirmed',1).subscribe({next:r=>this.calendarBookings.set([...r.items].sort((a,b)=>a.event.date.localeCompare(b.event.date))),error:e=>this.handleError(e)});if(this.tab()==='services')this.api.adminServices().subscribe({next:r=>this.services.set(r),error:e=>this.handleError(e)});}
  loadBookings(){this.api.adminBookings(this.filter||undefined,this.page()).subscribe({next:r=>{this.bookings.set(r.items);this.pages.set(r.pages);},error:e=>this.handleError(e)});}
  setStatus(b:Booking,status:BookingStatus){this.busy.set(true);this.error.set('');this.api.adminUpdate(b._id,status).subscribe({next:()=>{this.busy.set(false);this.message.set(`${b.reference} marked ${status}.`);this.loadBookings();},error:e=>{this.busy.set(false);this.handleError(e);}});}
  monthLabel(date:string):string {return new Date(`${date}T12:00:00`).toLocaleDateString('en-ZA',{month:'short'});}
  activeBlockedService = signal<ServiceItem | null>(null);

  todayIsoLocal(): string {
    const now = new Date();
    return [now.getFullYear(), String(now.getMonth() + 1).padStart(2,'0'), String(now.getDate()).padStart(2,'0')].join('-');
  }

  isBlockedDateEnabled = (isoDate: string): boolean => {
    const item = this.activeBlockedService();
    const day = isoDate.slice(0,10);
    return !!item && day >= this.todayIsoLocal() && !item.blockedDates.includes(day);
  };

  openBlockedDateCalendar(item: ServiceItem): void {
    if (item.blockedDates.length >= 100) {
      this.error.set('You can block up to 100 dates per service.');
      return;
    }
    this.activeBlockedService.set(item);
  }

  closeBlockedDateCalendar(): void {
    this.activeBlockedService.set(null);
  }

  onBlockedDatePicked(value: string | string[] | null | undefined): void {
    const item = this.activeBlockedService();
    const date = typeof value === 'string' ? value.slice(0,10) : '';
    if (!item || !date) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !this.isBlockedDateEnabled(date)) {
      this.error.set('Select a future date that has not already been blocked.');
      return;
    }
    if (item.blockedDates.length >= 100) {
      this.error.set('You can block up to 100 dates per service.');
      return;
    }
    item.blockedDates = [...item.blockedDates, date].sort();
    this.error.set('');
    this.closeBlockedDateCalendar();
  }

  removeBlockedDate(item: ServiceItem, date: string): void {
    item.blockedDates = item.blockedDates.filter(blocked => blocked !== date);
  }

  formatBlockedDate(date: string): string {
    const parsed = new Date(date + 'T12:00:00');
    return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  saveService(s:ServiceItem){this.busy.set(true);this.error.set('');this.api.adminSave(s).subscribe({next:r=>{this.busy.set(false);this.message.set(`${r.name} updated successfully.`);},error:e=>{this.busy.set(false);this.handleError(e);}});}
  handleError(e:any){if(e.status===401){this.api.logout();this.loggedIn.set(false);this.error.set('Your session has expired. Please sign in again.');return;}this.error.set(e.error?.message||'Something went wrong. Please try again.');}
}
