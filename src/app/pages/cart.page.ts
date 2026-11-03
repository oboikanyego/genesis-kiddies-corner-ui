import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingApiService } from '../core/booking-api.service';
import { CartItem } from '../core/models';
import { formatMoney, formatWhen } from '../core/format';
import { IconComponent } from '../components/icon.component';
import { QtyComponent } from '../components/qty.component';
@Component({ selector:'app-cart', standalone:true, imports:[RouterLink,IconComponent,QtyComponent], template: `
<header class="m-bar"><a routerLink="/services" class="m-back" aria-label="Back to services"><app-icon name="back" [size]="28"/></a><h1>Your Booking</h1><span></span></header>
<div class="container cart-wrap">
  <div class="cart-title"><h1>Your Booking</h1>@if(api.cart().length){<span class="count-pill">{{api.cart().length}} {{api.cart().length===1?'item':'items'}}</span>}</div>
  @if(api.cart().length===0){
    <div class="empty-state"><app-icon name="bag" [size]="44" [stroke]="1.6"/><h2>Your booking is empty</h2><p>Choose something fun for your event.</p><a class="btn btn-pink btn-pill" routerLink="/services">Browse Services</a></div>
  } @else {
    <section class="cart-card" aria-label="Selected services">
      @for(item of api.cart();track item.service.slug+'-'+item.mode; let i=$index){
        <article class="cart-item">
          <img [src]="item.service.image" [alt]="item.service.name"/>
          <div class="cart-info">
            <h2>{{item.service.name}}</h2>
            <p class="cart-price">{{linePrice(item)}}</p>
            <p class="cart-meta"><app-icon name="clock" [size]="15"/><span>{{when()}}</span></p>
            <p class="cart-meta"><app-icon name="pin" [size]="15"/><span>{{api.event().type}}</span></p>
          </div>
          <app-qty class="cart-qty" [value]="item.quantity" [min]="1" [max]="item.service.stock" [compact]="true" [label]="item.service.name + ' quantity'" (valueChange)="api.setQuantity(i,$event)"/>
          <button type="button" class="trash-btn" (click)="api.remove(i)" [attr.aria-label]="'Remove ' + item.service.name"><app-icon name="trash" [size]="22"/></button>
        </article>
      }
    </section>
    <div class="cart-footer">
      <div class="cart-total"><span>Estimated Total</span><strong>{{api.totalKnown()?money(api.total()):'To be quoted'}}</strong></div>
      <a routerLink="/book" class="btn btn-pink btn-block btn-lg">Proceed to Booking</a>
      <a routerLink="/services" class="continue-link"><app-icon name="arrow-left" [size]="17" [stroke]="2.2"/> Continue Shopping</a>
    </div>
  }
</div>` })
export class CartPage {
  api=inject(BookingApiService);
  money=formatMoney;
  linePrice(item: CartItem): string { return item.service.price===null?'Price on request':formatMoney(item.service.price*item.quantity); }
  when(): string { const e=this.api.event(); return e.date?formatWhen(e):'Choose your date in the next step'; }
}
