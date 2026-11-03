import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Booking, BookingPage, BookingRequest, BookingStatus, CartItem, ServiceItem } from './models';
import { DEMO_SERVICES } from './demo-data';
import { servicePhotoFor } from './service-photos';
@Injectable({ providedIn: 'root' })
export class BookingApiService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;
  private cartSubject = new BehaviorSubject<CartItem[]>(this.restoreCart());
  cart$ = this.cartSubject.asObservable();
  cart = signal<CartItem[]>(this.cartSubject.value);
  catalogOffline = signal(false);
  services$ = this.http.get<ServiceItem[]>(`${this.url}/services`).pipe(
    map(items => items.map(item => ({ ...item, image: servicePhotoFor(item) }))),
    tap(() => this.catalogOffline.set(false)),
    catchError(() => { this.catalogOffline.set(true); return of(DEMO_SERVICES); })
  );
  private restoreCart(): CartItem[] {
    try { const arr = JSON.parse(localStorage.getItem('gkc_cart') || '[]'); return Array.isArray(arr) ? arr.filter((i: CartItem)=>i?.service?.slug && i.quantity>0).map((i: CartItem) => ({...i, service: {...i.service, image: servicePhotoFor(i.service)}})) : []; } catch { return []; }
  }
  private updateCart(items: CartItem[]) { this.cartSubject.next(items); this.cart.set(items); localStorage.setItem('gkc_cart',JSON.stringify(items)); }
  add(service: ServiceItem, mode = service.modes[0], quantity = 1): void {
    if (!mode || !service.modes.includes(mode)) return;
    const items = [...this.cartSubject.value];
    const existing = items.find(x=>x.service.slug === service.slug && x.mode === mode);
    if (existing) existing.quantity = Math.min(service.stock, existing.quantity + quantity);
    else items.push({ service, mode, quantity: Math.min(service.stock,quantity) });
    this.updateCart(items);
  }
  quantity(index: number, change: number) {
    const items = [...this.cartSubject.value];
    if (!items[index]) return;
    items[index] = { ...items[index], quantity: Math.max(1, Math.min(items[index].service.stock, items[index].quantity + change)) };
    this.updateCart(items);
  }
  remove(index: number) { this.updateCart(this.cartSubject.value.filter((_,i)=>i!==index)); }
  clear() { this.updateCart([]); }
  totalKnown(items = this.cartSubject.value) { return items.every(i=>i.service.price !== null); }
  total(items = this.cartSubject.value) { return items.reduce((s,i)=>s + (i.service.price ?? 0) * i.quantity,0); }
  sendBooking(data: BookingRequest) { return this.http.post<{ reference:string;status:string;message:string }>(`${this.url}/bookings`,data); }
  track(reference: string, email: string) { return this.http.get<Booking>(`${this.url}/bookings/track`,{params:{reference,email}}); }
  private auth() { return { headers: new HttpHeaders({ Authorization: `Bearer ${sessionStorage.getItem('gkc_admin_token') || ''}` }) }; }
  login(email: string,password: string) { return this.http.post<{token:string}>(`${this.url}/admin/login`,{email,password}).pipe(tap(r=>sessionStorage.setItem('gkc_admin_token',r.token))); }
  loggedIn() { return !!sessionStorage.getItem('gkc_admin_token'); }
  logout() { sessionStorage.removeItem('gkc_admin_token'); }
  adminStats() { return this.http.get<{total:number;pending:number;confirmed:number;completed:number;declined:number;recent:Booking[]}>(`${this.url}/admin/stats`,this.auth()); }
  adminBookings(status?: string,page=1) { return this.http.get<BookingPage>(`${this.url}/admin/bookings`,{ ...this.auth(), params:status?{status,page}:{page} }); }
  adminUpdate(id: string,status: BookingStatus) { return this.http.patch<Booking>(`${this.url}/admin/bookings/${id}/status`,{status},this.auth()); }
  adminServices() { return this.http.get<ServiceItem[]>(`${this.url}/admin/services`,this.auth()); }
  adminSave(service: ServiceItem) { return this.http.patch<ServiceItem>(`${this.url}/admin/services/${service._id}`,service,this.auth()); }
}
