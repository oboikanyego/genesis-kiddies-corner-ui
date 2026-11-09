import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { BookingApiService } from './core/booking-api.service';
import { BackendConnectionService } from './core/backend-connection.service';
import { IconComponent } from './components/icon.component';
import { LogoComponent } from './components/logo.component';
@Component({
  selector: 'app-root', standalone: true,
  imports: [IonicModule, RouterOutlet, RouterLink, RouterLinkActive, IconComponent, LogoComponent],
  template: `
    <ion-app>
      <div #scrollHost class="site-scroll" role="region" aria-label="Page content" tabindex="0">
        <div class="app-frame" [class.admin-shell]="isAdmin()" [class.has-tabbar]="!isFlow() && !isAdmin()">
        <header class="site-header">
          <a routerLink="/" class="brand" aria-label="The Genesis Kiddies Corner home"><app-logo/></a>
          <nav class="desktop-links" aria-label="Main navigation">
            <a routerLink="/" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="active">Home</a>
            <a routerLink="/services" routerLinkActive="active">Services</a>
            <a routerLink="/about" routerLinkActive="active">About</a>
            <a routerLink="/gallery" routerLinkActive="active">Gallery</a>
            <a routerLink="/contact" routerLinkActive="active">Contact</a>
          </nav>
          <div class="header-right">
            @if (api.cart().length) { <a routerLink="/cart" class="header-cart" [attr.aria-label]="'Your booking, ' + api.cart().length + ' items'"><app-icon name="bag" [size]="22"/><span>{{api.cart().length}}</span></a> }
            <a routerLink="/services" class="btn btn-pink btn-pill top-book">Book Now</a>
          </div>
        </header>
        <main class="main-content"><router-outlet></router-outlet></main>
        <footer class="site-footer"><div class="container footer-inner"><span>© {{year}} The Genesis Kiddies Corner</span><span class="footer-links"><a routerLink="/services">Services</a><a routerLink="/my-bookings">My Bookings</a><a routerLink="/admin">Admin</a></span></div></footer>
        </div>
      </div>
      <nav class="mobile-nav" [class.admin-route-hidden]="isAdmin()" [class.flow-hidden]="isFlow()" aria-label="Mobile navigation">
          <a routerLink="/" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="selected"><app-icon name="home" [size]="24"/>Home</a>
          <a routerLink="/services" routerLinkActive="selected"><app-icon name="services" [size]="24"/>Services</a>
          <a routerLink="/my-bookings" routerLinkActive="selected"><app-icon name="bookings" [size]="24"/>Bookings</a>
          <a routerLink="/more" routerLinkActive="selected"><app-icon name="more" [size]="24"/>More @if (api.cart().length) { <i aria-hidden="true"></i> }</a>
        </nav>
      @if (connection.indicatorVisible()) {
        <section class="backend-connection-status" [class.backend-offline]="connection.status()==='offline'" [attr.role]="connection.status()==='offline' ? 'alert' : 'status'" aria-live="polite" aria-atomic="true">
          @if (connection.status()==='offline') {
            <span class="backend-connection-icon" aria-hidden="true"><app-icon name="refresh" [size]="20"/></span>
            <div class="backend-connection-copy">
              <strong>Booking service unavailable</strong>
              <span>We couldn't connect just now. You can still browse, but booking needs a connection.</span>
            </div>
            <button type="button" class="backend-retry-button" (click)="connection.retryConnection()">Try again</button>
          } @else {
            <span class="backend-connection-spinner" aria-hidden="true"></span>
            <div class="backend-connection-copy">
              <strong>Connecting to our booking service</strong>
              <span>It's waking up. You can browse while we get everything ready.</span>
            </div>
          }
        </section>
      }
    </ion-app>
  `
})
export class AppComponent {
  @ViewChild("scrollHost") private scrollHost?: ElementRef<HTMLDivElement>;
  api=inject(BookingApiService);
  connection=inject(BackendConnectionService);
  router=inject(Router);
  year = new Date().getFullYear();

  constructor() {
    // Wake Render on the first page load, without blocking static navigation.
    this.connection.start();
    // Our dedicated app scroller owns scroll position because Ionic fixes document/body.
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.scrollHost?.nativeElement.scrollTo(0, 0);
    });
  }

  // A hidden tab or unfocused window is not polled; check on return instead.
  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (document.hidden) this.connection.noteAway();
    else this.connection.onReturn();
  }

  @HostListener('window:blur')
  onWindowBlur(): void { this.connection.noteAway(); }

  @HostListener('window:focus')
  onWindowFocus(): void { this.connection.onReturn(); }

  @HostListener('window:pageshow')
  onPageShow(): void { this.connection.onReturn(); }

  isAdmin(): boolean { return this.router.url.startsWith('/admin'); }
  /** Booking-flow screens have their own back / next buttons, so the bottom tab bar is hidden there (as in the design). */
  isFlow(): boolean { return /^\/(cart|book|confirmation|services\/.+)/.test(this.router.url); }
}
