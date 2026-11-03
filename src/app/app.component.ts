import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BookingApiService } from './core/booking-api.service';
@Component({
  selector: 'app-root', standalone: true,
  imports: [IonicModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <ion-app>
      <div class="app-frame">
        <header class="site-header">
          <a routerLink="/" class="brand" aria-label="Genesis Kiddies Corner home">
            <span class="brand-crown">👑</span><span class="brand-title"><b>The <em>Genesis</em></b><small>Kiddies Corner</small></span>
          </a>
          <nav class="desktop-links" aria-label="Main navigation">
            <a routerLink="/" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="active">Home</a>
            <a routerLink="/services" routerLinkActive="active">Our Services</a>
            <a routerLink="/my-bookings" routerLinkActive="active">My Bookings</a>
            <a href="/#occasions">Occasions</a>
          </nav>
          <div class="header-right"><a routerLink="/cart" class="header-cart" aria-label="Open booking cart">🛍 <span>{{api.cart().length}}</span></a><a routerLink="/services" class="btn btn-pink top-book">Book Now <span>↗</span></a></div>
        </header>
        <main class="main-content"><router-outlet></router-outlet></main>
        <footer class="site-footer"><div class="container footer-inner"><div><strong>🎈 The Genesis Kiddies Corner</strong><p>Making every event extra special.</p></div><div><a routerLink="/services">Our Services</a><a routerLink="/my-bookings">Track a booking</a><a routerLink="/admin">Admin</a></div></div><div class="footer-copy">© 2026 The Genesis Kiddies Corner • Made with love for little celebrations</div></footer>
        <nav class="mobile-nav" aria-label="Mobile navigation">
          <a routerLink="/" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="selected"><span>⌂</span>Home</a>
          <a routerLink="/services" routerLinkActive="selected"><span>♧</span>Services</a>
          <a routerLink="/cart" routerLinkActive="selected"><span>▣</span>Cart @if (api.cart().length) { <i>{{api.cart().length}}</i> }</a>
          <a routerLink="/my-bookings" routerLinkActive="selected"><span>▤</span>Bookings</a>
        </nav>
      </div>
    </ion-app>
  `
})
export class AppComponent { api=inject(BookingApiService); router=inject(Router); }
