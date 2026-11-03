import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingApiService } from '../core/booking-api.service';
import { ServiceCardComponent } from '../components/service-card.component';
@Component({ selector:'app-home', standalone:true, imports:[AsyncPipe,RouterLink,ServiceCardComponent], template: `
<section class="home-hero"><div class="container hero-inner">
  <div class="hero-copy"><div class="eyebrow"><span>✦</span> THE HAPPY PLACE FOR LITTLE CELEBRATIONS</div><h1>Making every event <span>extra special<span class="hero-spark">✳</span></span></h1>
  <p>From bouncing castles to sweet treats, we bring the smiles, giggles and magic to your special day.</p>
  <div class="hero-buttons"><a routerLink="/services" class="btn btn-pink btn-large">Book an event <span>↗</span></a><a routerLink="/services" class="btn btn-light btn-large">Explore services <span>→</span></a></div>
  <div class="hero-trust"><div class="avatar-stack"><span>🎈</span><span>🎉</span><span>✨</span></div><div>Made for <b>kiddies parties, family days</b><br/>and every celebration in between</div></div>
  </div><div class="hero-art"><span class="bubble bubble-one"></span><span class="bubble bubble-two"></span><span class="bubble bubble-three"></span><span class="bubble bubble-four"></span><img class="hero-photo" src="https://res.cloudinary.com/dv2hhefed/image/upload/v1793713618/genesis-kiddies-corner/hero/party-setup.jpg" alt="Real birthday event setup with decorated tables, balloons and a party backdrop" fetchpriority="high"/><div class="float-card float-top">🎊 <b>Let's party!</b></div><div class="float-card float-bottom">⭐ <b>Fun, fun, fun!</b></div></div>
</div></section>
<section class="quick-links container"><div class="quick-header"><span>CHOOSE YOUR KIND OF FUN</span><b>Everything for a magical day ✨</b></div><div class="quick-items"><a routerLink="/services" fragment="mascot-characters"><span>🐻</span>Mascots</a><a routerLink="/services" fragment="jumping-castles"><span>🏰</span>Jumping Castles</a><a routerLink="/services" fragment="slush-machine"><span>🥤</span>Slush</a><a routerLink="/services" fragment="ice-cream-machine"><span>🍦</span>Ice Cream</a><a routerLink="/services" fragment="popcorn-machine"><span>🍿</span>Popcorn</a><a routerLink="/services" fragment="candy-floss-machine"><span>🍭</span>Candy Floss</a><a routerLink="/services" fragment="face-painting"><span>🎨</span>Face Painting</a></div></section>
<section class="section container"><div class="section-head"><div><div class="eyebrow pink-text">FUN STARTS HERE</div><h2>Our most-loved <span>services</span></h2><p>Pick the perfect touch for a celebration they'll never forget.</p></div><a routerLink="/services" class="link-arrow">View all services →</a></div>
  @if(api.catalogOffline()) { <div class="notice warning">You're viewing a catalogue preview. Booking requests need the backend to be online.</div> }
  <div class="cards-grid">@for(item of (api.services$ | async)?.slice(0,4); track item.slug){<app-service-card [service]="item" [featured]="$index===0"/>}</div>
</section>
<section class="occasions-section" id="occasions"><div class="container"><div class="section-head centered"><div class="eyebrow pink-text">GOOD TIMES, GREAT MEMORIES</div><h2>Perfect for <span>every occasion</span></h2><p>Big days, little milestones and everything worth celebrating.</p></div><div class="occasion-grid"><div><span>🎂</span><b>Kiddies Parties</b></div><div><span>👨‍👩‍👧</span><b>Family Days</b></div><div><span>🎓</span><b>Graduations</b></div><div><span>🏫</span><b>School Events</b></div><div><span>🎪</span><b>Community Events</b></div><div><span>⛪</span><b>Church Events</b></div></div></div></section>
<section class="section container"><div class="cta-panel"><div><span class="eyebrow">YOUR NEXT CELEBRATION STARTS HERE</span><h2>Ready to make their day <em>amazing?</em></h2><p>Choose your favourites and send a booking request in just a few minutes.</p><a routerLink="/services" class="btn btn-white">Let's get booking ↗</a></div><div class="cta-emoji">🎉</div></div></section>
` })
export class HomePage { api = inject(BookingApiService); }
