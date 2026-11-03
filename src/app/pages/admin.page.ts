import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingApiService } from '../core/booking-api.service';
import { Booking, BookingStatus, ServiceItem } from '../core/models';
@Component({selector:'app-admin',standalone:true,imports:[FormsModule,DatePipe],template:`
@if(!loggedIn()){
<div class="admin-login-wrap"><form class="surface-card admin-login" (ngSubmit)="login()"><div class="admin-login-icon">🔐</div><div class="eyebrow pink-text">OWNER'S SPACE</div><h1>Welcome back!</h1><p>Sign in to manage requests for The Genesis Kiddies Corner.</p><label class="form-field"><span>Admin email</span><input name="email" [(ngModel)]="email" type="email" required placeholder="owner@example.com"/></label><label class="form-field"><span>Password</span><input name="password" [(ngModel)]="password" type="password" required placeholder="Your password"/></label>@if(error()){<div class="notice error" role="alert">{{error()}}</div>}<button class="btn btn-pink btn-full" [disabled]="busy()">{{busy()?'Signing in...':'Sign in →'}}</button></form></div>
}@else{
<div class="admin-layout"><aside class="admin-sidebar"><div class="admin-sidebar-heading">OWNER DASHBOARD</div><button [class.selected]="tab()==='overview'" (click)="tab.set('overview');load()">▦ <span>Overview</span></button><button [class.selected]="tab()==='bookings'" (click)="tab.set('bookings');load()">▤ <span>Bookings</span></button><button [class.selected]="tab()==='calendar'" (click)="tab.set('calendar');load()">▦ <span>Calendar</span></button><button [class.selected]="tab()==='services'" (click)="tab.set('services');load()">🎈 <span>Manage services</span></button><button class="admin-logout" (click)="logout()">↪ <span>Sign out</span></button></aside>
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
  <section class="surface-card calendar-panel"><div class="panel-header"><div><h2>Upcoming events</h2><p>Confirmed bookings, sorted by event date</p></div></div>
  @for(b of calendarBookings(); track b._id){<article class="calendar-row"><div class="calendar-date"><strong>{{b.event.date.slice(8,10)}}</strong><span>{{monthLabel(b.event.date)}}</span></div><div class="calendar-event"><strong>{{b.event.type}} · {{b.customer?.name}}</strong><small>{{b.event.startTime}}–{{b.event.endTime}} · {{b.event.location}}</small><small>@for(i of b.items; track i.serviceId){ {{i.quantity}}× {{i.name}} · }</small></div><span class="status-chip confirmed">Confirmed</span></article>}
  @if(!calendarBookings().length){<p class="empty-admin">No confirmed events in the current page. Check bookings for more.</p>}
  </section>
}
@if(tab()==='services'){
<div class="admin-services"><div class="admin-services-intro"><h2>Available services</h2><p>Control stock, pricing, availability and whether an item appears in the customer catalogue. Prices are optional.</p></div>
@for(item of services();track item._id){<article class="surface-card manage-service"><img [src]="item.image" [alt]="item.name"/><div class="manage-content"><div class="manage-title"><h3>{{item.name}}</h3><span class="category-tag">{{item.category}}</span></div><div class="manage-fields"><label><span>Price (R)</span><input type="number" min="0" [ngModel]="item.price" (ngModelChange)="item.price=$event===null||$event===''?null:+$event" placeholder="On request"/></label><label><span>Available stock</span><input type="number" min="1" [(ngModel)]="item.stock"/></label><label><span>Blocked dates (comma separated)</span><input [ngModel]="item.blockedDates.join(', ')" (ngModelChange)="item.blockedDates=parseDates($event)" placeholder="YYYY-MM-DD, YYYY-MM-DD"/></label></div><div class="manage-bottom"><label class="toggle-label"><input type="checkbox" [(ngModel)]="item.active"/> Show service to customers</label><button class="btn btn-pink" (click)="saveService(item)" [disabled]="busy()">Save changes →</button></div></div></article>}
</div>
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
  parseDates(value:string):string[]{return value.split(',').map(x=>x.trim()).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x));}
  saveService(s:ServiceItem){this.busy.set(true);this.error.set('');this.api.adminSave(s).subscribe({next:r=>{this.busy.set(false);this.message.set(`${r.name} updated successfully.`);},error:e=>{this.busy.set(false);this.handleError(e);}});}
  handleError(e:any){if(e.status===401){this.api.logout();this.loggedIn.set(false);this.error.set('Your session has expired. Please sign in again.');return;}this.error.set(e.error?.message||'Something went wrong. Please try again.');}
}
