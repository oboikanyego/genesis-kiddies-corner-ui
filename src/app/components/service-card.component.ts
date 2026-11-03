import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ServiceItem } from '../core/models';
@Component({ selector: 'app-service-card', standalone: true, imports: [RouterLink,IonicModule,CommonModule], template: `
  <article class="service-card">
    <a [routerLink]="['/services',service.slug]" class="service-photo"><img [src]="service.image" [alt]="service.name" loading="lazy"/><span *ngIf="featured" class="service-label">Popular pick</span></a>
    <div class="service-card-body"><div class="small-category">{{service.category}}</div><h3>{{service.name}}</h3><p>{{service.description}}</p>
      <div class="service-bottom"><div><small>Starting from</small><strong>{{service.price===null?'Get a quote': 'R'+service.price.toLocaleString('en-ZA')}}</strong></div><a class="service-arrow" [routerLink]="['/services',service.slug]" [attr.aria-label]="'View '+service.name">↗</a></div>
    </div>
  </article>` })
export class ServiceCardComponent { @Input({required:true}) service!:ServiceItem; @Input() featured=false; }
