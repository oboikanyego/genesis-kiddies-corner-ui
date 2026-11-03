import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconComponent } from '../components/icon.component';
@Component({ selector:'app-success',standalone:true,imports:[RouterLink,IconComponent],template:`
<div class="container success-wrap">
  <div class="confetti" aria-hidden="true">@for(c of confetti;track $index){<i [style.left.%]="c.x" [style.top.%]="c.y" [style.background]="c.color" [style.transform]="'rotate(' + c.r + 'deg)'" [style.animationDelay.s]="c.d"></i>}</div>
  <div class="success-card">
    <div class="success-icon"><app-icon name="check" [size]="46" [stroke]="3"/></div>
    <h1>Booking Request Submitted!</h1>
    <p class="success-text">Thank you for choosing The Genesis Kiddies Corner.<br class="desk-br"/> Your booking request has been received and is currently pending confirmation.<br class="desk-br"/> We will review the availability and contact you soon.</p>
    <div class="reference-card"><span>Booking Reference</span><div class="reference-line"><strong>{{reference}}</strong><button type="button" (click)="copy()" aria-label="Copy booking reference"><app-icon name="copy" [size]="20"/></button></div>@if(copied()){<small role="status">Copied to clipboard</small>}</div>
    <div class="success-buttons"><a class="btn btn-pink btn-lg" routerLink="/my-bookings">View My Bookings</a><a class="btn btn-outline-pink btn-lg" routerLink="/">Back to Home</a></div>
  </div>
</div>`})
export class SuccessPage {
  route=inject(ActivatedRoute); reference=this.route.snapshot.paramMap.get('reference')||''; copied=signal(false);
  confetti=[
    {x:7,y:12,color:'#ff3d86',r:25,d:0},{x:15,y:30,color:'#3b6bff',r:-30,d:.4},{x:5,y:58,color:'#ffb21f',r:40,d:.8},{x:21,y:6,color:'#27c281',r:70,d:.2},
    {x:28,y:44,color:'#ff3d86',r:-15,d:1.1},{x:36,y:10,color:'#9b87ff',r:55,d:.6},{x:64,y:9,color:'#ffb21f',r:-40,d:.3},{x:72,y:36,color:'#2cc8c8',r:20,d:.9},
    {x:80,y:14,color:'#ff3d86',r:65,d:.5},{x:90,y:28,color:'#ffb21f',r:-25,d:1},{x:94,y:52,color:'#3b6bff',r:35,d:.7},{x:86,y:68,color:'#27c281',r:-60,d:.1},
    {x:12,y:78,color:'#9b87ff',r:15,d:1.2},{x:48,y:5,color:'#ff3d86',r:-50,d:.35},{x:57,y:30,color:'#3b6bff',r:45,d:.85},{x:41,y:62,color:'#ffb21f',r:10,d:.55}
  ];
  async copy(){try{await navigator.clipboard.writeText(this.reference);this.copied.set(true);setTimeout(()=>this.copied.set(false),2200);}catch{/* clipboard unavailable */}}
}
