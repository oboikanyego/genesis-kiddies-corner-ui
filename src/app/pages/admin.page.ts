import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BookingApiService } from '../core/booking-api.service';
import { AdminStats, Booking, BookingStatus, ContactDetails, EMPTY_CONTACT, ServiceItem } from '../core/models';
import { contactFieldErrors } from '../core/contact';
import { formatDate, formatMoney, formatWhen, statusLabel, todayIso } from '../core/format';
import { servicePhotoFor } from '../core/service-photos';
import { environment } from '../../environments/environment';
import { IconComponent } from '../components/icon.component';
import { LogoComponent } from '../components/logo.component';
import { MonthCalendarComponent } from '../components/month-calendar.component';
import { PhotoPipe } from '../components/photo.pipe';

type AdminTab = 'dashboard' | 'bookings' | 'calendar' | 'services' | 'settings';
const TAB_TITLES: Record<AdminTab, string> = { dashboard: 'Dashboard', bookings: 'Bookings', calendar: 'Calendar', services: 'Services', settings: 'Settings' };

@Component({selector:'app-admin',standalone:true,imports:[FormsModule,DatePipe,RouterLink,IonicModule,IconComponent,LogoComponent,MonthCalendarComponent,PhotoPipe],template:`
@if(!loggedIn()){
<div class="admin-login-wrap">
  <form class="surface-card admin-login" (ngSubmit)="login()" aria-label="Owner sign in">
    <div class="admin-login-icon" aria-hidden="true"><img src="/assets/images/brand/icon-120.webp" alt="" width="60" height="60"/></div>
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
    <a class="admin-brand" routerLink="/" aria-label="Back to the website"><app-logo [large]="true"/></a>
    <nav class="admin-tab-list" aria-label="Admin sections">
      <button type="button" class="admin-tab" [class.selected]="tab()==='dashboard'" [attr.aria-current]="tab()==='dashboard' ? 'page' : null" (click)="go('dashboard')"><app-icon name="dashboard" [size]="21"/><span>Dashboard</span></button>
      <button type="button" class="admin-tab" [class.selected]="tab()==='bookings'" [attr.aria-current]="tab()==='bookings' ? 'page' : null" (click)="go('bookings')"><app-icon name="bookings" [size]="21"/><span>Bookings</span></button>
      <button type="button" class="admin-tab" [class.selected]="tab()==='calendar'" [attr.aria-current]="tab()==='calendar' ? 'page' : null" (click)="go('calendar')"><app-icon name="calendar" [size]="21"/><span>Calendar</span></button>
      <button type="button" class="admin-tab" [class.selected]="tab()==='services'" [attr.aria-current]="tab()==='services' ? 'page' : null" (click)="go('services')"><app-icon name="services" [size]="21"/><span>Services</span></button>
      <button type="button" class="admin-tab" [class.selected]="tab()==='settings'" [attr.aria-current]="tab()==='settings' ? 'page' : null" (click)="go('settings')"><app-icon name="settings" [size]="21"/><span>Settings</span></button>
    </nav>
    <button type="button" class="admin-logout" (click)="logout()"><app-icon name="logout" [size]="21"/><span>Logout</span></button>
  </aside>
  <div class="admin-main">
    <header class="admin-topbar">
      <h1>{{title()}}</h1>
      <div class="admin-topbar-actions">
        <button type="button" class="icon-btn" (click)="load()" aria-label="Refresh"><app-icon name="refresh" [size]="20"/></button>
        <div class="admin-user">
          <button type="button" class="admin-user-btn" (click)="menuOpen.set(!menuOpen())" [attr.aria-expanded]="menuOpen()" aria-haspopup="menu"><app-icon name="user" [size]="20"/><span>Admin</span><app-icon name="chevron-down" [size]="16"/></button>
          @if(menuOpen()){<div class="user-menu" role="menu"><button type="button" role="menuitem" (click)="go('settings');menuOpen.set(false)">Settings</button><button type="button" role="menuitem" (click)="logout()">Sign out</button></div>}
        </div>
      </div>
    </header>
    <div class="admin-content">
    @if(error()){<div class="notice error" role="alert">{{error()}}</div>}
    @if(message()){<div class="notice success" role="status">{{message()}}</div>}

    @if(tab()==='dashboard'){
      <div class="stat-grid">
        <div class="stat-tile tone-blue"><strong>{{stats()?.total??'—'}}</strong><span>Total Bookings</span></div>
        <div class="stat-tile tone-orange"><strong>{{stats()?.pending??'—'}}</strong><span>Pending</span></div>
        <div class="stat-tile tone-green"><strong>{{stats()?.confirmed??'—'}}</strong><span>Confirmed</span></div>
        <div class="stat-tile tone-pink"><strong>{{stats()?(stats()!.cancelled??0):'—'}}</strong><span>Cancelled</span></div>
      </div>
      <div class="dash-grid">
        <section class="panel" aria-labelledby="upcoming-title">
          <h2 id="upcoming-title">Upcoming Bookings</h2>
          @for(b of upcoming();track b._id){
            <div class="up-row">
              <div class="up-text"><b>{{b.event.type}}</b><small>{{when(b)}}</small><small>{{b.event.location}}</small></div>
              <div class="up-side"><span class="chip chip-{{b.status}}">{{label(b.status)}}</span><button type="button" class="btn-view" (click)="selected.set(b)">View</button></div>
            </div>
          }
          @if(!upcoming().length){<p class="empty-admin">No upcoming bookings. New requests will show here.</p>}
        </section>
        <section class="panel" aria-labelledby="cal-title">
          <h2 id="cal-title">Calendar</h2>
          <app-month-calendar [month]="calMonth()" [items]="calItems()" [selected]="calSelected()" (prev)="shiftMonth(-1)" (next)="shiftMonth(1)" (pick)="pickDay($event, true)"/>
        </section>
      </div>
    }

    @if(tab()==='bookings'){
      <div class="panel admin-table-card"><div class="panel-header admin-table-heading"><div><h2>Booking requests</h2><p>Approve or decline incoming requests</p></div><select [(ngModel)]="filter" (change)="page.set(1);loadBookings()" aria-label="Filter bookings"><option value="">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="declined">Declined</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
      <div class="table-scroll"><table class="admin-table"><thead><tr><th>Booking</th><th>Customer</th><th>Event</th><th>Services</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      @for(b of bookings();track b._id){<tr><td><b>{{b.reference}}</b><small>{{b.createdAt | date:'mediumDate'}}</small></td><td><b>{{b.customer?.name}}</b><small>{{b.customer?.email}}</small><small>{{b.customer?.phone}}</small></td><td><b>{{b.event.type}}</b><small>{{when(b)}}</small><small>{{b.event.location}}</small></td><td>@for(i of b.items;track i.serviceId){<small>{{i.quantity}}× {{i.name}} ({{i.mode}})</small>}</td><td><span class="chip chip-{{b.status}}">{{label(b.status)}}</span></td><td><div class="table-actions"><button class="tiny-btn view-btn" (click)="selected.set(b)">View</button>@if(b.status==='pending'){<button class="tiny-btn green-btn" (click)="setStatus(b,'confirmed')" [disabled]="busy()">Approve</button><button class="tiny-btn red-btn" (click)="setStatus(b,'declined')" [disabled]="busy()">Decline</button>}@if(b.status==='confirmed'){<button class="tiny-btn green-btn" (click)="setStatus(b,'completed')" [disabled]="busy()">Complete</button><button class="tiny-btn red-btn" (click)="setStatus(b,'cancelled')" [disabled]="busy()">Cancel</button>}</div></td></tr>}
      </tbody></table></div>@if(!bookings().length){<div class="empty-admin">No booking requests found.</div>}
      <div class="pagination"><button (click)="page.set(page()-1);loadBookings()" [disabled]="page()===1">← Previous</button><span>Page {{page()}} of {{pages()||1}}</span><button (click)="page.set(page()+1);loadBookings()" [disabled]="page()>=pages()">Next →</button></div>
      </div>
    }

    @if(tab()==='calendar'){
      <div class="cal-page">
        <section class="panel" aria-label="Month calendar">
          <app-month-calendar [month]="calMonth()" [items]="calItems()" [selected]="calSelected()" (prev)="shiftMonth(-1)" (next)="shiftMonth(1)" (pick)="pickDay($event, false)"/>
        </section>
        <section class="panel" aria-label="Events">
          <div class="panel-header"><h2>{{calSelected()?dayLabel(calSelected()!):'This month'}}</h2><span class="calendar-count">{{shownEvents().length}} {{shownEvents().length===1?'booking':'bookings'}}</span></div>
          @for(b of shownEvents();track b._id){
            <article class="calendar-row">
              <div class="calendar-date"><strong>{{b.event.date.slice(8,10)}}</strong><span>{{monthLabel(b.event.date)}}</span></div>
              <div class="calendar-event"><strong>{{b.event.type}}</strong><small>{{b.customer?.name}}</small><small>{{b.event.startTime}}–{{b.event.endTime}} · {{b.event.location}}</small></div>
              <div class="up-side"><span class="chip chip-{{b.status}}">{{label(b.status)}}</span><button type="button" class="btn-view" (click)="selected.set(b)">View</button></div>
            </article>
          }
          @if(!shownEvents().length){
            <div class="calendar-empty">
              <div class="calendar-empty-art" aria-hidden="true"><app-icon name="calendar" [size]="34"/></div>
              <h3>No bookings {{calSelected()?'on this day':'this month'}}</h3>
              <p>Booking requests with an event date in this month will appear here. Check your requests to see what needs attention.</p>
              <button type="button" class="btn btn-pink" (click)="go('bookings')">View booking requests <span aria-hidden="true">→</span></button>
            </div>
          }
        </section>
      </div>
    }

    @if(tab()==='services'){
    <div class="admin-services"><div class="admin-services-intro"><h2>Available services</h2><p>Control stock, pricing, availability and whether an item appears in the customer catalogue. Prices are optional.</p></div>
    @for(item of services();track item._id){<article class="panel manage-service"><img [src]="photo(item) | photo:'sm'" [alt]="item.name"/><div class="manage-content"><div class="manage-title"><h3>{{item.name}}</h3><span class="category-tag">{{item.category}}</span></div><div class="manage-fields"><label><span>Price (R)</span><input type="number" min="0" [ngModel]="item.price" (ngModelChange)="item.price=$event===null||$event===''?null:+$event" placeholder="On request"/></label><label><span>Available stock</span><input type="number" min="1" [(ngModel)]="item.stock"/></label><div class="blocked-date-editor">
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

    @if(tab()==='settings'){
      <section class="panel settings-panel" aria-labelledby="contact-title">
        <h2 id="contact-title">Contact details</h2>
        <p class="panel-help">Customers see these on the website's Contact page. Leave a box empty to hide it.</p>
        <form class="contact-form" (ngSubmit)="saveContact()" novalidate aria-labelledby="contact-title">
          @for(f of contactFields;track f.key){
            <div class="field">
              <label [attr.for]="'contact-'+f.key">{{f.label}}</label>
              <input [id]="'contact-'+f.key" [name]="f.key" [(ngModel)]="contact[f.key]" [type]="f.type" [attr.inputmode]="f.mode" autocomplete="off" autocapitalize="none" spellcheck="false" [attr.maxlength]="f.max" [placeholder]="f.placeholder" [disabled]="!contactLoaded()" [attr.aria-invalid]="contactErrors()[f.key]?'true':null" [attr.aria-describedby]="contactErrors()[f.key]?'contact-'+f.key+'-error':(f.help?'contact-'+f.key+'-help':null)"/>
              @if(contactErrors()[f.key]){<small class="field-error" [id]="'contact-'+f.key+'-error'" role="alert">{{contactErrors()[f.key]}}</small>}
              @else if(f.help){<small class="field-help" [id]="'contact-'+f.key+'-help'">{{f.help}}</small>}
            </div>
          }
          <div class="contact-actions"><button type="submit" class="btn btn-pink" [disabled]="busy()||!contactLoaded()">{{busy()?'Saving…':'Save contact details'}}</button><a routerLink="/contact" target="_blank" rel="noopener" class="btn btn-outline">View the Contact page</a></div>
          @if(contactStatus(); as st){<p class="notice contact-note" [class.success]="st.ok" [class.error]="!st.ok" [attr.role]="st.ok?'status':'alert'">{{st.text}}</p>}
        </form>
      </section>
      <section class="panel settings-panel">
        <h2>Your account</h2>
        <dl class="settings-list"><dt>Signed in as</dt><dd>{{adminEmail()||'Owner'}}</dd><dt>Session</dt><dd>You are signed out automatically after 8 hours.</dd><dt>Booking service</dt><dd>{{apiUrl}}</dd></dl>
        <button type="button" class="btn btn-outline" (click)="logout()"><app-icon name="logout" [size]="18"/> Sign out</button>
      </section>
    }
    </div>
  </div>

  @if(selected(); as b){
    <div class="dialog-backdrop" (click)="selected.set(null)"></div>
    <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
      <header class="dialog-head">
        <div><small>Booking Reference</small><h2 id="dlg-title" tabindex="-1">{{b.reference}}</h2></div>
        <span class="chip chip-{{b.status}}">{{label(b.status)}}</span>
        <button type="button" class="icon-btn" (click)="selected.set(null)" aria-label="Close details"><app-icon name="close" [size]="20"/></button>
      </header>
      <dl class="dialog-grid">
        <dt>Customer</dt><dd><b>{{b.customer?.name}}</b><small>{{b.customer?.email}}</small><small>{{b.customer?.phone}}</small></dd>
        <dt>Event</dt><dd><b>{{b.event.type}}</b><small>{{when(b)}}</small></dd>
        <dt>Location</dt><dd>{{b.event.location}}</dd>
        <dt>Number of Kids (approx)</dt><dd>{{b.event.guestCount}}</dd>
        @if(b.event.notes){<dt>Special Instructions</dt><dd>{{b.event.notes}}</dd>}
      </dl>
      <h3>Booked items</h3>
      @for(i of b.items;track i.serviceId+i.mode){<div class="dialog-item"><span>{{i.quantity}} × {{i.name}} <small>({{i.mode}})</small></span><span>{{i.unitPrice===null?'Price on request':money(i.unitPrice*i.quantity)}}</span></div>}
      <div class="dialog-item dialog-total"><span>Estimated Total</span><strong>{{b.amount===null?'To be quoted':money(b.amount)}}</strong></div>
      <footer class="dialog-actions">
        @if(b.status==='pending'){<button class="btn btn-pink" (click)="setStatus(b,'confirmed')" [disabled]="busy()">Approve</button><button class="btn btn-outline" (click)="setStatus(b,'declined')" [disabled]="busy()">Decline</button>}
        @if(b.status==='confirmed'){<button class="btn btn-pink" (click)="setStatus(b,'completed')" [disabled]="busy()">Mark complete</button><button class="btn btn-outline" (click)="setStatus(b,'cancelled')" [disabled]="busy()">Cancel booking</button>}
        <button class="btn btn-outline" (click)="selected.set(null)">Close</button>
      </footer>
    </section>
  }
</div>
}`})
export class AdminPage {
  api=inject(BookingApiService); loggedIn=signal(this.api.loggedIn()); tab=signal<AdminTab>('dashboard');
  email='';password='';error=signal('');message=signal('');busy=signal(false);menuOpen=signal(false);
  stats=signal<AdminStats|null>(null);
  /** Settings > Contact details: the four boxes, what is wrong with each (from the API), and the result of the last save. */
  contact:ContactDetails={...EMPTY_CONTACT};contactLoaded=signal(false);
  contactErrors=signal<Partial<Record<keyof ContactDetails,string>>>({});
  contactStatus=signal<{ok:boolean;text:string}|null>(null);
  contactFields:{key:keyof ContactDetails;label:string;type:string;mode:string;placeholder:string;max:number;help?:string}[]=[
    {key:'phone',label:'Phone number',type:'tel',mode:'tel',placeholder:'e.g. 082 123 4567',max:25},
    {key:'whatsapp',label:'WhatsApp number',type:'tel',mode:'tel',placeholder:'e.g. 082 123 4567',max:25,help:'The Contact page links to a WhatsApp chat with this number.'},
    {key:'email',label:'Email address',type:'email',mode:'email',placeholder:'e.g. hello@yourbusiness.co.za',max:180},
    {key:'area',label:'Area we serve',type:'text',mode:'text',placeholder:'e.g. Johannesburg and surrounds',max:120}
  ];
  bookings=signal<Booking[]>([]); services=signal<ServiceItem[]>([]); filter=''; page=signal(1); pages=signal(1);
  calMonth=signal(todayIso().slice(0,7)); calItems=signal<Booking[]>([]); calSelected=signal<string|null>(null);
  selected=signal<Booking|null>(null);
  apiUrl=environment.apiUrl; money=formatMoney; label=statusLabel;
  title=computed(()=>TAB_TITLES[this.tab()]);
  /** Next events still to happen. Older API versions do not send this list, so work it out from the recent bookings. */
  upcoming=computed<Booking[]>(()=>{
    const s=this.stats(); if(!s)return [];
    if(s.upcoming)return s.upcoming;
    const today=todayIso();
    return s.recent.filter(b=>(b.status==='pending'||b.status==='confirmed')&&b.event.date>=today).sort((a,b)=>a.event.date.localeCompare(b.event.date)).slice(0,5);
  });
  /** Calendar tab list: the chosen day, or the whole month. */
  shownEvents=computed(()=>{const day=this.calSelected();return day?this.calItems().filter(b=>b.event.date===day):this.calItems();});
  constructor(){if(this.loggedIn())this.load();}

  @HostListener('document:keydown.escape') onEscape(){if(this.selected())this.selected.set(null);else if(this.menuOpen())this.menuOpen.set(false);}
  go(tab:AdminTab){this.tab.set(tab);this.menuOpen.set(false);this.load();}
  login(){this.busy.set(true);this.error.set('');this.api.login(this.email,this.password).subscribe({next:()=>{this.busy.set(false);this.loggedIn.set(true);this.password='';this.load();},error:e=>{this.busy.set(false);this.error.set(e.error?.message||'Unable to sign in. Check the API connection.');}});}
  logout(){this.api.logout();this.loggedIn.set(false);this.password='';this.menuOpen.set(false);this.selected.set(null);this.contactLoaded.set(false);}
  adminEmail():string{
    try{const token=sessionStorage.getItem('gkc_admin_token');if(!token)return '';return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).email||'';}catch{return '';}
  }
  load(keepMessage=false){
    this.error.set('');if(!keepMessage)this.message.set('');
    const tab=this.tab();
    if(tab==='dashboard'){this.api.adminStats().subscribe({next:r=>this.stats.set(r),error:e=>this.handleError(e)});this.loadCalendar();}
    if(tab==='bookings')this.loadBookings();
    if(tab==='calendar')this.loadCalendar();
    if(tab==='services')this.api.adminServices().subscribe({next:r=>this.services.set(r),error:e=>this.handleError(e)});
    if(tab==='settings')this.loadContact();
  }
  loadBookings(){this.api.adminBookings(this.filter||undefined,this.page()).subscribe({next:r=>{this.bookings.set(r.items);this.pages.set(r.pages);},error:e=>this.handleError(e)});}
  loadCalendar(){
    const month=this.calMonth();
    this.api.adminCalendar(month).subscribe({
      next:r=>this.calItems.set(r.items),
      error:e=>{
        if(e.status!==404){this.handleError(e);return;}
        // An older API without the calendar endpoint: use the latest bookings instead.
        this.api.adminBookings(undefined,1).subscribe({next:r=>this.calItems.set(r.items.filter(b=>b.event.date.startsWith(month)&&b.status!=='declined')),error:err=>this.handleError(err)});
      }
    });
  }
  shiftMonth(delta:number){
    const [y,m]=this.calMonth().split('-').map(Number);
    const d=new Date(y,m-1+delta,1);
    this.calMonth.set(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
    this.calSelected.set(null);this.calItems.set([]);this.loadCalendar();
  }
  pickDay(date:string,openCalendarTab:boolean){
    this.calSelected.set(this.calSelected()===date&&!openCalendarTab?null:date);
    if(openCalendarTab)this.go('calendar');
  }
  dayLabel(date:string):string{return formatDate(date);}
  setStatus(b:Booking,status:BookingStatus){
    this.busy.set(true);this.error.set('');
    this.api.adminUpdate(b._id,status).subscribe({
      next:updated=>{this.busy.set(false);this.message.set(`${b.reference} marked ${status}.`);if(this.selected()?._id===b._id)this.selected.set({...b,...updated});this.load(true);},
      error:e=>{this.busy.set(false);this.handleError(e);}
    });
  }
  when(b:Booking):string{return formatWhen(b.event);}
  photo(item:ServiceItem):string{return servicePhotoFor(item);}
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
  loadContact(){
    this.contactErrors.set({});this.contactStatus.set(null);
    this.api.adminSettings().subscribe({next:r=>{this.contact={...EMPTY_CONTACT,...r};this.contactLoaded.set(true);},error:e=>this.handleError(e)});
  }
  saveContact(){
    if(!this.contactLoaded()||this.busy())return;
    this.busy.set(true);this.error.set('');this.message.set('');this.contactErrors.set({});this.contactStatus.set(null);
    this.api.adminSaveSettings({...this.contact}).subscribe({
      next:saved=>{this.busy.set(false);this.contact={...EMPTY_CONTACT,...saved};this.showContactStatus({ok:true,text:"Saved. These details now show on the website's Contact page."});},
      error:e=>{this.busy.set(false);this.contactFailed(e);}
    });
  }
  /** The API names what is wrong with each box (errors.fieldErrors): show it beside that box and put the cursor there. */
  contactFailed(e:any){
    const errors=contactFieldErrors(e);
    const firstKey=this.contactFields.find(f=>errors[f.key])?.key;
    if(firstKey){this.contactErrors.set(errors);this.contactStatus.set({ok:false,text:'Not saved yet. Please check the highlighted boxes.'});setTimeout(()=>document.getElementById('contact-'+firstKey)?.focus());return;}
    if(e?.status===401){this.handleError(e);return;}
    this.showContactStatus({ok:false,text:e?.error?.message||'Could not save. Check your connection and try again.'});
  }
  /** Shows the result of a save and scrolls it into view: on a phone it would otherwise sit below the buttons, behind the bottom bar. */
  showContactStatus(status:{ok:boolean;text:string}){this.contactStatus.set(status);setTimeout(()=>document.querySelector('.contact-note')?.scrollIntoView({block:'nearest'}));}
  saveService(s:ServiceItem){this.busy.set(true);this.error.set('');this.api.adminSave(s).subscribe({next:r=>{this.busy.set(false);this.message.set(`${r.name} updated successfully.`);},error:e=>{this.busy.set(false);this.handleError(e);}});}
  handleError(e:any){if(e.status===401){this.api.logout();this.loggedIn.set(false);this.error.set('Your session has expired. Please sign in again.');return;}this.error.set(e.error?.message||'Something went wrong. Please try again.');}
}
