import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServiceItem } from '../core/models';
import { formatMoney } from '../core/format';
@Component({ selector: 'app-service-card', standalone: true, imports: [RouterLink], template: `
  <article class="service-card">
    <a [routerLink]="['/services', service.slug]" class="service-photo" tabindex="-1" aria-hidden="true"><img [src]="service.image" [alt]="service.name"/></a>
    <div class="service-card-body">
      <h3>{{service.name}}</h3>
      <p>{{service.summary || service.description}}</p>
      <strong class="service-price">{{ price }}</strong>
      <a class="btn btn-pink btn-block" [routerLink]="['/services', service.slug]">View Details</a>
    </div>
  </article>` })
export class ServiceCardComponent {
  @Input({ required: true }) service!: ServiceItem;
  get price(): string { return this.service.price === null ? 'Price on request' : 'From ' + formatMoney(this.service.price); }
}
